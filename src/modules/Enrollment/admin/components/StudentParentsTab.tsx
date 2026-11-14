'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';

import { studentManagementService } from '../services/studentManagementService';
import { PARENT_RELATIONSHIPS } from '../../types/studentManagement.types';
import type { StudentParent, StudentParentFormData } from '../../types/studentManagement.types';
import type { Student } from '../../types/student.types';
import { PortalAccountPanel } from './PortalAccountPanel';

interface StudentParentsTabProps {
  student: Student;
  canManage: boolean;
}

const emptyForm = (student: Student): StudentParentFormData => ({
  firstname: '',
  lastname: student.lastname,
  relationship: 'Père',
  phone: '',
  phone_secondary: '',
  email: '',
  profession: '',
  address: student.address ?? '',
  is_primary_contact: false,
  is_financial_responsible: false,
});

/**
 * Onglet « Parents » de la fiche élève : créer un parent, lier un parent existant, délier,
 * et gérer le compte de connexion de chaque parent (portail Parent).
 */
export const StudentParentsTab = ({ student, canManage }: StudentParentsTabProps) => {
  const [parents, setParents] = useState<StudentParent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<StudentParentFormData>(() => emptyForm(student));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [linkOpen, setLinkOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<StudentParent[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedParent, setSelectedParent] = useState<StudentParent | null>(null);
  const [linkFlags, setLinkFlags] = useState({ is_primary_contact: false, is_financial_responsible: false });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setParents(await studentManagementService.getParents(student.id));
    } catch (err) {
      setError(await extractErrorMessage(err, 'Impossible de charger les parents.'));
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!linkOpen) return;

    const handle = window.setTimeout(async () => {
      setSearching(true);

      try {
        setSearchResults(await studentManagementService.searchParents(searchText.trim()));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [linkOpen, searchText]);

  const updateParent = (parentId: number, patch: Partial<StudentParent>) =>
    setParents((previous) => previous.map((parent) => (parent.id === parentId ? { ...parent, ...patch } : parent)));

  const handleCreate = async () => {
    setSaving(true);
    setFormError(null);

    try {
      const parent = await studentManagementService.createParent(student.id, form);

      setCreateOpen(false);
      setSuccess(`${parent.full_name} a été créé(e) et lié(e) à l'élève.`);
      await load();
    } catch (err) {
      setFormError(await extractErrorMessage(err, 'La création du parent a échoué.'));
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async () => {
    if (!selectedParent) return;

    setSaving(true);
    setFormError(null);

    try {
      const parent = await studentManagementService.linkParent(student.id, selectedParent.id, linkFlags);

      setLinkOpen(false);
      setSuccess(`${parent.full_name} est maintenant lié(e) à l'élève.`);
      await load();
    } catch (err) {
      setFormError(await extractErrorMessage(err, 'La liaison a échoué.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (parent: StudentParent) => {
    if (!window.confirm(`Délier ${parent.full_name} de cet élève ? La fiche du parent et son compte sont conservés.`)) {
      return;
    }

    setError(null);

    try {
      await studentManagementService.unlinkParent(student.id, parent.id);
      setSuccess(`${parent.full_name} a été délié(e).`);
      await load();
    } catch (err) {
      setError(await extractErrorMessage(err, 'La déliaison a échoué.'));
    }
  };

  const openCreate = () => {
    setForm(emptyForm(student));
    setFormError(null);
    setCreateOpen(true);
  };

  const openLink = () => {
    setSearchText('');
    setSelectedParent(null);
    setLinkFlags({ is_primary_contact: false, is_financial_responsible: false });
    setFormError(null);
    setLinkOpen(true);
  };

  const field = (key: keyof StudentParentFormData) => ({
    value: (form[key] as string | undefined) ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm((previous) => ({ ...previous, [key]: event.target.value })),
  });

  return (
    <Box className='flex flex-col gap-4'>
      {error && <Alert severity='error' onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity='success' onClose={() => setSuccess(null)}>{success}</Alert>}

      <Box className='flex flex-wrap items-center justify-between gap-3'>
        <Typography variant='h6'>Parents / responsables</Typography>
        {canManage && (
          <Box className='flex gap-2'>
            <Button variant='contained' startIcon={<i className='ri-user-add-line' />} onClick={openCreate}>
              Nouveau parent
            </Button>
            <Button variant='outlined' startIcon={<i className='ri-links-line' />} onClick={openLink}>
              Lier un parent existant
            </Button>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box className='flex justify-center' sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : parents.length === 0 ? (
        <Typography color='text.secondary'>Aucun parent lié à cet élève.</Typography>
      ) : (
        <Grid container spacing={4}>
          {parents.map((parent) => (
            <Grid key={parent.id} size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent className='flex flex-col gap-3'>
                  <Box className='flex items-start justify-between gap-2'>
                    <Box>
                      <Typography variant='h6'>{parent.full_name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {parent.relationship} · {parent.phone}
                        {parent.email ? ` · ${parent.email}` : ''}
                      </Typography>
                      {parent.profession && (
                        <Typography variant='body2' color='text.secondary'>
                          {parent.profession}
                        </Typography>
                      )}
                    </Box>
                    {canManage && (
                      <Button size='small' color='error' onClick={() => handleUnlink(parent)} startIcon={<i className='ri-link-unlink' />}>
                        Délier
                      </Button>
                    )}
                  </Box>
                  <Box className='flex flex-wrap gap-2'>
                    {parent.is_primary_contact && <Chip size='small' variant='tonal' color='primary' label='Contact principal' />}
                    {parent.is_financial_responsible && <Chip size='small' variant='tonal' color='info' label='Responsable financier' />}
                    {(parent.children_count ?? 0) > 1 && (
                      <Chip size='small' variant='tonal' label={`${parent.children_count} enfants`} />
                    )}
                  </Box>
                  <Divider />
                  <Typography variant='subtitle2'>Compte de connexion (portail Parent)</Typography>
                  <PortalAccountPanel
                    compact
                    account={parent.account}
                    ownerLabel={parent.full_name}
                    usernameHint='prenom.nom'
                    canManage={canManage}
                    onCreate={(username) => studentManagementService.createParentAccount(parent.id, username)}
                    onResetPassword={() => studentManagementService.resetParentPassword(parent.id)}
                    onToggleActive={(isActive) => studentManagementService.setParentAccountActive(parent.id, isActive)}
                    onChanged={(account) => updateParent(parent.id, { account })}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Création d'un parent */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Nouveau parent</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity='error' sx={{ mb: 3 }}>{formError}</Alert>}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth required label='Prénom' {...field('firstname')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth required label='Nom' {...field('lastname')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                required
                label='Lien de parenté'
                value={form.relationship}
                onChange={(event) => setForm((previous) => ({ ...previous, relationship: event.target.value as StudentParentFormData['relationship'] }))}
              >
                {PARENT_RELATIONSHIPS.map((relationship) => (
                  <MenuItem key={relationship} value={relationship}>
                    {relationship}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth required label='Téléphone' {...field('phone')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label='Téléphone secondaire' {...field('phone_secondary')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type='email' label='E-mail' {...field('email')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label='Profession' {...field('profession')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label='Adresse' {...field('address')} />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex flex-wrap gap-4'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(form.is_primary_contact)}
                    onChange={(event) => setForm((previous) => ({ ...previous, is_primary_contact: event.target.checked }))}
                  />
                }
                label='Contact principal'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(form.is_financial_responsible)}
                    onChange={(event) => setForm((previous) => ({ ...previous, is_financial_responsible: event.target.checked }))}
                  />
                }
                label='Responsable financier'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setCreateOpen(false)} disabled={saving}>
            Annuler
          </Button>
          <Button
            variant='contained'
            onClick={handleCreate}
            disabled={saving || !form.firstname.trim() || !form.lastname.trim() || !form.phone.trim()}
          >
            {saving ? <CircularProgress size={20} /> : 'Créer et lier'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Liaison d'un parent existant */}
      <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Lier un parent existant</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity='error' sx={{ mb: 3 }}>{formError}</Alert>}
          <Autocomplete
            options={searchResults.filter((candidate) => !parents.some((parent) => parent.id === candidate.id))}
            loading={searching}
            value={selectedParent}
            onChange={(_event, value) => setSelectedParent(value)}
            inputValue={searchText}
            onInputChange={(_event, value) => setSearchText(value)}
            filterOptions={(options) => options}
            getOptionLabel={(option) => `${option.full_name} — ${option.phone}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText='Aucun parent trouvé'
            renderInput={(params) => (
              <TextField {...params} label='Rechercher (nom, téléphone, e-mail)' placeholder='Ex. Garba ou +227…' />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography>{option.full_name}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {option.relationship} · {option.phone} · {option.children_count ?? 0} enfant(s)
                  </Typography>
                </Box>
              </li>
            )}
          />
          <Box className='flex flex-wrap gap-4' sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={linkFlags.is_primary_contact}
                  onChange={(event) => setLinkFlags((previous) => ({ ...previous, is_primary_contact: event.target.checked }))}
                />
              }
              label='Contact principal'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={linkFlags.is_financial_responsible}
                  onChange={(event) => setLinkFlags((previous) => ({ ...previous, is_financial_responsible: event.target.checked }))}
                />
              }
              label='Responsable financier'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setLinkOpen(false)} disabled={saving}>
            Annuler
          </Button>
          <Button variant='contained' onClick={handleLink} disabled={saving || !selectedParent}>
            {saving ? <CircularProgress size={20} /> : 'Lier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentParentsTab;
