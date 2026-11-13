'use client';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

/**
 * L'ancien gestionnaire de menus (MenuManager) appelait `/api/admin/menus`,
 * endpoint qui n'existe pas côté Laravel. Les menus sont désormais définis
 * dans le code (`src/modules/<Module>/menu.config.ts`, agrégés par
 * `src/shared/config/menu-registry.ts`) et filtrés par rôle.
 */
export default function MenuManagementPage() {
  return (
    <Card>
      <CardHeader title='Gestion des menus' />
      <CardContent>
        <Alert severity='info'>
          Les menus de navigation sont définis par module dans l&apos;application et filtrés automatiquement selon le
          rôle de l&apos;utilisateur. Ils ne sont pas modifiables depuis cette interface.
        </Alert>
      </CardContent>
    </Card>
  );
}
