'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import { useEquivalences, useTransfers } from '../hooks/useTransfers';
import { EquivalenceFormDialog } from './EquivalenceFormDialog';

import type { Transfer, Equivalence, OriginModule, EquivalenceType } from '../../types/transfer.types';

interface EquivalenceMatcherDialogProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
}

interface OriginModuleInput extends OriginModule {
  id: string;
}

/**
 * Get equivalence type color
 */
const getEquivalenceTypeColor = (type: EquivalenceType): 'success' | 'warning' | 'error' | 'default' => {
  switch (type) {
    case 'Full':
      return 'success';
    case 'Partial':
      return 'warning';
    case 'None':
      return 'error';
    case 'Exemption':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * EquivalenceMatcherDialog Component
 * Dialog for managing equivalences for a transfer
 */
export const EquivalenceMatcherDialog = ({ open, onClose, transfer }: EquivalenceMatcherDialogProps) => {
  const { t } = useTranslation('Enrollment');
  const {
    equivalences,
    loading: loadingEquivalences,
    refresh: refreshEquivalences,
    validateEquivalence,
    rejectEquivalence,
    batchValidate,
    deleteEquivalence,
  } = useEquivalences(transfer?.id || null);

  const { analyzeEquivalences, validateTransfer } = useTransfers();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Origin modules for analysis
  const [originModules, setOriginModules] = useState<OriginModuleInput[]>([]);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedEquivalence, setSelectedEquivalence] = useState<Equivalence | null>(null);

  // Loading and error states
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Calculate selectable count (only proposed equivalences)
  const selectableEquivalences = useMemo(() => equivalences.filter(e => e.can_be_validated), [equivalences]);
  const selectableCount = selectableEquivalences.length;

  // Stats
  const stats = useMemo(() => {
    return {
      total: equivalences.length,
      proposed: equivalences.filter(e => e.status === 'Proposed').length,
      validated: equivalences.filter(e => e.status === 'Validated').length,
      rejected: equivalences.filter(e => e.status === 'Rejected').length,
      totalEctsGranted: equivalences.filter(e => e.status === 'Validated').reduce((sum, e) => sum + (e.granted_ects || 0), 0),
    };
  }, [equivalences]);

  // Selection handlers
  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedIds(selectableEquivalences.map(e => e.id));
      } else {
        setSelectedIds([]);
      }
    },
    [selectableEquivalences]
  );

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  }, []);

  // Origin module handlers
  const addOriginModule = useCallback(() => {
    setOriginModules(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        ects: 0,
        hours: 0,
        grade: null,
      },
    ]);
  }, []);

  const updateOriginModule = useCallback((id: string, field: keyof OriginModule, value: string | number | null) => {
    setOriginModules(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  }, []);

  const removeOriginModule = useCallback((id: string) => {
    setOriginModules(prev => prev.filter(m => m.id !== id));
  }, []);

  // Analyze equivalences
  const handleAnalyze = useCallback(async () => {
    if (!transfer || originModules.length === 0) {
      setError(t('Please add at least one module to analyze'));

      return;
    }

    // Validate modules
    const validModules = originModules.filter(m => m.name.trim() && m.ects > 0);

    if (validModules.length === 0) {
      setError(t('Please fill in the module information correctly'));

      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      const result = await analyzeEquivalences(transfer.id, validModules);

      setSnackbar({
        open: true,
        message: t('{{count}} equivalence(s) suggested', { count: result.suggestions_count }),
        severity: 'success',
      });

      setOriginModules([]);
      refreshEquivalences();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || t('Error during analysis');
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  }, [transfer, originModules, analyzeEquivalences, refreshEquivalences]);

  // Equivalence actions
  const handleValidateOne = useCallback(
    async (equivalence: Equivalence) => {
      try {
        await validateEquivalence(equivalence.id);
        setSnackbar({ open: true, message: t('Equivalence validated'), severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || t('Error'), severity: 'error' });
      }
    },
    [validateEquivalence, t]
  );

  const handleRejectOne = useCallback(
    async (equivalence: Equivalence) => {
      try {
        await rejectEquivalence(equivalence.id);
        setSnackbar({ open: true, message: t('Equivalence rejected'), severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || t('Error'), severity: 'error' });
      }
    },
    [rejectEquivalence, t]
  );

  const handleDeleteOne = useCallback(
    async (equivalence: Equivalence) => {
      try {
        await deleteEquivalence(equivalence.id);
        setSnackbar({ open: true, message: t('Equivalence deleted'), severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err.message || t('Error'), severity: 'error' });
      }
    },
    [deleteEquivalence, t]
  );

  const handleBatchValidate = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      const result = await batchValidate(selectedIds);
      setSnackbar({
        open: true,
        message: t('{{count}} equivalence(s) validated', { count: result.validated_count }),
        severity: result.errors.length > 0 ? 'warning' : 'success',
      });
      setSelectedIds([]);
    } catch (err: any) {
      setSnackbar({ open: true, message: t('Error during batch validation'), severity: 'error' });
    }
  }, [selectedIds, batchValidate, t]);

  // Validate transfer
  const handleValidateTransfer = useCallback(async () => {
    if (!transfer) return;

    try {
      await validateTransfer(transfer.id);
      setSnackbar({ open: true, message: t('Transfer validated successfully'), severity: 'success' });
      onClose();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || t('Error'), severity: 'error' });
    }
  }, [transfer, validateTransfer, onClose, t]);

  // Open form dialog for manual equivalence
  const handleOpenForm = useCallback((equivalence?: Equivalence) => {
    setSelectedEquivalence(equivalence || null);
    setFormDialogOpen(true);
  }, []);

  if (!transfer) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <i className="ri-exchange-line" />
            </Avatar>
            <Box>
              <Typography variant="h6">{t('Equivalences management')}</Typography>
              <Typography variant="body2" color="textSecondary">
                {transfer.transfer_number} - {transfer.full_name}
              </Typography>
            </Box>
          </Box>
          <Chip label={`${stats.validated}/${stats.total} ${t('validated')}`} color="primary" />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="primary">{stats.total}</Typography>
                <Typography variant="caption">Total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="warning.main">{stats.proposed}</Typography>
                <Typography variant="caption">En attente</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="success.main">{stats.validated}</Typography>
                <Typography variant="caption">Validées</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h5" color="info.main">{stats.totalEctsGranted}</Typography>
                <Typography variant="caption">ECTS accordés</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`${t('Equivalences')} (${equivalences.length})`} />
          <Tab label={t('Analyze new modules')} />
        </Tabs>

        {/* Tab 0: Equivalences List */}
        {activeTab === 0 && (
          <Box>
            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedIds.length > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<i className="ri-check-double-line" />}
                    onClick={handleBatchValidate}
                  >
                    {t('Validate')} ({selectedIds.length})
                  </Button>
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<i className="ri-add-line" />}
                onClick={() => handleOpenForm()}
              >
                {t('Manual equivalence')}
              </Button>
            </Box>

            {/* Table */}
            {loadingEquivalences ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : equivalences.length === 0 ? (
              <Alert severity="info">
                {t('No equivalences have been defined yet. Use the "Analyze new modules" tab or add a manual equivalence.')}
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedIds.length > 0 && selectedIds.length < selectableCount}
                          checked={selectableCount > 0 && selectedIds.length === selectableCount}
                          onChange={handleSelectAll}
                          disabled={selectableCount === 0}
                        />
                      </TableCell>
                      <TableCell>Module origine</TableCell>
                      <TableCell align="center">ECTS</TableCell>
                      <TableCell align="center">Note</TableCell>
                      <TableCell>Module cible</TableCell>
                      <TableCell align="center">Type</TableCell>
                      <TableCell align="center">ECTS accordés</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equivalences.map(equiv => {
                      const isSelectable = equiv.can_be_validated;
                      const isSelected = selectedIds.includes(equiv.id);

                      return (
                        <TableRow key={equiv.id} hover selected={isSelected}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectOne(equiv.id)}
                              disabled={!isSelectable}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{equiv.origin_module_name}</Typography>
                            {equiv.origin_module_code && (
                              <Typography variant="caption" color="textSecondary">{equiv.origin_module_code}</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">{equiv.origin_ects}</TableCell>
                          <TableCell align="center">
                            {equiv.origin_grade !== null ? `${equiv.origin_grade}/20` : '-'}
                          </TableCell>
                          <TableCell>
                            {equiv.target_module ? (
                              <Box>
                                <Typography variant="body2">{equiv.target_module.name}</Typography>
                                <Typography variant="caption" color="textSecondary">{equiv.target_module.code}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={equiv.equivalence_type_label}
                              color={getEquivalenceTypeColor(equiv.equivalence_type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {equiv.granted_ects}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {equiv.similarity_score > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={equiv.similarity_score}
                                  sx={{ width: 40, height: 6, borderRadius: 3 }}
                                  color={equiv.similarity_score > 70 ? 'success' : equiv.similarity_score > 40 ? 'warning' : 'error'}
                                />
                                <Typography variant="caption">{equiv.similarity_score}%</Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={equiv.status === 'Validated' ? 'Validée' : equiv.status === 'Rejected' ? 'Rejetée' : 'Proposée'}
                              color={equiv.status === 'Validated' ? 'success' : equiv.status === 'Rejected' ? 'error' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              {equiv.can_be_validated && (
                                <>
                                  <Tooltip title="Valider">
                                    <IconButton size="small" color="success" onClick={() => handleValidateOne(equiv)}>
                                      <i className="ri-check-line" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Rejeter">
                                    <IconButton size="small" color="error" onClick={() => handleRejectOne(equiv)}>
                                      <i className="ri-close-line" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {equiv.status === 'Proposed' && (
                                <>
                                  <Tooltip title="Modifier">
                                    <IconButton size="small" onClick={() => handleOpenForm(equiv)}>
                                      <i className="ri-pencil-line" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Supprimer">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteOne(equiv)}>
                                      <i className="ri-delete-bin-line" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 1: Analyze New Modules */}
        {activeTab === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('Add origin institution modules so the system can automatically suggest equivalences with target program modules.')}
            </Alert>

            {/* Origin Modules Input */}
            {originModules.map((module, index) => (
              <Card key={module.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nom du module"
                      value={module.name}
                      onChange={e => updateOriginModule(module.id, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Code"
                      value={module.code || ''}
                      onChange={e => updateOriginModule(module.id, 'code', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="ECTS"
                      type="number"
                      value={module.ects || ''}
                      onChange={e => updateOriginModule(module.id, 'ects', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 30 }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Heures"
                      type="number"
                      value={module.hours || ''}
                      onChange={e => updateOriginModule(module.id, 'hours', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Note /20"
                      type="number"
                      value={module.grade !== null ? module.grade : ''}
                      onChange={e => updateOriginModule(module.id, 'grade', e.target.value ? parseFloat(e.target.value) : null)}
                      inputProps={{ min: 0, max: 20, step: 0.5 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 1.5 }}>
                    <IconButton color="error" onClick={() => removeOriginModule(module.id)}>
                      <i className="ri-delete-bin-line" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="outlined" startIcon={<i className="ri-add-line" />} onClick={addOriginModule}>
                {t('Add a module')}
              </Button>
              {originModules.length > 0 && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <i className="ri-search-line" />}
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? t('Analyzing...') : t('Analyze and suggest equivalences')}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          {transfer.can_be_validated && stats.validated > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<i className="ri-check-double-line" />}
              onClick={handleValidateTransfer}
            >
              {t('Validate transfer')}
            </Button>
          )}
        </Box>
        <Button onClick={onClose}>{t('Close')}</Button>
      </DialogActions>

      {/* Form Dialog for Manual Equivalence */}
      <EquivalenceFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedEquivalence(null);
        }}
        onSuccess={() => {
          setSnackbar({ open: true, message: t('Equivalence saved'), severity: 'success' });
          refreshEquivalences();
        }}
        transfer={transfer}
        equivalence={selectedEquivalence}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
