'use client';

import { useEffect, useState } from 'react';

export interface LyceeCurrentUser {
  id: number | null;
  roles: string[];
  isManager: boolean;
  isTeacher: boolean;
}

const EMPTY_USER: LyceeCurrentUser = { id: null, roles: [], isManager: false, isTeacher: false };

/**
 * Utilisateur connecté (id + rôles Spatie) lu depuis le localStorage, SSR-safe.
 * `isManager` = Administrator ou Manager (droits de publication / gestion).
 */
export function useCurrentUser(): { user: LyceeCurrentUser; ready: boolean } {
  const [user, setUser] = useState<LyceeCurrentUser>(EMPTY_USER);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const roles: string[] = Array.isArray(parsed?.roles)
        ? parsed.roles.map((role: string | { name: string }) => (typeof role === 'string' ? role : role.name))
        : [];

      setUser({
        id: typeof parsed?.id === 'number' ? parsed.id : parsed?.id ? Number(parsed.id) : null,
        roles,
        isManager: roles.includes('Administrator') || roles.includes('Manager'),
        isTeacher: roles.includes('Professeur'),
      });
    } catch {
      setUser(EMPTY_USER);
    } finally {
      setReady(true);
    }
  }, []);

  return { user, ready };
}
