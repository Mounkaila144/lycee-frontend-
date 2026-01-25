'use client';

import { useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';

import { useExemptions, useExemptionStatistics } from '../hooks/useExemptions';
import { ExemptionFormDialog } from './ExemptionFormDialog';
import { ExemptionDetailDialog } from './ExemptionDetailDialog';
import { ExemptionTeacherReviewDialog } from './ExemptionTeacherReviewDialog';
import { ExemptionValidationDialog } from './ExemptionValidationDialog';
import { ExemptionRevokeDialog } from './ExemptionRevokeDialog';

import type {
  ModuleExemption,
  ExemptionStatus,
  ExemptionReasonCategory,
} from '../../types/exemption.types';
import {
  EXEMPTION_STATUS_COLORS,
  EXEMPTION_STATUS_LABELS,
  REASON_CATEGORY_LABELS,
} from '../../types/exemption.types';

/**
 * Format date for display
 */
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Exemptions Component
 * Admin dashboard for managing module exemptions (dispenses)
 */
export const Exemptions = () => {
  const {
    exemptions,
    loading,
    error,
    pagination,
    params,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setReasonCategoryFilter,
    submitTeacherReview,
    validateExemption,
    revokeExemption,
    downloadCertificate,
    refresh,
  } = useExemptions({ page: 1, per_page: 10 });

  const { statistics } = useExemptionStatistics();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [teacherReviewDialogOpen, setTeacherReviewDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedExemption, setSelectedExemption] = useState<ModuleExemption | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Persistent error alert state
  const [alertError, setAlertError] = useState<string | null>(null);

  // Search debounce
  const [searchValue, setSearchValue] = useState('');

  // Selection handlers
  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const selectableIds = exemptions.filter(e => e.can_be_validated).map(e => e.id);
        setSelectedIds(selectableIds);
      } else {
        setSelectedIds([]);
      }
    },
    [exemptions]
  );

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  }, []);

  // Action handlers
  const handleViewDetails = useCallback((exemption: ModuleExemption) => {
    setSelectedExemption(exemption);
    setDetailDialogOpen(true);
  }, []);

  const handleOpenTeacherReview = useCallback((exemption: ModuleExemption) => {
    setSelectedExemption(exemption);
    setTeacherReviewDialogOpen(true);
  }, []);

  const handleOpenValidation = useCallback((exemption: ModuleExemption) => {
    setSelectedExemption(exemption);
    setValidationDialogOpen(true);
  }, []);

  const handleOpenRevoke = useCallback((exemption: ModuleExemption) => {
    setSelectedExemption(exemption);
    setRevokeDialogOpen(true);
  }, []);

  // Helper to extract error message from various error types
  const getErrorMessage = useCallback((err: any, defaultMessage: string): string => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }

    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;
      const firstError = Object.values(errors)[0];

      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0] as string;
      }
    }

    if (err?.message) {
      return err.message;
    }

    return defaultMessage;
  }, []);

  const handleConfirmTeacherReview = useCallback(
    async (opinion: string) => {
      if (!selectedExemption) return;

      setAlertError(null);

      try {
        await submitTeacherReview(selectedExemption.id, { opinion });
        setSnackbar({ open: true, message: 'Avis enregistré avec succès', severity: 'success' });
        setTeacherReviewDialogOpen(false);
        setSelectedExemption(null);
      } catch (err: any) {
        const message = getErrorMessage(err, "Erreur lors de l'enregistrement de l'avis");
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [selectedExemption, submitTeacherReview, getErrorMessage]
  );

  const handleConfirmValidation = useCallback(
    async (data: { decision: 'Approved' | 'Partially_Approved' | 'Rejected'; notes?: string; grade?: number; rejection_reason?: string }) => {
      if (!selectedExemption) return;

      setAlertError(null);

      try {
        await validateExemption(selectedExemption.id, data);
        const successMessage = data.decision === 'Rejected' ? 'Dispense rejetée' : 'Dispense validée avec succès';
        setSnackbar({ open: true, message: successMessage, severity: 'success' });
        setValidationDialogOpen(false);
        setSelectedExemption(null);
      } catch (err: any) {
        const message = getErrorMessage(err, 'Erreur lors de la validation');
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [selectedExemption, validateExemption, getErrorMessage]
  );

  const handleConfirmRevoke = useCallback(
    async (reason: string) => {
      if (!selectedExemption) return;

      setAlertError(null);

      try {
        await revokeExemption(selectedExemption.id, { reason });
        setSnackbar({ open: true, message: 'Dispense révoquée', severity: 'success' });
        setRevokeDialogOpen(false);
        setSelectedExemption(null);
      } catch (err: any) {
        const message = getErrorMessage(err, 'Erreur lors de la révocation');
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [selectedExemption, revokeExemption, getErrorMessage]
  );

  const handleDownloadCertificate = useCallback(
    async (exemption: ModuleExemption) => {
      setAlertError(null);

      try {
        await downloadCertificate(exemption.id, exemption.exemption_number);
        setSnackbar({ open: true, message: 'Attestation téléchargée', severity: 'success' });
      } catch (err: any) {
        const message = getErrorMessage(err, 'Erreur lors du téléchargement');
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [downloadCertificate, getErrorMessage]
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      setPage(newPage + 1);
    },
    [setPage]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10));
    },
    [setPageSize]
  );

  // Filter handlers
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);

      const timeoutId = setTimeout(() => {
        setSearch(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [setSearch]
  );

  const handleStatusFilterChange = useCallback(
    (event: any) => {
      setStatusFilter(event.target.value || undefined);
    },
    [setStatusFilter]
  );

  const handleReasonFilterChange = useCallback(
    (event: any) => {
      setReasonCategoryFilter(event.target.value || undefined);
    },
    [setReasonCategoryFilter]
  );

  // Calculate selectable count
  const selectableCount = useMemo(() => exemptions.filter(e => e.can_be_validated).length, [exemptions]);

  return (
    <Box>
      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main">
                  {statistics.total}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {statistics.pending}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {statistics.under_review}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En examen
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {statistics.approved}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Approuvées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main">
                  {statistics.rejected}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Rejetées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="secondary.main">
                  {statistics.acceptance_rate?.toFixed(0) || 0}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Taux accept.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardHeader
          title="Gestion des Dispenses"
          subheader="Traitez les demandes de dispense de modules"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<i className="ri-add-line" />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Nouvelle demande
              </Button>
            </Box>
          }
        />
        <CardContent>
          {/* Persistent Error Alert */}
          {alertError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAlertError(null)}>
              {alertError}
            </Alert>
          )}

          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher par numéro, matricule, nom..."
                value={searchValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="ri-search-line" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select value={params.status || ''} label="Statut" onChange={handleStatusFilterChange}>
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Pending">En attente</MenuItem>
                  <MenuItem value="Under_Review">En cours d&apos;examen</MenuItem>
                  <MenuItem value="Approved">Approuvée</MenuItem>
                  <MenuItem value="Partially_Approved">Partiellement approuvée</MenuItem>
                  <MenuItem value="Rejected">Rejetée</MenuItem>
                  <MenuItem value="Revoked">Révoquée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Motif</InputLabel>
                <Select value={params.reason_category || ''} label="Motif" onChange={handleReasonFilterChange}>
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="VAE">VAE</MenuItem>
                  <MenuItem value="Prior_Training">Formation antérieure</MenuItem>
                  <MenuItem value="Professional_Certification">Certification pro.</MenuItem>
                  <MenuItem value="Special_Situation">Situation particulière</MenuItem>
                  <MenuItem value="Double_Degree">Double cursus</MenuItem>
                  <MenuItem value="Other">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="outlined" startIcon={<i className="ri-refresh-line" />} onClick={refresh} fullWidth>
                Actualiser
              </Button>
            </Grid>
          </Grid>

          {/* Table */}
          {loading && exemptions.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error.message}</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
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
                      <TableCell>N° Dispense</TableCell>
                      <TableCell>Etudiant</TableCell>
                      <TableCell>Module</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Motif</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exemptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Aucune demande de dispense trouvée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      exemptions.map(exemption => {
                        const isSelectable = exemption.can_be_validated;
                        const isSelected = selectedIds.includes(exemption.id);

                        return (
                          <TableRow key={exemption.id} hover selected={isSelected}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleSelectOne(exemption.id)}
                                disabled={!isSelectable}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500} color="primary">
                                {exemption.exemption_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                  {exemption.student?.firstname?.[0]}
                                  {exemption.student?.lastname?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {exemption.student?.firstname} {exemption.student?.lastname}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {exemption.student?.matricule}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{exemption.module?.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {exemption.module?.code} - {exemption.module?.ects} ECTS
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={exemption.exemption_type_label}
                                size="small"
                                variant="outlined"
                                color={
                                  exemption.exemption_type === 'Full'
                                    ? 'primary'
                                    : exemption.exemption_type === 'Partial'
                                      ? 'secondary'
                                      : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={REASON_CATEGORY_LABELS[exemption.reason_category as ExemptionReasonCategory] || exemption.reason_category}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                                  {exemption.reason_category_label}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={EXEMPTION_STATUS_LABELS[exemption.status as ExemptionStatus] || exemption.status}
                                color={EXEMPTION_STATUS_COLORS[exemption.status as ExemptionStatus] || 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">{formatDate(exemption.created_at)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Détails">
                                  <IconButton size="small" onClick={() => handleViewDetails(exemption)}>
                                    <i className="ri-eye-line" />
                                  </IconButton>
                                </Tooltip>
                                {exemption.can_be_reviewed && (
                                  <Tooltip title="Donner un avis">
                                    <IconButton size="small" color="info" onClick={() => handleOpenTeacherReview(exemption)}>
                                      <i className="ri-message-2-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {exemption.can_be_validated && (
                                  <Tooltip title="Valider/Rejeter">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenValidation(exemption)}>
                                      <i className="ri-checkbox-circle-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {exemption.can_be_revoked && (
                                  <Tooltip title="Révoquer">
                                    <IconButton size="small" color="error" onClick={() => handleOpenRevoke(exemption)}>
                                      <i className="ri-close-circle-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {exemption.certificate_path && (
                                  <Tooltip title="Télécharger attestation">
                                    <IconButton size="small" onClick={() => handleDownloadCertificate(exemption)}>
                                      <i className="ri-file-pdf-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={pagination.total}
                page={pagination.current_page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={pagination.per_page}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Lignes par page"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <ExemptionFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setSnackbar({ open: true, message: 'Demande de dispense créée avec succès', severity: 'success' });
          refresh();
        }}
      />

      {/* Detail Dialog */}
      <ExemptionDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        exemption={selectedExemption}
      />

      {/* Teacher Review Dialog */}
      <ExemptionTeacherReviewDialog
        open={teacherReviewDialogOpen}
        onClose={() => setTeacherReviewDialogOpen(false)}
        onConfirm={handleConfirmTeacherReview}
        exemption={selectedExemption}
      />

      {/* Validation Dialog */}
      <ExemptionValidationDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        onConfirm={handleConfirmValidation}
        exemption={selectedExemption}
      />

      {/* Revoke Dialog */}
      <ExemptionRevokeDialog
        open={revokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        onConfirm={handleConfirmRevoke}
        exemption={selectedExemption}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
