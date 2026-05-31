'use client';

import React, { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';

import { settingsService, type SchoolProfile } from '@/modules/Settings/services/settingsService';

const FIELDS: { key: keyof SchoolProfile; label: string; type?: string }[] = [
  { key: 'name', label: "Nom de l'établissement" },
  { key: 'nif', label: 'NIF (identifiant fiscal)' },
  { key: 'rccm', label: 'RCCM' },
  { key: 'address', label: 'Adresse' },
  { key: 'city', label: 'Ville' },
  { key: 'bp', label: 'Boîte postale (BP)' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Site web' },
];

const EMPTY: SchoolProfile = {
  name: '', nif: '', rccm: '', address: '', city: '', bp: '', phone: '', email: '', website: '', logo: null,
};

export const SchoolProfileSettings: React.FC = () => {
  const [form, setForm] = useState<SchoolProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const fileInput = useRef<HTMLInputElement>(null);
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    settingsService
      .getSchoolProfile()
      .then(p => setForm({ ...EMPTY, ...p }))
      .catch(() => notify('Erreur de chargement du profil.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof SchoolProfile, value: string) => setForm(f => ({ ...f, [key]: value }));

  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      FIELDS.forEach(({ key }) => fd.append(key, (form[key] as string) ?? ''));
      if (logoFile) fd.append('logo', logoFile);
      const updated = await settingsService.updateSchoolProfile(fd);
      setForm({ ...EMPTY, ...updated });
      setLogoFile(null);
      setLogoPreview(null);
      notify('Profil de l’établissement enregistré.');
    } catch (e: any) {
      const errors = e?.response?.data?.errors;
      const first = errors ? (Object.values(errors)[0] as string[])?.[0] : undefined;
      notify(first ?? e?.response?.data?.message ?? "Échec de l'enregistrement.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentLogo = logoPreview ?? form.logo;

  if (loading) {
    return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Paramètres de l’établissement</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Ces informations (logo, nom, NIF, coordonnées) apparaissent sur les documents générés (factures, reçus…).
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Logo" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentLogo ?? undefined}
                  variant="rounded"
                  sx={{ width: 140, height: 140, bgcolor: 'action.hover', color: 'text.disabled' }}
                >
                  {!currentLogo && 'Logo'}
                </Avatar>
                <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPickLogo} />
                <Button variant="outlined" onClick={() => fileInput.current?.click()}>
                  Choisir un logo
                </Button>
                <Typography variant="caption" color="text.secondary" align="center">
                  PNG, JPG ou WEBP — max 1 Mo.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title="Identité & coordonnées" />
            <CardContent>
              <Grid container spacing={2}>
                {FIELDS.map(f => (
                  <Grid key={f.key} size={{ xs: 12, sm: f.key === 'address' ? 12 : 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type={f.type ?? 'text'}
                      label={f.label}
                      value={(form[f.key] as string) ?? ''}
                      onChange={e => setField(f.key, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" disabled={saving} onClick={handleSave}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
