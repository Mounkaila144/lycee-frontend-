'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAuthUser } from '@/shared/hooks/useAuthUser';

import {
  usePayrollSettings,
  usePayrollSettingsDefaults,
  usePayrollSettingsVersions,
  usePayrollSimulation,
  useSavePayrollSettings,
} from '../hooks/usePayrollSettings';
import { formatDate, getPayrollErrorMessage } from '../utils/payrollFormatters';
import type {
  PayrollContributionSetting,
  PayrollEmployerChargeSetting,
  PayrollSettings,
  PayrollSettingsVersion,
  PayrollTaxBracket,
} from '../../types';

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

const WRITER_ROLES = ['Administrator', 'Comptable'];

const toNullableNumber = (value: string): number | null => (value === '' ? null : Number(value));

const firstDayOfNextMonth = (): string => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`;
};

const cloneSettings = (settings: PayrollSettings): PayrollSettings => JSON.parse(JSON.stringify(settings));

const formatAmount = (value: number | null | undefined, currency: string): string =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(value ?? 0))} ${currency}`;

const emptyContribution = (index: number): PayrollContributionSetting => ({
  code: `cotisation_${index}`,
  label: '',
  employee_rate: 0,
  employer_rate: 0,
  ceiling: null,
  floor: null,
  active: true,
  tax_deductible: false,
});

const emptyCharge = (index: number): PayrollEmployerChargeSetting => ({
  code: `charge_${index}`,
  label: '',
  rate: 0,
  active: true,
});

const versionLabel = (version: PayrollSettingsVersion): string =>
  version.is_default || !version.version
    ? 'Valeurs par défaut (aucune version enregistrée)'
    : `Version ${version.version} — en vigueur depuis le ${formatDate(version.effective_date)}`;

export const PayrollSettingsDashboard: React.FC = () => {
  const authUser = useAuthUser();
  const canEdit = (authUser?.roles ?? []).some(role => WRITER_ROLES.includes(role));

  const [tab, setTab] = useState<'settings' | 'simulator' | 'history'>('settings');
  const [form, setForm] = useState<PayrollSettings | null>(null);
  const [effectiveDate, setEffectiveDate] = useState(firstDayOfNextMonth());
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const [simulationGross, setSimulationGross] = useState<number>(250000);
  const [simulationSource, setSimulationSource] = useState<'draft' | 'saved'>('draft');
  const [simulationDate, setSimulationDate] = useState(new Date().toISOString().slice(0, 10));

  const overview = usePayrollSettings();
  const versions = usePayrollSettingsVersions();
  const defaults = usePayrollSettingsDefaults();
  const save = useSavePayrollSettings();
  const simulation = usePayrollSimulation();

  useEffect(() => {
    if (overview.data && !form) {
      setForm(cloneSettings(overview.data.current.settings));
    }
  }, [overview.data, form]);

  const notify = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnackbar({ open: true, message, severity });

  const currency = form?.currency_label || 'FCFA';
  const readOnly = !canEdit;

  const update = (patch: Partial<PayrollSettings>) => setForm(prev => (prev ? { ...prev, ...patch } : prev));

  const updateContribution = (index: number, patch: Partial<PayrollContributionSetting>) =>
    setForm(prev =>
      prev
        ? { ...prev, contributions: prev.contributions.map((line, i) => (i === index ? { ...line, ...patch } : line)) }
        : prev,
    );

  const updateBracket = (index: number, patch: Partial<PayrollTaxBracket>) =>
    setForm(prev =>
      prev
        ? {
            ...prev,
            income_tax: {
              ...prev.income_tax,
              brackets: prev.income_tax.brackets.map((bracket, i) => (i === index ? { ...bracket, ...patch } : bracket)),
            },
          }
        : prev,
    );

  const updateCharge = (index: number, patch: Partial<PayrollEmployerChargeSetting>) =>
    setForm(prev =>
      prev
        ? {
            ...prev,
            employer_charges: prev.employer_charges.map((line, i) => (i === index ? { ...line, ...patch } : line)),
          }
        : prev,
    );

  const addBracket = () =>
    setForm(prev => {
      if (!prev) return prev;
      const brackets = [...prev.income_tax.brackets];
      const last = brackets[brackets.length - 1];
      const from = last ? (last.to ?? last.from + 100000) : 0;

      if (last && last.to === null) brackets[brackets.length - 1] = { ...last, to: from };
      brackets.push({ from, to: null, rate: last ? last.rate : 0 });

      return { ...prev, income_tax: { ...prev.income_tax, brackets } };
    });

  const removeBracket = (index: number) =>
    setForm(prev =>
      prev
        ? {
            ...prev,
            income_tax: { ...prev.income_tax, brackets: prev.income_tax.brackets.filter((_, i) => i !== index) },
          }
        : prev,
    );

  const handleSave = () => {
    if (!form) return;

    save.mutate(
      { effective_date: effectiveDate, notes: notes || undefined, settings: { ...form, requires_review: false } },
      {
        onSuccess: response => {
          notify(response.message);
          setNotes('');
          setForm(prev => (prev ? { ...prev, requires_review: false } : prev));
        },
        onError: err => notify(getPayrollErrorMessage(err, 'Enregistrement impossible'), 'error'),
      },
    );
  };

  const handleSimulate = () => {
    if (!form) return;

    simulation.mutate(
      simulationSource === 'draft'
        ? { gross_salary: simulationGross, settings: form }
        : { gross_salary: simulationGross, date: simulationDate },
      { onError: err => notify(getPayrollErrorMessage(err, 'Simulation impossible'), 'error') },
    );
  };

  const loadSettings = (settings: PayrollSettings, message: string) => {
    setForm(cloneSettings(settings));
    setTab('settings');
    notify(message);
  };

  const sortedVersions = useMemo(() => versions.data ?? [], [versions.data]);

  if (overview.isLoading || !form) {
    return (
      <Box sx={{ p: 3 }}>
        {overview.isError ? (
          <Alert severity="error">{getPayrollErrorMessage(overview.error, 'Impossible de charger les paramètres de paie')}</Alert>
        ) : (
          <CircularProgress />
        )}
      </Box>
    );
  }

  const current = overview.data!.current;
  const result = simulation.data;

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Paramètres de paie
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cotisations sociales, barème de l’impôt sur salaires et charges patronales utilisés pour calculer les
            bulletins. Chaque enregistrement crée une nouvelle version datée ; l’historique est conservé.
          </Typography>
        </Box>
        <Chip color={current.is_default ? 'warning' : 'primary'} label={versionLabel(current)} />
      </Box>

      {form.requires_review && (
        <Alert severity="warning">
          <strong>À vérifier par le comptable.</strong>{' '}
          {form.review_notice ??
            'Ces valeurs sont indicatives : contrôlez chaque taux et le barème avant de calculer une paie réelle.'}
        </Alert>
      )}
      {!overview.data!.storage_available && (
        <Alert severity="info">
          L’enregistrement des paramètres n’est pas encore activé sur ce serveur (mise à jour de la base en attente).
          Les valeurs par défaut sont utilisées pour les calculs.
        </Alert>
      )}
      {readOnly && (
        <Alert severity="info">Consultation seule : seuls l’Administrateur et le Comptable peuvent modifier ces paramètres.</Alert>
      )}
      {(overview.data!.upcoming ?? []).length > 0 && (
        <Alert severity="info">
          Version(s) programmée(s) :{' '}
          {overview.data!.upcoming.map(version => `v${version.version} au ${formatDate(version.effective_date)}`).join(', ')}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab value="settings" label="Paramètres" />
        <Tab value="simulator" label="Simulateur" />
        <Tab value="history" label="Historique des versions" />
      </Tabs>

      {tab === 'settings' && (
        <>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Général</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    label="Devise (libellé)"
                    value={form.currency_label}
                    disabled={readOnly}
                    onChange={event => update({ currency_label: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    label="Code devise"
                    value={form.currency}
                    disabled={readOnly}
                    onChange={event => update({ currency: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Arrondi"
                    value={form.rounding_precision}
                    disabled={readOnly}
                    onChange={event => update({ rounding_precision: Number(event.target.value) })}
                  >
                    <MenuItem value={0}>À l’unité</MenuItem>
                    <MenuItem value={1}>1 décimale</MenuItem>
                    <MenuItem value={2}>2 décimales</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date d’effet de la nouvelle version"
                    value={effectiveDate}
                    disabled={readOnly}
                    onChange={event => setEffectiveDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText="Une paie utilise la version en vigueur au 1er jour de sa période."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Note (motif du changement)"
                    value={notes}
                    disabled={readOnly}
                    onChange={event => setNotes(event.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Cotisations sociales</Typography>
                {!readOnly && (
                  <Button
                    size="small"
                    startIcon={<i className="ri-add-line" />}
                    onClick={() =>
                      update({ contributions: [...form.contributions, emptyContribution(form.contributions.length + 1)] })
                    }
                  >
                    Ajouter une cotisation
                  </Button>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Assiette = salaire brut, bornée par le plancher et le plafond mensuels (laisser vide si aucun).
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell>Taux salarié %</TableCell>
                      <TableCell>Taux employeur %</TableCell>
                      <TableCell>Plafond mensuel</TableCell>
                      <TableCell>Plancher</TableCell>
                      <TableCell>Déductible de l’impôt</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.contributions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Aucune cotisation configurée.
                        </TableCell>
                      </TableRow>
                    )}
                    {form.contributions.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ minWidth: 130 }}>
                          <TextField
                            size="small"
                            value={line.code}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { code: event.target.value })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 220 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={line.label}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { label: event.target.value })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={line.employee_rate}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { employee_rate: Number(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={line.employer_rate}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { employer_rate: Number(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 130 }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Aucun"
                            value={line.ceiling ?? ''}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { ceiling: toNullableNumber(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Aucun"
                            value={line.floor ?? ''}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { floor: toNullableNumber(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={line.tax_deductible}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { tax_deductible: event.target.checked })}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={line.active}
                            disabled={readOnly}
                            onChange={event => updateContribution(index, { active: event.target.checked })}
                          />
                        </TableCell>
                        <TableCell>
                          {!readOnly && (
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  update({ contributions: form.contributions.filter((_, i) => i !== index) })
                                }
                              >
                                <i className="ri-delete-bin-line" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Impôt sur salaires — barème mensuel par tranches</Typography>
                {!readOnly && (
                  <Button size="small" startIcon={<i className="ri-add-line" />} onClick={addBracket}>
                    Ajouter une tranche
                  </Button>
                )}
              </Box>
              <Alert severity="warning">
                Le barème pré-rempli est un <strong>exemple</strong> : saisissez le barème officiel en vigueur (montants
                mensuels). Laissez « Jusqu’à » vide pour la dernière tranche.
              </Alert>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    label="Libellé de l’impôt"
                    value={form.income_tax.label}
                    disabled={readOnly}
                    onChange={event => update({ income_tax: { ...form.income_tax, label: event.target.value } })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Abattement forfaitaire %"
                    value={form.income_tax.flat_allowance_rate}
                    disabled={readOnly}
                    onChange={event =>
                      update({ income_tax: { ...form.income_tax, flat_allowance_rate: Number(event.target.value) } })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.income_tax.deduct_employee_contributions}
                        disabled={readOnly}
                        onChange={event =>
                          update({
                            income_tax: { ...form.income_tax, deduct_employee_contributions: event.target.checked },
                          })
                        }
                      />
                    }
                    label="Déduire les cotisations salariales (déductibles) avant impôt"
                  />
                </Grid>
              </Grid>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>De ({currency})</TableCell>
                      <TableCell>Jusqu’à ({currency})</TableCell>
                      <TableCell>Taux %</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.income_tax.brackets.map((bracket, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={bracket.from}
                            disabled={readOnly}
                            onChange={event => updateBracket(index, { from: Number(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Sans limite"
                            value={bracket.to ?? ''}
                            disabled={readOnly}
                            onChange={event => updateBracket(index, { to: toNullableNumber(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={bracket.rate}
                            disabled={readOnly}
                            onChange={event => updateBracket(index, { rate: Number(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          {!readOnly && form.income_tax.brackets.length > 1 && (
                            <Tooltip title="Supprimer">
                              <IconButton size="small" color="error" onClick={() => removeBracket(index)}>
                                <i className="ri-delete-bin-line" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Charges patronales additionnelles (% de la masse salariale brute)</Typography>
                {!readOnly && (
                  <Button
                    size="small"
                    startIcon={<i className="ri-add-line" />}
                    onClick={() =>
                      update({ employer_charges: [...form.employer_charges, emptyCharge(form.employer_charges.length + 1)] })
                    }
                  >
                    Ajouter une charge
                  </Button>
                )}
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell>Taux %</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.employer_charges.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Aucune charge patronale additionnelle.
                        </TableCell>
                      </TableRow>
                    )}
                    {form.employer_charges.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ minWidth: 130 }}>
                          <TextField
                            size="small"
                            value={line.code}
                            disabled={readOnly}
                            onChange={event => updateCharge(index, { code: event.target.value })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 260 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={line.label}
                            disabled={readOnly}
                            onChange={event => updateCharge(index, { label: event.target.value })}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={line.rate}
                            disabled={readOnly}
                            onChange={event => updateCharge(index, { rate: Number(event.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={line.active}
                            disabled={readOnly}
                            onChange={event => updateCharge(index, { active: event.target.checked })}
                          />
                        </TableCell>
                        <TableCell>
                          {!readOnly && (
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  update({ employer_charges: form.employer_charges.filter((_, i) => i !== index) })
                                }
                              >
                                <i className="ri-delete-bin-line" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {!readOnly && (
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="info">
                  Enregistrer crée une <strong>nouvelle version</strong> applicable aux paies dont la période commence à
                  partir du {formatDate(effectiveDate)}. Les paies déjà calculées ou validées ne sont jamais recalculées.
                  Testez d’abord vos réglages dans l’onglet « Simulateur ».
                </Alert>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    disabled={!defaults.data}
                    onClick={() =>
                      defaults.data && loadSettings(defaults.data, 'Valeurs par défaut (Niger) chargées — à vérifier')
                    }
                  >
                    Recharger les valeurs par défaut (Niger)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => loadSettings(current.settings, 'Paramètres en vigueur rechargés')}
                  >
                    Annuler les modifications
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<i className="ri-save-line" />}
                    disabled={save.isPending || !effectiveDate || !overview.data!.storage_available}
                    onClick={handleSave}
                  >
                    Enregistrer une nouvelle version
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tab === 'simulator' && (
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Simulateur de bulletin</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={`Salaire brut mensuel (${currency})`}
                  value={simulationGross}
                  onChange={event => setSimulationGross(Number(event.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Paramètres utilisés"
                  value={simulationSource}
                  onChange={event => setSimulationSource(event.target.value as 'draft' | 'saved')}
                >
                  <MenuItem value="draft">Formulaire en cours (non enregistré)</MenuItem>
                  <MenuItem value="saved">Version enregistrée en vigueur à une date</MenuItem>
                </TextField>
              </Grid>
              {simulationSource === 'saved' && (
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={simulationDate}
                    onChange={event => setSimulationDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button fullWidth variant="contained" disabled={simulation.isPending} onClick={handleSimulate}>
                  Simuler
                </Button>
              </Grid>
            </Grid>

            {simulation.isPending && <CircularProgress />}
            {result && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ligne</TableCell>
                      <TableCell align="right">Base</TableCell>
                      <TableCell align="right">Taux salarié</TableCell>
                      <TableCell align="right">Part salariale</TableCell>
                      <TableCell align="right">Taux employeur</TableCell>
                      <TableCell align="right">Part patronale</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Salaire brut</strong>
                      </TableCell>
                      <TableCell align="right" colSpan={5}>
                        <strong>{formatAmount(result.gross_salary, result.currency_label)}</strong>
                      </TableCell>
                    </TableRow>
                    {result.contributions.map(line => (
                      <TableRow key={line.code}>
                        <TableCell>
                          {line.label}
                          {line.tax_deductible && (
                            <Chip size="small" sx={{ ml: 1 }} label="déductible" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="right">{formatAmount(line.base, result.currency_label)}</TableCell>
                        <TableCell align="right">{line.employee_rate} %</TableCell>
                        <TableCell align="right">{formatAmount(line.employee_amount, result.currency_label)}</TableCell>
                        <TableCell align="right">{line.employer_rate} %</TableCell>
                        <TableCell align="right">{formatAmount(line.employer_amount, result.currency_label)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>Base imposable avant abattement</TableCell>
                      <TableCell align="right">{formatAmount(result.taxable_before_allowance, result.currency_label)}</TableCell>
                      <TableCell colSpan={4} />
                    </TableRow>
                    {result.flat_allowance_amount > 0 && (
                      <TableRow>
                        <TableCell>Abattement forfaitaire ({result.flat_allowance_rate} %)</TableCell>
                        <TableCell align="right">− {formatAmount(result.flat_allowance_amount, result.currency_label)}</TableCell>
                        <TableCell colSpan={4} />
                      </TableRow>
                    )}
                    {result.income_tax_brackets
                      .filter(bracket => bracket.base > 0)
                      .map(bracket => (
                        <TableRow key={bracket.from}>
                          <TableCell sx={{ pl: 4 }}>
                            Tranche {formatAmount(bracket.from, result.currency_label)} →{' '}
                            {bracket.to === null ? '…' : formatAmount(bracket.to, result.currency_label)}
                          </TableCell>
                          <TableCell align="right">{formatAmount(bracket.base, result.currency_label)}</TableCell>
                          <TableCell align="right">{bracket.rate} %</TableCell>
                          <TableCell align="right">{formatAmount(bracket.amount, result.currency_label)}</TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>
                      ))}
                    <TableRow>
                      <TableCell>{result.income_tax_label}</TableCell>
                      <TableCell align="right">{formatAmount(result.taxable_income, result.currency_label)}</TableCell>
                      <TableCell />
                      <TableCell align="right">{formatAmount(result.income_tax, result.currency_label)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                    {result.employer_charges.map(line => (
                      <TableRow key={line.code}>
                        <TableCell>{line.label}</TableCell>
                        <TableCell align="right">{formatAmount(line.base, result.currency_label)}</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell align="right">{line.rate} %</TableCell>
                        <TableCell align="right">{formatAmount(line.amount, result.currency_label)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <strong>Totaux</strong>
                      </TableCell>
                      <TableCell colSpan={2} />
                      <TableCell align="right">
                        <strong>
                          {formatAmount(result.total_employee_contributions + result.income_tax, result.currency_label)}
                        </strong>
                      </TableCell>
                      <TableCell />
                      <TableCell align="right">
                        <strong>{formatAmount(result.total_employer_charges, result.currency_label)}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Net à payer (avant avances et retenues individuelles)</strong>
                      </TableCell>
                      <TableCell align="right" colSpan={5}>
                        <strong>{formatAmount(result.net_salary, result.currency_label)}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Coût total employeur</strong>
                      </TableCell>
                      <TableCell align="right" colSpan={5}>
                        <strong>{formatAmount(result.employer_cost, result.currency_label)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {result && (
              <Typography variant="caption" color="text.secondary">
                {result.settings_version.is_draft
                  ? 'Calcul effectué avec le formulaire en cours (non enregistré).'
                  : result.settings_version.is_default
                    ? 'Calcul effectué avec les valeurs par défaut (aucune version enregistrée à cette date).'
                    : `Calcul effectué avec la version ${result.settings_version.version} (en vigueur depuis le ${formatDate(result.settings_version.effective_date)}).`}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'history' && (
        <Card>
          <CardContent>
            {versions.isLoading && <CircularProgress />}
            {versions.isError && <Alert severity="error">{getPayrollErrorMessage(versions.error)}</Alert>}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>Date d’effet</TableCell>
                    <TableCell>Enregistrée le</TableCell>
                    <TableCell>Cotisations</TableCell>
                    <TableCell>Tranches d’impôt</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedVersions.length === 0 && !versions.isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucune version enregistrée : les calculs utilisent les valeurs par défaut.
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedVersions.map(version => (
                    <TableRow key={version.id ?? version.version}>
                      <TableCell>
                        v{version.version}
                        {current.id === version.id && <Chip size="small" color="primary" sx={{ ml: 1 }} label="en vigueur" />}
                      </TableCell>
                      <TableCell>{formatDate(version.effective_date)}</TableCell>
                      <TableCell>{formatDate(version.created_at)}</TableCell>
                      <TableCell>
                        {version.settings.contributions
                          .filter(line => line.active)
                          .map(line => `${line.label} (${line.employee_rate} % / ${line.employer_rate} %)`)
                          .join(' ; ') || '—'}
                      </TableCell>
                      <TableCell>{version.settings.income_tax.brackets.length}</TableCell>
                      <TableCell>{version.notes || '—'}</TableCell>
                      <TableCell align="center">
                        {!readOnly && (
                          <Button
                            size="small"
                            onClick={() => loadSettings(version.settings, `Version ${version.version} chargée dans le formulaire`)}
                          >
                            Repartir de cette version
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
