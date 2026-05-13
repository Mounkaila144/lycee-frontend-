'use client';

import { useEffect, useState } from 'react';
import type { AuthUser } from '@/shared/lib/auth/filterMenuItems';

/**
 * Lit le user (rôles Spatie + permissions) depuis le localStorage de manière
 * SSR-safe. Le user est rafraîchi quand un autre onglet/page le modifie via
 * l'événement `storage`.
 */
export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const read = (): AuthUser | null => {
      if (typeof window === 'undefined') {
        return null;
      }

      try {
        const raw = window.localStorage.getItem('user');
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw);
        return {
          roles: Array.isArray(parsed?.roles) ? parsed.roles : [],
          permissions: Array.isArray(parsed?.permissions) ? parsed.permissions : [],
        };
      } catch {
        return null;
      }
    };

    setUser(read());

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'user' || event.key === null) {
        setUser(read());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return user;
}
