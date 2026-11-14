'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
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

import type {
  BulkBillingLineStatus,
  BulkBillingPreview,
  BulkBillingRequest,
  BulkBillingResult,
  BulkBillingScope,
} from '../../types';
import {
  useBulkBillingTargets,
  useFeeTypeList,
  useGenerateBulkBilling,
  usePreviewBulkBilling,
} from '../hooks/useInvoices';
import { formatXof } from './ReceiptDialog';

const STEPS = ['Cible', 'Frais & échéance', 'Aperçu', 'Résultat'];

const LINE_STATUS: Record<BulkBillingLineStatus, { label: string; color: 'primary' | 'default' | 'warning' }> = {
  to_invoice: { label: 'à facturer', color: 'primary' },
  already_invoiced: { label: 'déjà facturé', color: 'warning' },
  not_applicable: { label: 'hors niveau', color: 'default' },
};

const today = (): string => new Date().toISOString().slice(0, 10);

const inDays = (days: number): string => {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const errors = err?.response?.data?.errors;

  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat()[0];

    if (typeof first === 'string') return first;
  }

  return err?.response?.data?.message || fallback;
};

const SummaryTile: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight="bold" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const BulkBillingWizard: React.FC = () => {
  const { tenantId } = useTenant();
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const authUser = useAuthUser();
  const canBill = (authUser?.roles ?? []).some(r => r === 'Administrator' || r === 'Comptable');

  const { academicYears } = useAcademicYears();
  const [academicYearId, setAcademicYearId] = useState<number | ''>('');

  useEffect(() => {
    if (academicYearId === '' && academicYears.length > 0) {
      const active = academicYears.find(y => y.is_active);

      if (active) setAcademicYearId(active.id);
    }
  }, [academicYears, academicYearId]);

  const yearId = academicYearId === '' ? undefined : academicYearId;
  const { data: targets, isLoading: targetsLoading } = useBulkBillingTargets(canBill ? yearId : undefined, tenantId || undefined);

  const { data: feeTypes = [], isLoading: feeTypesLoading } = useFeeTypeList(
    yearId ? { academic_year_id: yearId } : undefined,
    tenantId || undefined,
  );

  const previewMutation = usePreviewBulkBilling(tenantId || undefined);
  const generateMutation = useGenerateBulkBilling(tenantId || undefined);

  const [activeStep, setActiveStep] = useState(0);
  const [scope, setScope] = useState<BulkBillingScope>('classe');
  const [classeId, setClasseId] = useState<number | ''>('');
  const [levelId, setLevelId] = useState<number | ''>('');
  const [feeTypeIds, setFeeTypeIds] = useState<number[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(inDays(30));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BulkBillingPreview | null>(null);
  const [result, setResult] = useState<BulkBillingResult | null>(null);

  const targetStudentsCount = useMemo(() => {
    if (!targets) return 0;
    if (scope === 'year') return targets.total_students;
    if (scope === 'classe') return targets.classes.find(c => c.id === classeId)?.students_count ?? 0;

    return targets.levels.find(l => l.id === levelId)?.students_count ?? 0;
  }, [targets, scope, classeId, levelId]);

  const targetLabel = useMemo(() => {
    if (!targets) return '';
    if (scope === 'year') return `Toute l'année ${targets.academic_year.name}`;
    if (scope === 'classe') return `Classe ${targets.classes.find(c => c.id === classeId)?.name ?? ''}`;

    return `Niveau ${targets.levels.find(l => l.id === levelId)?.name ?? ''}`;
  }, [targets, scope, classeId, levelId]);

  const isTargetValid =
    !!yearId && (scope === 'year' || (scope === 'classe' && classeId !== '') || (scope === 'level' && levelId !== ''));

  const buildPayload = (): BulkBillingRequest => ({
    academic_year_id: Number(yearId),
    scope,
    classe_id: scope === 'classe' ? Number(classeId) : null,
    level_id: scope === 'level' ? Number(levelId) : null,
    fee_type_ids: feeTypeIds,
    invoice_date: invoiceDate || undefined,
    due_date: dueDate,
    notes: notes.trim() || undefined,
  });

  const toggleFeeType = (id: number) => {
    setFeeTypeIds(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  };

  const handlePreview = async () => {
    setError(null);

    if (feeTypeIds.length === 0 || !dueDate) {
      setError('Choisissez au moins un type de frais et une échéance.');

      return;
    }

    try {
      const data = await previewMutation.mutateAsync(buildPayload());

      setPreview(data);
      setActiveStep(2);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erreur lors du calcul de l\'aperçu.'));
    }
  };

  const handleGenerate = async () => {
    setError(null);

    try {
      const data = await generateMutation.mutateAsync(buildPayload());

      setResult(data);
      setActiveStep(3);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Erreur lors de la génération des factures.'));
    }
  };

  const handleRestart = () => {
    setActiveStep(0);
    setPreview(null);
    setResult(null);
    setFeeTypeIds([]);
    setNotes('');
    setError(null);
  };

  if (authUser && !canBill) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">La facturation en masse est réservée à l&apos;Administrator et au Comptable.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Comptabilit&eacute;
        </Link>
        <Typography color="text.primary">Facturation en masse</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Facturation en masse
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Une facture par élève inscrit (inscription en classe active). Un frais déjà facturé au même élève pour la même
        année est ignoré automatiquement.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {STEPS.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Année scolaire</InputLabel>
                  <Select
                    label="Année scolaire"
                    value={academicYearId}
                    onChange={e => {
                      setAcademicYearId(e.target.value as number);
                      setClasseId('');
                      setLevelId('');
                      setFeeTypeIds([]);
                    }}
                  >
                    {academicYears.map(year => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                        {year.is_active ? ' (active)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <FormControl>
                  <FormLabel>Cible</FormLabel>
                  <RadioGroup row value={scope} onChange={e => setScope(e.target.value as BulkBillingScope)}>
                    <FormControlLabel value="classe" control={<Radio />} label="Une classe" />
                    <FormControlLabel value="level" control={<Radio />} label="Un niveau" />
                    <FormControlLabel value="year" control={<Radio />} label="Toute l'année" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {targetsLoading && (
                <Grid size={12}>
                  <CircularProgress size={24} />
                </Grid>
              )}

              {scope === 'classe' && targets && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Classe</InputLabel>
                    <Select label="Classe" value={classeId} onChange={e => setClasseId(e.target.value as number)}>
                      {targets.classes.map(classe => (
                        <MenuItem key={classe.id} value={classe.id}>
                          {classe.name} — {classe.students_count} élève(s)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {scope === 'level' && targets && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Niveau</InputLabel>
                    <Select label="Niveau" value={levelId} onChange={e => setLevelId(e.target.value as number)}>
                      {targets.levels.map(level => (
                        <MenuItem key={level.id} value={level.id}>
                          {level.name} — {level.students_count} élève(s)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {isTargetValid && targets && (
                <Grid size={12}>
                  <Alert severity={targetStudentsCount > 0 ? 'info' : 'warning'}>
                    {targetLabel} : {targetStudentsCount} élève(s) inscrit(s) actif(s).
                  </Alert>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" disabled={!isTargetValid || targetStudentsCount === 0} onClick={() => setActiveStep(1)}>
                Suivant
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Types de frais à facturer ({targetLabel})
            </Typography>
            {feeTypesLoading ? (
              <CircularProgress size={24} />
            ) : feeTypes.length === 0 ? (
              <Alert severity="warning">
                Aucun type de frais actif pour cette année. Créez-en dans Comptabilité &gt; Types de frais.
              </Alert>
            ) : (
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {feeTypes.map(feeType => {
                  const levelAmounts = feeType.applies_to?.level_amounts ?? {};
                  const levelCodes = feeType.applies_to?.levels ?? [];
                  const hasLevelAmounts = Object.keys(levelAmounts).length > 0;

                  return (
                    <Grid key={feeType.id} size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={<Checkbox checked={feeTypeIds.includes(feeType.id)} onChange={() => toggleFeeType(feeType.id)} />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {feeType.name} — {formatXof(feeType.default_amount)}
                              {hasLevelAmounts ? ' (montants par niveau)' : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {feeType.code}
                              {levelCodes.length > 0 ? ` · niveaux : ${levelCodes.join(', ')}` : ' · tous niveaux'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Date de facture"
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Échéance"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Notes (facultatif)" value={notes} onChange={e => setNotes(e.target.value)} fullWidth />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setActiveStep(0)}>Retour</Button>
              <Button
                variant="contained"
                disabled={feeTypeIds.length === 0 || !dueDate || previewMutation.isPending}
                onClick={handlePreview}
              >
                {previewMutation.isPending ? <CircularProgress size={20} /> : 'Voir l\'aperçu'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && preview && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile label="Élèves ciblés" value={preview.summary.students_count} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile label="Factures à créer" value={preview.summary.invoices_count} color="primary.main" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile label="Élèves ignorés (déjà facturés)" value={preview.summary.skipped_students_count} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile label="Montant total" value={formatXof(preview.summary.total_amount)} color="success.main" />
            </Grid>
          </Grid>

          {preview.summary.already_invoiced_lines_count > 0 && (
            <Alert severity="warning">
              {preview.summary.already_invoiced_lines_count} frais déjà facturé(s) cette année seront ignorés (pas de doublon).
            </Alert>
          )}

          <Card>
            <TableContainer sx={{ maxHeight: 480 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Élève</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Frais</TableCell>
                    <TableCell align="right">Total facture</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.students.map(student => (
                    <TableRow key={student.student_id} sx={{ opacity: student.will_invoice ? 1 : 0.55 }}>
                      <TableCell>
                        {student.student_name}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {student.matricule ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{student.classe_name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {student.items.map(item => (
                            <Chip
                              key={item.fee_type_id}
                              size="small"
                              variant={item.status === 'to_invoice' ? 'filled' : 'outlined'}
                              color={LINE_STATUS[item.status].color}
                              label={
                                item.status === 'to_invoice'
                                  ? `${item.name} : ${formatXof(item.net_amount)}${item.discount_amount > 0 ? ' (remise)' : ''}`
                                  : `${item.name} : ${LINE_STATUS[item.status].label}`
                              }
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{student.will_invoice ? formatXof(student.total_amount) : 'ignoré'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setActiveStep(1)} disabled={generateMutation.isPending}>
              Retour
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={preview.summary.invoices_count === 0 || generateMutation.isPending}
              onClick={handleGenerate}
            >
              {generateMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                `Confirmer : générer ${preview.summary.invoices_count} facture(s)`
              )}
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 3 && result && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success">
            {result.summary.invoices_count} facture(s) générée(s) pour un total de {formatXof(result.summary.total_amount)}.
            {result.summary.skipped_students_count > 0 &&
              ` ${result.summary.skipped_students_count} élève(s) ignoré(s) (frais déjà facturés).`}
          </Alert>

          {result.invoices.length > 0 && (
            <Card>
              <TableContainer sx={{ maxHeight: 480 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° facture</TableCell>
                      <TableCell>Élève</TableCell>
                      <TableCell>Classe</TableCell>
                      <TableCell align="right">Montant</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.invoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.student_name}</TableCell>
                        <TableCell>{invoice.classe_name}</TableCell>
                        <TableCell align="right">{formatXof(invoice.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => router.push(`/${lang}/admin/finance/invoices`)}>Voir la facturation</Button>
            <Button variant="contained" onClick={handleRestart}>
              Nouvelle facturation en masse
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
