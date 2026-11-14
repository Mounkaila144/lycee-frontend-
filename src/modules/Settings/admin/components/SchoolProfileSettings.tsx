'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { settingsService } from '@/modules/Settings/services/settingsService';
import type {
  SchoolImageKind,
  SchoolProfile,
  SchoolProfileInput,
  SchoolType,
} from '@/modules/Settings/types/settings.types';

const SCHOOL_TYPES: SchoolType[] = ['Lycée', 'CEG', 'Collège', 'Complexe scolaire'];

type FieldKey = keyof SchoolProfileInput;

interface FieldDefinition {
  key: FieldKey;
  label: string;
  helper?: string;
  type?: string;
  multiline?: boolean;
  full?: boolean;
  select?: string[];
}

interface Section {
  title: string;
  subheader: string;
  fields: FieldDefinition[];
}

const SECTIONS: Section[] = [
  {
    title: 'Identité',
    subheader: "Nom tel qu'il doit apparaître sur les bulletins, attestations et reçus",
    fields: [
      { key: 'name', label: "Nom officiel de l'établissement", helper: 'Ex. : Lycée Issa Korombé', full: true },
      { key: 'short_name', label: 'Sigle / nom court', helper: 'Ex. : LIK' },
      { key: 'type', label: "Type d'établissement", select: SCHOOL_TYPES },
      { key: 'motto', label: 'Devise / slogan', full: true },
      { key: 'authorization_number', label: "N° d'autorisation / agrément", helper: "Ex. : Arrêté n° …/MEN", full: true },
    ],
  },
  {
    title: 'Tutelle et en-tête officiel',
    subheader: 'Bloc affiché en haut à gauche des documents',
    fields: [
      {
        key: 'official_header',
        label: 'En-tête officiel (une ligne par retour à la ligne)',
        multiline: true,
        full: true,
        helper: 'Par défaut : République du Niger / devise nationale / Ministère.',
      },
      { key: 'region', label: 'Direction régionale (DREN)', helper: "Ex. : Direction Régionale de l'Éducation de Niamey" },
      { key: 'inspection', label: 'Inspection', helper: "Ex. : Inspection de l'enseignement secondaire Niamey II" },
    ],
  },
  {
    title: 'Coordonnées',
    subheader: 'Affichées sous le nom et en pied de page',
    fields: [
      { key: 'address', label: 'Adresse / quartier', full: true },
      { key: 'city', label: 'Ville', helper: 'Utilisée pour « Fait à …, le … »' },
      { key: 'po_box', label: 'Boîte postale (BP)' },
      { key: 'phone', label: 'Téléphone' },
      { key: 'phone_secondary', label: 'Second téléphone' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'website', label: 'Site web' },
    ],
  },
  {
    title: 'Direction',
    subheader: 'Signataires des bulletins et attestations',
    fields: [
      { key: 'head_title', label: "Titre du chef d'établissement", helper: 'Ex. : Le Proviseur, Le Directeur' },
      { key: 'head_name', label: "Nom du chef d'établissement" },
      { key: 'censor_name', label: 'Nom du censeur' },
    ],
  },
  {
    title: 'Paramètres régionaux',
    subheader: 'Pays et monnaie utilisés sur les documents financiers',
    fields: [
      { key: 'country', label: 'Pays' },
      { key: 'currency', label: 'Devise monétaire', helper: 'Ex. : FCFA' },
    ],
  },
];

const ALL_FIELDS: FieldKey[] = SECTIONS.flatMap((section) => section.fields.map((field) => field.key));

const emptyForm = (): Record<FieldKey, string> =>
  ALL_FIELDS.reduce((acc, key) => ({ ...acc, [key]: '' }), {} as Record<FieldKey, string>);

const toForm = (profile: SchoolProfile): Record<FieldKey, string> =>
  ALL_FIELDS.reduce((acc, key) => ({ ...acc, [key]: (profile[key] as string | null) ?? '' }), emptyForm());

const IMAGE_LABELS: Record<SchoolImageKind, { title: string; help: string }> = {
  logo: { title: 'Logo', help: "Affiché au centre de l'en-tête des documents. PNG, JPG ou WEBP, 2 Mo max." },
  stamp: {
    title: 'Cachet / signature (optionnel)',
    help: "Image (fond transparent conseillé) apposée au-dessus du nom du chef d'établissement.",
  },
};

interface ImageCardProps {
  kind: SchoolImageKind;
  url: string | null;
  busy: boolean;
  onPick: (kind: SchoolImageKind, file: File) => void;
  onDelete: (kind: SchoolImageKind) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ kind, url, busy, onPick, onDelete }) => {
  const input = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader title={IMAGE_LABELS[kind].title} />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 160,
              height: 120,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
            }}
          >
            {url ? (
              <Box component='img' src={url} alt={IMAGE_LABELS[kind].title} sx={{ maxWidth: 150, maxHeight: 110 }} />
            ) : (
              <Typography variant='caption' color='text.disabled'>
                Aucune image
              </Typography>
            )}
          </Box>
          <input
            ref={input}
            type='file'
            accept='image/png,image/jpeg,image/webp'
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) onPick(kind, file);
              event.target.value = '';
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant='outlined' size='small' disabled={busy} onClick={() => input.current?.click()}>
              {url ? 'Remplacer' : 'Choisir une image'}
            </Button>
            {url && (
              <Button color='error' size='small' disabled={busy} onClick={() => onDelete(kind)}>
                Supprimer
              </Button>
            )}
          </Box>
          <Typography variant='caption' color='text.secondary' align='center'>
            {IMAGE_LABELS[kind].help}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

interface HeaderPreviewProps {
  form: Record<FieldKey, string>;
  logoUrl: string | null;
  fallbackName: string;
}

/** Aperçu fidèle (simplifié) de l'en-tête des bulletins PDF. */
const HeaderPreview: React.FC<HeaderPreviewProps> = ({ form, logoUrl, fallbackName }) => {
  const lines = form.official_header
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const poBox = form.po_box && !/^\s*B\.?\s?P\b/i.test(form.po_box) ? `BP ${form.po_box}` : form.po_box;
  const phones = [form.phone, form.phone_secondary].filter(Boolean).join(' / ');

  return (
    <Box sx={{ bgcolor: '#fff', color: '#222', p: 3, borderRadius: 1, border: 1, borderColor: 'divider', fontSize: 12 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', borderBottom: '2px solid #1a3d7c', pb: 1.5 }}>
        <Box sx={{ flex: '0 0 37%', textAlign: 'center', lineHeight: 1.4 }}>
          {lines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ fontWeight: index === 0 ? 700 : 400, fontStyle: index === 1 ? 'italic' : 'normal' }}>
              {line}
            </div>
          ))}
          {form.region && <div>{form.region}</div>}
          {form.inspection && <div>{form.inspection}</div>}
        </Box>
        <Box sx={{ flex: '0 0 20%', textAlign: 'center' }}>
          {logoUrl && <Box component='img' src={logoUrl} alt='Logo' sx={{ maxHeight: 70, maxWidth: 100 }} />}
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center', lineHeight: 1.4 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3d7c', textTransform: 'uppercase' }}>
            {form.name || fallbackName}
          </div>
          {form.short_name && <div style={{ fontWeight: 700 }}>({form.short_name})</div>}
          {form.motto && <div style={{ fontStyle: 'italic' }}>« {form.motto} »</div>}
          {(poBox || form.city) && <div>{[poBox, form.city].filter(Boolean).join(' – ')}</div>}
          {phones && <div>Tél. : {phones}</div>}
          {form.email && <div>{form.email}</div>}
          {form.authorization_number && (
            <div style={{ fontSize: 11, color: '#555' }}>Autorisation : {form.authorization_number}</div>
          )}
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a3d7c', letterSpacing: 1 }}>BULLETIN DE NOTES — 1ER SEMESTRE</div>
        <div>Année scolaire …</div>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, fontSize: 11 }}>
        <span>Le Professeur principal</span>
        <span style={{ textAlign: 'center' }}>
          Fait à {form.city || '……'}, le …<br />
          <strong>{form.head_title || 'Le Proviseur'}</strong>
          <br />
          {form.head_name}
        </span>
      </Box>
    </Box>
  );
};

export const SchoolProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [form, setForm] = useState<Record<FieldKey, string>>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<SchoolImageKind, string | null>>({ logo: null, stamp: null });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadImages = useCallback(async (current: SchoolProfile) => {
    const next: Record<SchoolImageKind, string | null> = { logo: null, stamp: null };

    await Promise.all(
      (['logo', 'stamp'] as SchoolImageKind[]).map(async (kind) => {
        if (current[`has_${kind}`]) {
          next[kind] = await settingsService.fetchSchoolImage(kind).catch(() => null);
        }
      })
    );

    setImageUrls((previous) => {
      Object.values(previous).forEach((url) => url && URL.revokeObjectURL(url));
      
return next;
    });
  }, []);

  useEffect(() => {
    settingsService
      .getSchoolProfile()
      .then((data) => {
        setProfile(data);
        setForm(toForm(data));
        
return loadImages(data);
      })
      .catch((e) => setLoadError(e?.response?.data?.message ?? 'Erreur de chargement du profil.'))
      .finally(() => setLoading(false));
  }, [loadImages]);

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      const payload = ALL_FIELDS.reduce(
        (acc, key) => ({ ...acc, [key]: form[key].trim() === '' ? null : form[key] }),
        {} as Partial<SchoolProfileInput>
      );

      const updated = await settingsService.updateSchoolProfile(payload);

      setProfile(updated);
      setForm(toForm(updated));
      notify("Profil de l'établissement enregistré. Il apparaîtra sur les prochains documents générés.");
    } catch (e: any) {
      const apiErrors = (e?.response?.data?.errors ?? {}) as Record<string, string[]>;

      setErrors(
        Object.fromEntries(Object.entries(apiErrors).map(([key, messages]) => [key, messages[0]])) as Partial<
          Record<FieldKey, string>
        >
      );
      notify(e?.response?.data?.message ?? "Échec de l'enregistrement.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImage = async (action: () => Promise<SchoolProfile>, message: string) => {
    setImageBusy(true);

    try {
      const updated = await action();

      setProfile(updated);
      await loadImages(updated);
      notify(message);
    } catch (e: any) {
      const fileError = e?.response?.data?.errors?.file?.[0];

      notify(fileError ?? e?.response?.data?.message ?? "Échec de l'envoi de l'image.", 'error');
    } finally {
      setImageBusy(false);
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' p={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return <Alert severity='error'>{loadError}</Alert>;
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Établissement</Typography>
        <Typography color='text.secondary'>
          Ces informations (nom, en-tête officiel, logo, coordonnées, signataires) figurent sur les bulletins de
          notes, attestations et certificats, factures, reçus et cartes scolaires.
        </Typography>
        {profile && !profile.is_configured && (
          <Alert severity='warning' sx={{ mt: 3 }}>
            Le nom officiel de l&apos;établissement n&apos;est pas encore renseigné : les documents affichent
            actuellement « {profile.display_name} ».
          </Alert>
        )}
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <Grid container spacing={6}>
          {SECTIONS.map((section) => (
            <Grid key={section.title} size={{ xs: 12 }}>
              <Card>
                <CardHeader title={section.title} subheader={section.subheader} />
                <CardContent>
                  <Grid container spacing={4}>
                    {section.fields.map((field) => (
                      <Grid key={field.key} size={{ xs: 12, sm: field.full || field.multiline ? 12 : 6 }}>
                        <TextField
                          fullWidth
                          size='small'
                          select={Boolean(field.select)}
                          type={field.type ?? 'text'}
                          label={field.label}
                          value={form[field.key]}
                          multiline={field.multiline}
                          minRows={field.multiline ? 3 : undefined}
                          error={Boolean(errors[field.key])}
                          helperText={errors[field.key] ?? field.helper}
                          onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                        >
                          {field.select?.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant='contained' disabled={saving} onClick={handleSave}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={6}>
          {(['logo', 'stamp'] as SchoolImageKind[]).map((kind) => (
            <Grid key={kind} size={{ xs: 12, sm: 6, lg: 12 }}>
              <ImageCard
                kind={kind}
                url={imageUrls[kind]}
                busy={imageBusy}
                onPick={(imageKind, file) =>
                  handleImage(
                    () => settingsService.uploadSchoolImage(imageKind, file),
                    imageKind === 'logo' ? 'Logo enregistré.' : 'Cachet enregistré.'
                  )
                }
                onDelete={(imageKind) =>
                  handleImage(
                    () => settingsService.deleteSchoolImage(imageKind),
                    imageKind === 'logo' ? 'Logo supprimé.' : 'Cachet supprimé.'
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Aperçu de l’en-tête des bulletins'
            subheader='Mis à jour en direct pendant la saisie (enregistrez pour l’appliquer aux documents).'
          />
          <CardContent>
            <HeaderPreview form={form} logoUrl={imageUrls.logo} fallbackName={profile?.display_name ?? ''} />
          </CardContent>
        </Card>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};
