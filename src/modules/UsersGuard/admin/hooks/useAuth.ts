
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '../services/authService';
import { AuthState, LoginCredentials } from '../../types/auth.types';
import { AxiosError } from 'axios';
import { usePermissionsOptional } from '@/shared/contexts/PermissionsContext';
import { extractPermissionsFromLogin } from '@/shared/lib/permissions/extractPermissions';

interface UseAuthReturn extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    error: string | null;
}

/**
 * Resolve the landing route after login based on the user's roles.
 * Each role is sent to a page it can actually access (avoids landing
 * non-admin roles on /admin/users, which returns 403).
 */
const resolveLandingRoute = (groups: string[]): string => {
    const has = (role: string) => groups.includes(role);

    if (has('Administrator') || has('Manager')) return '/admin/users';
    if (has('Comptable')) return '/admin/finance/invoices';
    if (has('Caissier')) return '/admin/finance/payments';
    if (has('Professeur')) return '/admin/dashboard';
    if (has('Parent')) return '/admin/parent/home';
    if (has('Élève')) return '/admin/student/home';

    return '/admin/dashboard';
};

export const useAuth = (): UseAuthReturn => {
    const router = useRouter();
    const permissionsContext = usePermissionsOptional();

    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = adminAuthService.getStoredToken();
        const user = adminAuthService.getStoredUser();
        const tenantStr = localStorage.getItem('tenant');
        let tenant = null;
        if (tenantStr) {
            try {
                tenant = JSON.parse(tenantStr);
            } catch (e) {
                // ignore
            }
        }

        setState({
            user,
            token,
            tenant,
            isAuthenticated: !!token,
            isLoading: false,
        });
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setError(null);
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await adminAuthService.login(credentials);

            if (response.success) {
                setState({
                    user: response.data.user,
                    token: response.data.token,
                    tenant: response.data.tenant,
                    isAuthenticated: true,
                    isLoading: false,
                });

                // Extract permissions/roles from the login response (NO additional API request!)
                const extracted = extractPermissionsFromLogin(response);
                if (permissionsContext) {
                    permissionsContext.setPermissions(extracted);
                }

                // Redirect to a landing page appropriate for the user's role.
                // Prefer the backend-computed home_route (config/role-routes.php),
                // fall back to a role-based resolution from the user's roles.
                const loggedUser: any = response.data.user;
                const landingRoute =
                    loggedUser?.home_route || resolveLandingRoute(loggedUser?.roles ?? []);
                // home_route has no locale prefix: keep the current one, otherwise
                // the i18n middleware falls back to the default locale (en).
                const currentLocale = window.location.pathname.split('/')[1] || 'fr';
                const localizedLanding = /^\/(fr|en|ar)(\/|$)/.test(landingRoute)
                    ? landingRoute
                    : `/${currentLocale}${landingRoute.startsWith('/') ? '' : '/'}${landingRoute}`;
                router.push(localizedLanding);
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            let errorMessage = 'An error occurred during login';

            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
            }

            setError(errorMessage);
            setState(prev => ({ ...prev, isLoading: false }));
            throw err;
        }
    }, [router, permissionsContext]);

    const logout = useCallback(async () => {
        setError(null);

        try {
            await adminAuthService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear permissions
            if (permissionsContext) {
                permissionsContext.clearPermissions();
            }

            setState({
                user: null,
                token: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
            });

            // Get current locale from URL
            const currentPath = window.location.pathname;
            const locale = currentPath.split('/')[1] || 'en';
            router.push(`/${locale}/login`);
        }
    }, [router, permissionsContext]);

    const refreshUser = useCallback(async () => {
        if (!state.isAuthenticated) return;

        try {
            const user = await adminAuthService.getCurrentUser();
            setState(prev => ({ ...prev, user }));
        } catch (err) {
            console.error('Failed to refresh user:', err);
            if ((err as AxiosError).response?.status === 401) {
                await logout();
            }
        }
    }, [state.isAuthenticated, logout]);

    return {
        ...state,
        login,
        logout,
        refreshUser,
        error,
    };
};
