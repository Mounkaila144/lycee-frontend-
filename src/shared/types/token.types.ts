import type { AxiosRequestConfig } from 'axios';

/**
 * Configuration for token refresh behavior
 */
export interface TokenRefreshConfig {
    /** Endpoints excluded from token refresh logic */
    excludedEndpoints: string[];
    /** Maximum number of refresh attempts before giving up */
    maxRefreshAttempts: number;
    /** Key used to mark requests as retry attempts */
    retryFlagKey: string;
}

/**
 * Response from the refresh token endpoint
 */
export interface RefreshTokenResponse {
    success: boolean;
    data: {
        token: string;
        expires_at?: string;
    };
    message?: string;
}

/**
 * Request waiting for token refresh to complete
 */
export interface QueuedRequest {
    /** Resolve function to continue the request with new token */
    resolve: (token: string) => void;
    /** Reject function to fail the request */
    reject: (error: Error) => void;
}

/**
 * Extended Axios request config with retry flag
 */
export interface RetryableRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
}

/**
 * Context for determining which auth service to use
 */
export type AuthContext = 'admin' | 'superadmin';

/**
 * Token storage keys by context
 */
export interface TokenStorageKeys {
    token: string;
    user: string;
    tenant?: string;
    tenantId?: string;
    tenantDomain?: string;
}

/**
 * Default token refresh configuration
 */
export const DEFAULT_TOKEN_REFRESH_CONFIG: TokenRefreshConfig = {
    excludedEndpoints: [
        '/auth/login',
        '/auth/logout',
        '/auth/refresh',
        '/auth/register',
        '/admin/auth/login',
        '/admin/auth/logout',
        '/admin/auth/refresh',
        '/admin/auth/register',
        '/superadmin/auth/login',
        '/superadmin/auth/logout',
        '/superadmin/auth/refresh',
        '/superadmin/auth/register',
    ],
    maxRefreshAttempts: 1,
    retryFlagKey: '_retry',
};
