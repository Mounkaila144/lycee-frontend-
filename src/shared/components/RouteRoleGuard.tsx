'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { getAllFlatMenus } from '@/shared/config/menu-registry';
import { userCanSeeMenu } from '@/shared/lib/auth/filterMenuItems';
import type { AuthUser } from '@/shared/lib/auth/filterMenuItems';
import type { MenuConfig } from '@/shared/types/menu-config.types';

const LOCALE_PATTERN = /^\/(fr|en|ar)(?=\/|$)/;

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem('user');
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed) {
      return null;
    }

    const normalize = (values: unknown): string[] =>
      Array.isArray(values)
        ? values.map((value: string | { name: string }) => (typeof value === 'string' ? value : value.name))
        : [];

    return { roles: normalize(parsed.roles), permissions: normalize(parsed.permissions) };
  } catch {
    return null;
  }
}

/**
 * Entrées de menu dont la route est le plus long préfixe (au niveau des segments)
 * du chemin courant, et qui déclarent explicitement des `requiredRoles`.
 */
function findGoverningMenus(path: string): MenuConfig[] {
  const candidates = getAllFlatMenus().filter((menu) => {
    if (!menu.route || !menu.requiredRoles?.length) {
      return false;
    }

    return path === menu.route || path.startsWith(`${menu.route}/`);
  });

  if (!candidates.length) {
    return [];
  }

  const longest = Math.max(...candidates.map((menu) => menu.route!.length));

  return candidates.filter((menu) => menu.route!.length === longest);
}

/**
 * Affiche « Accès refusé » quand l'utilisateur ouvre une page réservée (d'après
 * les `requiredRoles` des menus) à d'autres rôles. Le backend reste la vraie
 * protection : ce garde évite seulement des écrans vides ou en erreur.
 */
export default function RouteRoleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    setUser(readStoredUser());
  }, [pathname]);

  const path = pathname.replace(LOCALE_PATTERN, '') || '/';
  const locale = pathname.match(LOCALE_PATTERN)?.[1] ?? 'fr';

  const isDenied = useMemo(() => {
    if (!user) {
      return false;
    }

    const governing = findGoverningMenus(path);

    return governing.length > 0 && !governing.some((menu) => userCanSeeMenu(menu, user));
  }, [path, user]);

  if (!isDenied) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ py: 10, px: 4, textAlign: 'center' }}>
      <Typography variant='h4' sx={{ mb: 2 }}>
        Accès refusé
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 4 }}>
        Votre rôle ne vous permet pas d&apos;accéder à cette page.
      </Typography>
      <Button variant='contained' href={`/${locale}/admin/dashboard`}>
        Retour à l&apos;accueil
      </Button>
    </Box>
  );
}
