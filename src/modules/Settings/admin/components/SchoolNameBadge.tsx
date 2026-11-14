'use client';

import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';

import { settingsService } from '@/modules/Settings/services/settingsService';

const CACHE_KEY = 'school_profile_display_name';

/**
 * Nom de l'établissement dans la barre supérieure (espace admin du lycée uniquement).
 * Lu via GET /admin/settings/school-profile (autorisé pour tous les rôles), mis en cache de session.
 */
export const SchoolNameBadge = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.pathname.includes('/superadmin') || !localStorage.getItem('auth_token')) {
      return;
    }

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);

      if (cached) setName(cached);
    } catch {
      // stockage indisponible : on se contente de l'appel API
    }

    settingsService
      .getSchoolProfile()
      .then((profile) => {
        setName(profile.display_name);
        document.title = `${profile.short_name || profile.display_name} — Jandoo`;

        try {
          sessionStorage.setItem(CACHE_KEY, profile.display_name);
        } catch {
          // ignore
        }
      })
      .catch(() => undefined);
  }, []);

  if (!name) return null;

  return (
    <Typography
      variant='subtitle1'
      fontWeight={600}
      color='text.primary'
      noWrap
      title={name}
      sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 360 }}
    >
      {name}
    </Typography>
  );
};
