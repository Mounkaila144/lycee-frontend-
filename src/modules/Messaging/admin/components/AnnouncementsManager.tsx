'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { announcementService } from '../../services/announcementService';
import { ANNOUNCEMENT_AUDIENCE_LABELS } from '../../types/announcement.types';
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementAudiencePreview,
  AnnouncementInput,
} from '../../types/announcement.types';

const AUDIENCES = Object.entries(ANNOUNCEMENT_AUDIENCE_LABELS) as Array<[AnnouncementAudience, string]>;

const emptyForm: AnnouncementInput = {
  title: '',
  body: '',
  audience: 'all',
  classe_id: null,
  published_at: null,
  expires_at: null,
  is_pinned: false,
};

/** ISO → valeur d'un champ datetime-local (heure locale). */
const toInputDate = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString('fr-FR') : '—');

const extractError = (error: unknown): string => {
  const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response;
  const firstFieldError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : undefined;

  return firstFieldError ?? response?.data?.message ?? "Erreur lors de l'enregistrement.";
};

const statusChip = (announcement: Announcement) => {
  if (announcement.is_expired) {
    return <Chip label='Expirée' size='small' />;
  }

  if (!announcement.is_published) {
    return <Chip label='Programmée' size='small' color='info' variant='tonal' />;
  }

  return <Chip label='Publiée' size='small' color='success' variant='tonal' />;
};

/**
 * Gestion des annonces (Administrator / Manager) : liste, création,
 * modification, suppression et aperçu de l'audience ciblée.
 */
export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([]);
  const [audienceFilter, setAudienceFilter] = useState<AnnouncementAudience | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AnnouncementInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<AnnouncementAudiencePreview | null>(null);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    announcementService
      .list({ audience: audienceFilter || undefined, per_page: 100 })
      .then((response) => {
        setAnnouncements(response.data ?? []);
        setError(null);
      })
      .catch(() => setError('Impossible de charger les annonces.'))
      .finally(() => setLoading(false));
  }, [audienceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    announcementService
      .classes()
      .then(setClasses)
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!formOpen) {
      return;
    }

    let active = true;

    announcementService
      .preview(form.audience, form.classe_id)
      .then((result) => active && setPreview(result))
      .catch(() => active && setPreview(null));

    return () => {
      active = false;
    };
  }, [formOpen, form.audience, form.classe_id]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience,
      classe_id: announcement.classe_id,
      published_at: toInputDate(announcement.published_at),
      expires_at: toInputDate(announcement.expires_at),
      is_pinned: announcement.is_pinned,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);

    const payload: AnnouncementInput = {
      ...form,
      published_at: form.published_at || null,
      expires_at: form.expires_at || null,
      classe_id: form.audience === 'staff' ? null : form.classe_id,
    };

    try {
      if (editing) {
        await announcementService.update(editing.id, payload);
      } else {
        await announcementService.create(payload);
      }

      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) {
      return;
    }

    try {
      await announcementService.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch {
      setError("Impossible de supprimer l'annonce.");
      setToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title='Annonces'
        subheader="Informations diffusées aux parents, élèves, professeurs et au personnel"
        action={
          <Stack direction='row' spacing={2} alignItems='center'>
            <TextField
              select
              size='small'
              label='Audience'
              value={audienceFilter}
              onChange={(event) => setAudienceFilter(event.target.value as AnnouncementAudience | '')}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value=''>Toutes</MenuItem>
              {AUDIENCES.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant='contained' onClick={openCreate}>
              Nouvelle annonce
            </Button>
          </Stack>
        }
      />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <CircularProgress size={28} />
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Audience</TableCell>
                  <TableCell>Publication</TableCell>
                  <TableCell>Expiration</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>Aucune annonce.</TableCell>
                  </TableRow>
                )}
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id} hover>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        {announcement.is_pinned && <span title='Épinglée'>📌</span>}
                        <Typography variant='body2' fontWeight={600}>
                          {announcement.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {announcement.audience_label}
                      {announcement.classe ? ` — ${announcement.classe.name}` : ''}
                    </TableCell>
                    <TableCell>{formatDate(announcement.published_at)}</TableCell>
                    <TableCell>{formatDate(announcement.expires_at)}</TableCell>
                    <TableCell>{statusChip(announcement)}</TableCell>
                    <TableCell align='right'>
                      <Stack direction='row' spacing={1} justifyContent='flex-end'>
                        <Button size='small' onClick={() => openEdit(announcement)}>
                          Modifier
                        </Button>
                        <Button size='small' color='error' onClick={() => setToDelete(announcement)}>
                          Supprimer
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>{editing ? "Modifier l'annonce" : 'Nouvelle annonce'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {formError && <Alert severity='error'>{formError}</Alert>}
            <TextField
              label='Titre'
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              fullWidth
            />
            <TextField
              label='Contenu'
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              required
              fullWidth
              multiline
              minRows={4}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label='Audience'
                value={form.audience}
                onChange={(event) => {
                  const audience = event.target.value as AnnouncementAudience;

                  setForm({ ...form, audience, classe_id: audience === 'staff' ? null : form.classe_id });
                }}
                fullWidth
              >
                {AUDIENCES.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label='Classe (optionnel)'
                value={form.classe_id ?? ''}
                onChange={(event) =>
                  setForm({ ...form, classe_id: event.target.value === '' ? null : Number(event.target.value) })
                }
                disabled={form.audience === 'staff'}
                fullWidth
              >
                <MenuItem value=''>Toutes les classes</MenuItem>
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type='datetime-local'
                label='Publiée le'
                value={form.published_at ?? ''}
                onChange={(event) => setForm({ ...form, published_at: event.target.value })}
                helperText='Vide = publication immédiate'
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type='datetime-local'
                label='Expire le'
                value={form.expires_at ?? ''}
                onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
                helperText='Vide = pas d’expiration'
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch checked={form.is_pinned} onChange={(event) => setForm({ ...form, is_pinned: event.target.checked })} />
              }
              label='Épingler en haut de la liste'
            />
            {preview && (
              <Alert severity='info'>
                <strong>Aperçu de l&apos;audience :</strong> {preview.label}
                <br />
                {preview.total} compte(s) ciblé(s) — parents : {preview.counts.parents}, élèves : {preview.counts.students},
                professeurs : {preview.counts.teachers}, personnel : {preview.counts.staff}. La direction voit toutes les
                annonces.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Annuler</Button>
          <Button variant='contained' onClick={save} disabled={saving || !form.title.trim() || !form.body.trim()}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toDelete !== null} onClose={() => setToDelete(null)}>
        <DialogTitle>Supprimer l&apos;annonce ?</DialogTitle>
        <DialogContent>
          <Typography>« {toDelete?.title} » ne sera plus visible par personne.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Annuler</Button>
          <Button color='error' variant='contained' onClick={confirmDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
