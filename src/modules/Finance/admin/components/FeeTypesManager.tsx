'use client';

import React, { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTenant } from '@/shared/lib/tenant-context';
import { useAuthUser } from '@/shared/hooks/useAuthUser';
import { useAcademicYears } from '@/modules/StructureAcademique/admin/hooks/useAcademicYears';

import type { CreateFeeTypeRequest, FeeType, FeeTypeCategory } from '../../types';
import { FEE_TYPE_CATEGORY_LABELS } from '../../types';
import {
  useBulkBillingTargets,
  useCreateFeeType,
  useFeeTypeList,
  useSetFeeTypeStatus,
  useUpdateFeeType,
} from '../hooks/useInvoices';
import { formatXof } from './ReceiptDialog';

interface FeeTypeFormState {
  code: string;
  name: string;
  description: string;
  category: FeeTypeCategory;
  defaultAmount: string;
  isMandatory: boolean;
  academicYearId: number | '';
  allLevels: boolean;
  levels: string[];
  levelAmounts: Record<string, string>;
}

const emptyForm: FeeTypeFormState = {
  code: '',
  name: '',
  description: '',
  category: 'tuition',
  defaultAmount: '',
  isMandatory: true,
  academicYearId: '',
  allLevels: true,
  levels: [],
  levelAmounts: {},
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const errors = err?.response?.data?.errors;

  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat()[0];

    if (typeof first === 'string') return first;
  }

  return err?.response?.data?.message || fallback;
};

export const FeeTypesManager: React.FC = () => {
  const { tenantId } = useTenant();
  const authUser = useAuthUser();
  const canWrite = (authUser?.roles ?? []).some(r => r === 'Administrator' || r === 'Comptable');

  const { academicYears } = useAcademicYears();
  const activeYear = useMemo(() => academicYears.find(y => y.is_active), [academicYears]);

  const [showInactive, setShowInactive] = useState(false);
  const { data: feeTypes = [], isLoading, error } = useFeeTypeList({ include_inactive: showInactive }, tenantId || undefined);

  // Les niveaux sont lus via l'endpoint Finance (le Comptable n'a pas accès à /admin/levels)
  const { data: targets } = useBulkBillingTargets(canWrite ? activeYear?.id : undefined, tenantId || undefined);
  const levels = targets?.levels ?? [];

  const createMutation = useCreateFeeType(tenantId || undefined);
  const updateMutation = useUpdateFeeType(tenantId || undefined);
  const statusMutation = useSetFeeTypeStatus(tenantId || undefined);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [form, setForm] = useState<FeeTypeFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, academicYearId: activeYear?.id ?? '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (feeType: FeeType) => {
    const levelCodes = feeType.applies_to?.levels ?? [];
    const amounts = feeType.applies_to?.level_amounts ?? {};

    setEditing(feeType);
    setForm({
      code: feeType.code,
      name: feeType.name,
      description: feeType.description ?? '',
      category: feeType.category,
      defaultAmount: String(Number(feeType.default_amount ?? 0)),
      isMandatory: !!feeType.is_mandatory,
      academicYearId: feeType.academic_year_id ?? '',
      allLevels: levelCodes.length === 0,
      levels: levelCodes,
      levelAmounts: Object.fromEntries(Object.entries(amounts).map(([code, amount]) => [code, String(amount)])),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const toggleLevel = (code: string) => {
    setForm(prev => ({
      ...prev,
      levels: prev.levels.includes(code) ? prev.levels.filter(c => c !== code) : [...prev.levels, code],
    }));
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!form.code.trim() || !form.name.trim() || form.defaultAmount === '') {
      setFormError('Code, libellé et montant par défaut sont obligatoires.');

      return;
    }

    if (!form.allLevels && form.levels.length === 0) {
      setFormError('Cochez au moins un niveau (ou « Tous les niveaux »).');

      return;
    }

    const concernedLevels = form.allLevels ? levels.map(l => l.code) : form.levels;
    const levelAmounts: Record<string, number | null> = {};

    concernedLevels.forEach(code => {
      const value = form.levelAmounts[code];

      if (value !== undefined && value !== '') {
        levelAmounts[code] = Number(value);
      }
    });

    const payload: CreateFeeTypeRequest = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      default_amount: Number(form.defaultAmount),
      is_mandatory: form.isMandatory,
      academic_year_id: form.academicYearId === '' ? null : Number(form.academicYearId),
      levels: form.allLevels ? [] : form.levels,
      level_amounts: levelAmounts,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ feeTypeId: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setDialogOpen(false);
      setSnackbar({ open: true, message: editing ? 'Type de frais modifié.' : 'Type de frais créé.', severity: 'success' });
    } catch (err: any) {
      setFormError(extractErrorMessage(err, 'Erreur lors de l\'enregistrement du type de frais.'));
    }
  };

  const handleToggleStatus = async (feeType: FeeType) => {
    try {
      await statusMutation.mutateAsync({ feeTypeId: feeType.id, isActive: !feeType.is_active });
      setSnackbar({
        open: true,
        message: feeType.is_active ? `« ${feeType.name} » désactivé.` : `« ${feeType.name} » activé.`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: extractErrorMessage(err, 'Erreur lors du changement de statut.'), severity: 'error' });
    }
  };

  const renderLevelAmounts = (feeType: FeeType) => {
    const levelCodes = feeType.applies_to?.levels ?? [];
    const amounts = feeType.applies_to?.level_amounts ?? {};
    const amountEntries = Object.entries(amounts);

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {levelCodes.length === 0 ? (
          <Chip size="small" label="Tous niveaux" variant="outlined" />
        ) : (
          levelCodes.map(code => (
            <Chip
              key={code}
              size="small"
              variant="outlined"
              color={amounts[code] !== undefined ? 'primary' : 'default'}
              label={amounts[code] !== undefined ? `${code} : ${formatXof(amounts[code])}` : code}
            />
          ))
        )}
        {levelCodes.length === 0 &&
          amountEntries.map(([code, amount]) => (
            <Chip key={code} size="small" variant="outlined" color="primary" label={`${code} : ${formatXof(amount)}`} />
          ))}
      </Box>
    );
  };

  const formLevels = form.allLevels ? levels.map(l => l.code) : form.levels;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Comptabilit&eacute;
        </Link>
        <Typography color="text.primary">Types de frais</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Types de frais
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scolarité, inscription, APE, tenue… : montant par défaut, montants par niveau, année concernée.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={<Switch checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />}
            label="Afficher les désactivés"
          />
          {canWrite && (
            <Button variant="contained" onClick={openCreate}>
              + Nouveau type de frais
            </Button>
          )}
        </Box>
      </Box>

      {!canWrite && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Consultation seule : le paramétrage des frais est réservé à l&apos;Administrator et au Comptable.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Impossible de charger les types de frais.
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Libellé</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Année</TableCell>
                <TableCell align="right">Montant par défaut</TableCell>
                <TableCell>Niveaux / montants</TableCell>
                <TableCell>Obligatoire</TableCell>
                <TableCell>Statut</TableCell>
                {canWrite && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : feeTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    Aucun type de frais.
                  </TableCell>
                </TableRow>
              ) : (
                feeTypes.map(feeType => (
                  <TableRow key={feeType.id} hover sx={{ opacity: feeType.is_active ? 1 : 0.6 }}>
                    <TableCell sx={{ fontWeight: 600 }}>{feeType.code}</TableCell>
                    <TableCell>
                      {feeType.name}
                      {feeType.description && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {feeType.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{FEE_TYPE_CATEGORY_LABELS[feeType.category] ?? feeType.category}</TableCell>
                    <TableCell>{feeType.academic_year?.name ?? 'Toutes'}</TableCell>
                    <TableCell align="right">{formatXof(feeType.default_amount)}</TableCell>
                    <TableCell>{renderLevelAmounts(feeType)}</TableCell>
                    <TableCell>{feeType.is_mandatory ? 'Oui' : 'Non'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={feeType.is_active ? 'Actif' : 'Désactivé'}
                        color={feeType.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    {canWrite && (
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Button size="small" onClick={() => openEdit(feeType)}>
                          Modifier
                        </Button>
                        <Button
                          size="small"
                          color={feeType.is_active ? 'warning' : 'success'}
                          disabled={statusMutation.isPending}
                          onClick={() => handleToggleStatus(feeType)}
                        >
                          {feeType.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => !isSaving && setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? `Modifier « ${editing.name} »` : 'Nouveau type de frais'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Code"
                value={form.code}
                onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))}
                fullWidth
                required
                helperText="Ex. SCOLARITE, APE, TENUE"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Libellé"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  label="Catégorie"
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value as FeeTypeCategory }))}
                >
                  {(Object.keys(FEE_TYPE_CATEGORY_LABELS) as FeeTypeCategory[]).map(category => (
                    <MenuItem key={category} value={category}>
                      {FEE_TYPE_CATEGORY_LABELS[category]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Montant par défaut (XOF)"
                type="number"
                value={form.defaultAmount}
                onChange={e => setForm(prev => ({ ...prev, defaultAmount: e.target.value }))}
                fullWidth
                required
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Année scolaire</InputLabel>
                <Select
                  label="Année scolaire"
                  value={form.academicYearId}
                  onChange={e => setForm(prev => ({ ...prev, academicYearId: e.target.value as number | '' }))}
                >
                  <MenuItem value="">Toutes les années</MenuItem>
                  {academicYears.map(year => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name}
                      {year.is_active ? ' (active)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isMandatory}
                    onChange={e => setForm(prev => ({ ...prev, isMandatory: e.target.checked }))}
                  />
                }
                label="Frais obligatoire"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.allLevels}
                    onChange={e => setForm(prev => ({ ...prev, allLevels: e.target.checked }))}
                  />
                }
                label="Tous les niveaux"
              />
            </Grid>

            {levels.length === 0 ? (
              <Grid size={12}>
                <Alert severity="info">Aucun niveau disponible (activez une année scolaire pour paramétrer les montants par niveau).</Alert>
              </Grid>
            ) : (
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Niveaux concernés et montant spécifique (laisser vide = montant par défaut)
                </Typography>
                <Grid container spacing={1}>
                  {levels.map(level => {
                    const concerned = formLevels.includes(level.code);

                    return (
                      <Grid key={level.code} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            size="small"
                            checked={concerned}
                            disabled={form.allLevels}
                            onChange={() => toggleLevel(level.code)}
                          />
                          <TextField
                            size="small"
                            type="number"
                            label={level.name}
                            placeholder={form.defaultAmount || '0'}
                            disabled={!concerned}
                            value={form.levelAmounts[level.code] ?? ''}
                            onChange={e =>
                              setForm(prev => ({
                                ...prev,
                                levelAmounts: { ...prev.levelAmounts, [level.code]: e.target.value },
                              }))
                            }
                            slotProps={{ htmlInput: { min: 0 } }}
                            fullWidth
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : editing ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
