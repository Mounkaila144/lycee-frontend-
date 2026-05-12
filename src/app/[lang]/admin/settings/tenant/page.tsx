'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import { settingsService } from '@/modules/Settings/services/settingsService';
import { SettingFormDialog } from '@/modules/Settings/admin/components/SettingFormDialog';
import type { TenantSetting } from '@/modules/Settings/types/settings.types';

export default function TenantSettingsPage() {
  const [rows, setRows] = useState<TenantSetting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TenantSetting | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    settingsService
      .list()
      .then(setRows)
      .catch((e) =>
        setError(e?.response?.data?.message ?? 'Erreur de chargement.')
      );
  }, [refreshKey]);

  const handleDelete = async (key: string) => {
    if (!confirm(`Supprimer le réglage "${key}" ?`)) return;
    try {
      await settingsService.remove(key);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erreur de suppression.');
    }
  };

  return (
    <Card>
      <CardHeader
        title='Réglages de l’établissement'
        subheader='Story Admin 13'
        action={
          <Button
            variant='contained'
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Nouveau réglage
          </Button>
        }
      />
      <CardContent>
        {error && <Alert severity='error'>{error}</Alert>}
        {rows.length === 0 && !error && (
          <Alert severity='info'>Aucun réglage configuré.</Alert>
        )}
        {rows.length > 0 && (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Catégorie</TableCell>
                <TableCell>Clé</TableCell>
                <TableCell>Valeur</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.category && <Chip label={s.category} size='small' />}</TableCell>
                  <TableCell>
                    <code>{s.key}</code>
                  </TableCell>
                  <TableCell>{s.value ?? <em>(null)</em>}</TableCell>
                  <TableCell>
                    <Chip label={s.type} size='small' variant='outlined' />
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      size='small'
                      onClick={() => {
                        setEditing(s);
                        setDialogOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button size='small' color='error' onClick={() => handleDelete(s.key)}>
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <SettingFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
        setting={editing}
      />
    </Card>
  );
}
