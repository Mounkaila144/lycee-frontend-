import { createApiClient } from '@/shared/lib/api-client';
import { LoginCredentials, LoginResponse, User } from '../../types/auth.types';
import { ApiResponse } from '@/shared/types/api.types';
import type { RefreshTokenResponse } from '@/shared/types/token.types';

class AdminAuthService {
    /**
     * Login admin user
     * Le domaine est détecté automatiquement par Laravel via le Host header
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const client = createApiClient();

        // Format exact attendu par le backend
        const response = await client.post<LoginResponse>(
            '/admin/auth/login',
            {
                username: credentials.username,
                password: credentials.password,
                application: credentials.application,
            }
        );

        if (response.data.success && response.data.data.token) {
            localStorage.setItem('auth_token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            localStorage.setItem('tenant', JSON.stringify(response.data.data.tenant));
            
            // Store tenant_id separately for TenantContext
            if (response.data.data.tenant?.id) {
                localStorage.setItem('tenant_id', String(response.data.data.tenant.id));
            }
            
            // Store tenant_domain for TenantContext
            if (response.data.data.tenant?.host) {
                localStorage.setItem('tenant_domain', response.data.data.tenant.host);
            }
        }

        return response.data;
    }

    /**
     * Refresh the authentication token
     * Called automatically by the API client when a 401 error is received
     */
    async refreshToken(): Promise<RefreshTokenResponse> {
        const client = createApiClient();

        const response = await client.post<RefreshTokenResponse>(
            '/admin/auth/refresh',
            {}
        );

        if (response.data.success && response.data.data.token) {
            localStorage.setItem('auth_token', response.data.data.token);
            console.log('🔑 [AdminAuthService] Token refreshed and stored');
        }

        return response.data;
    }

    async logout(): Promise<void> {
        const client = createApiClient();

        try {
            await client.post('/admin/auth/logout');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('tenant');
            localStorage.removeItem('tenant_id');
            localStorage.removeItem('tenant_domain');
        }
    }

    async getCurrentUser(): Promise<User> {
        const client = createApiClient();
        const response = await client.get<ApiResponse<{user: User}>>('/admin/auth/me');

        if (response.data.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        return response.data.data.user;
    }

    getStoredUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    getStoredToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }
}

export const adminAuthService = new AdminAuthService();
