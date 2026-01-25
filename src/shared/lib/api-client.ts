import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

import type { ApiError } from '../types/api.types';
import type { AuthContext, RefreshTokenResponse, RetryableRequestConfig } from '../types/token.types';

import { tokenRefreshManager } from './token-refresh-manager';

/**
 * Detect if we're in a superadmin context
 */
const isSuperadminContext = (): boolean => {
    if (typeof window === 'undefined') return false;

    return window.location.pathname.includes('/superadmin');
};

/**
 * Get the current auth context
 */
const getAuthContext = (): AuthContext => {
    return isSuperadminContext() ? 'superadmin' : 'admin';
};

/**
 * Get the auth token based on context
 * Uses localStorage for custom authentication
 */
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Get token from localStorage based on context
    if (isSuperadminContext()) {
        return localStorage.getItem('superadmin_auth_token');
    }

    return localStorage.getItem('auth_token');
};

/**
 * Get the tenant ID from localStorage
 */
const getTenantId = (): string | null => {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem('tenant_id');
};

/**
 * Get the current locale for Accept-Language header
 * Uses the [lang] system of the Next.js template
 * Returns a simple format: fr, en, ar (not fr_FR or fr-FR)
 */
const getCurrentLocale = (): string => {
    if (typeof window === 'undefined') return 'en';

    // Extract language from template URL: /en/admin, /fr/superadmin, etc.
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const langFromUrl = pathParts[0];

    if (['en', 'fr', 'ar'].includes(langFromUrl)) {
        return langFromUrl;
    }

    // Fallback to localStorage if needed
    const locale = localStorage.getItem('app_language') || 'en';

    return locale.split('_')[0].split('-')[0].toLowerCase();
};

/**
 * Clear auth data based on context
 */
const clearAuthData = (): void => {
    if (typeof window === 'undefined') return;

    if (isSuperadminContext()) {
        localStorage.removeItem('superadmin_auth_token');
        localStorage.removeItem('superadmin_user');
    } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
    }
};

/**
 * Update stored token after refresh
 */
const updateStoredToken = (token: string): void => {
    if (typeof window === 'undefined') return;

    if (isSuperadminContext()) {
        localStorage.setItem('superadmin_auth_token', token);
    } else {
        localStorage.setItem('auth_token', token);
    }

    console.log('🔑 [API Client] Token updated in storage');
};

/**
 * Get login URL based on context
 * Integrates with the [lang] system of the template
 */
const getLoginUrl = (): string => {
    const locale = getCurrentLocale();

    // All contexts use the same login page
    return `/${locale}/login`;
};

/**
 * Perform token refresh by calling the appropriate auth service
 */
const performTokenRefresh = async (context: AuthContext): Promise<RefreshTokenResponse> => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const endpoint = context === 'superadmin'
        ? '/superadmin/auth/refresh'
        : '/admin/auth/refresh';

    console.log('🔄 [API Client] Attempting token refresh for context:', context);

    // Get current token to send with refresh request
    const currentToken = getAuthToken();

    const response = await axios.post<RefreshTokenResponse>(
        `${baseURL}${endpoint}`,
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
                ...(context === 'admin' && getTenantId() ? { 'X-Tenant-ID': getTenantId() } : {}),
            },
            withCredentials: true,
        }
    );

    // If successful, update the stored token
    if (response.data.success && response.data.data.token) {
        updateStoredToken(response.data.data.token);
    }

    return response.data;
};

/**
 * Handle logout and redirect to login page
 */
const handleLogout = (): void => {
    clearAuthData();
    tokenRefreshManager.reset();

    if (typeof window !== 'undefined') {
        window.location.href = getLoginUrl();
    }
};

// Initialize the token refresh manager with our refresh function
tokenRefreshManager.setRefreshFunction(performTokenRefresh);

/**
 * Get the API base URL for constructing direct links (e.g., file downloads)
 */
export const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_URL || '/api';
};

/**
 * Create an API client instance
 * The API is on the same domain, no need for X-Tenant-ID!
 * The domain is automatically detected by Laravel
 * @param tenantId - Optional tenant ID (kept for compatibility, not used)
 */
export const createApiClient = (tenantId?: string): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        withCredentials: true, // Important for cookies
    });

    // Request interceptor to add auth token, tenant ID, and locale
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            if (config.headers) {
                // Add auth token
                const token = getAuthToken();

                console.log('🔑 [API Client] Token check:', {
                    hasToken: !!token,
                    tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
                    url: config.url,
                    isSuperadmin: isSuperadminContext()
                });

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add X-Tenant-ID header for multi-tenancy (if not superadmin context)
                if (!isSuperadminContext()) {
                    const tenantId = getTenantId();

                    if (tenantId) {
                        config.headers['X-Tenant-ID'] = tenantId;
                    }

                    console.log('🏢 [API Client] Tenant ID:', tenantId);
                }

                // Add Accept-Language header with current locale
                const locale = getCurrentLocale();

                config.headers['Accept-Language'] = locale;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling with token refresh
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError<ApiError>) => {
            const originalRequest = error.config as RetryableRequestConfig;

            // Only handle 401 errors
            if (error.response?.status !== 401) {
                return Promise.reject(error);
            }

            const requestUrl = originalRequest?.url || '';

            console.log('🚫 [API Client] 401 error on:', requestUrl);

            // Check if this endpoint is excluded from token refresh
            if (tokenRefreshManager.isExcludedEndpoint(requestUrl)) {
                console.log('⏭️ [API Client] Endpoint excluded from refresh:', requestUrl);

                return Promise.reject(error);
            }

            // Check if this request has already been retried
            if (originalRequest._retry) {
                console.log('🔁 [API Client] Request already retried, logging out');
                handleLogout();

                return Promise.reject(error);
            }

            // Mark request as retried
            originalRequest._retry = true;

            try {
                const context = getAuthContext();

                // Attempt to refresh the token
                const newToken = await tokenRefreshManager.refreshToken(context);

                console.log('🔄 [API Client] Retrying request with new token');

                // Update the original request with the new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    originalRequest.headers = { Authorization: `Bearer ${newToken}` };
                }

                // Retry the original request
                return client(originalRequest);
            } catch (refreshError) {
                console.error('❌ [API Client] Token refresh failed:', refreshError);
                handleLogout();

                return Promise.reject(refreshError);
            }
        }
    );

    return client;
};

/**
 * Default API client
 */
export const apiClient = createApiClient();
