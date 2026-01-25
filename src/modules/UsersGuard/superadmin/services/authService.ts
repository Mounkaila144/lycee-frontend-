import { createApiClient } from '@/shared/lib/api-client';
import { LoginCredentials, LoginResponse, User } from '../../types/auth.types';
import { ApiResponse } from '@/shared/types/api.types';
import type { RefreshTokenResponse } from '@/shared/types/token.types';

class SuperadminAuthService {
    /**
     * Login superadmin user
     * Le superadmin n'a pas de contexte tenant
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const client = createApiClient();

        // Format exact attendu par le backend
        const response = await client.post<LoginResponse>(
            '/superadmin/auth/login',
            {
                username: credentials.username,
                password: credentials.password,
                application: credentials.application,
            }
        );

        if (response.data.success && response.data.data.token) {
            localStorage.setItem('superadmin_auth_token', response.data.data.token);
            localStorage.setItem('superadmin_user', JSON.stringify(response.data.data.user));
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
            '/superadmin/auth/refresh',
            {}
        );

        if (response.data.success && response.data.data.token) {
            localStorage.setItem('superadmin_auth_token', response.data.data.token);
            console.log('🔑 [SuperadminAuthService] Token refreshed and stored');
        }

        return response.data;
    }

    async logout(): Promise<void> {
        const client = createApiClient();

        try {
            await client.post('/superadmin/auth/logout');
        } finally {
            localStorage.removeItem('superadmin_auth_token');
            localStorage.removeItem('superadmin_user');
        }
    }

    async getCurrentUser(): Promise<User> {
        const client = createApiClient();
        const response = await client.get<ApiResponse<{user: User}>>('/superadmin/auth/me');

        if (response.data.data?.user) {
            localStorage.setItem('superadmin_user', JSON.stringify(response.data.data.user));
        }

        return response.data.data.user;
    }

    getStoredUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('superadmin_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    getStoredToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('superadmin_auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }
}

export const superadminAuthService = new SuperadminAuthService();
