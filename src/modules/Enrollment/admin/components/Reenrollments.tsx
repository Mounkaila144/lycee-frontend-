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

import { useReenrollments, useReenrollmentStatistics } from '../hooks/useReenrollments';
import { useReenrollmentCampaigns } from '../hooks/useReenrollmentCampaigns';
import { ReenrollmentValidationDialog } from './ReenrollmentValidationDialog';
import { ReenrollmentRejectDialog } from './ReenrollmentRejectDialog';
import { ReenrollmentDetailDialog } from './ReenrollmentDetailDialog';

import type { Reenrollment, ReenrollmentStatus, EligibilityStatus } from '../../types/reenrollment.types';

/**
 * Get status chip color
 */
const getStatusColor = (status: ReenrollmentStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Submitted':
      return 'warning';
    case 'Validated':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get eligibility chip color
 */
const getEligibilityColor = (status: EligibilityStatus): 'default' | 'success' | 'error' => {
  switch (status) {
    case 'Eligible':
      return 'success';
    case 'Not_Eligible':
      return 'error';
    case 'Pending':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Format date for display
 */
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Reenrollments Component
 * Admin dashboard for managing reenrollments
 */
export const Reenrollments = () => {
  const {
    reenrollments,
    loading,
    error,
    pagination,
    params,
    setPage,
    setPageSize,
    setSearch,
    setCampaignFilter,
    setStatusFilter,
    validateReenrollment,
    rejectReenrollment,
    batchValidate,
    downloadConfirmation,
    refresh,
  } = useReenrollments({ page: 1, per_page: 10 });

  const { campaigns } = useReenrollmentCampaigns({ per_page: 100 });
  const { statistics } = useReenrollmentStatistics(params.campaign_id);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Dialog states
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReenrollment, setSelectedReenrollment] = useState<Reenrollment | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Search debounce
  const [searchValue, setSearchValue] = useState('');

  // Selection handlers
  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const selectableIds = reenrollments.filter(r => r.status === 'Submitted' && r.can_be_validated).map(r => r.id);
        setSelectedIds(selectableIds);
      } else {
        setSelectedIds([]);
      }
    },
    [reenrollments]
  );

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  }, []);

  // Action handlers
  const handleValidate = useCallback((reenrollment: Reenrollment) => {
    setSelectedReenrollment(reenrollment);
    setValidateDialogOpen(true);
  }, []);

  const handleReject = useCallback((reenrollment: Reenrollment) => {
    setSelectedReenrollment(reenrollment);
    setRejectDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((reenrollment: Reenrollment) => {
    setSelectedReenrollment(reenrollment);
    setDetailDialogOpen(true);
  }, []);

  const handleDownloadPdf = useCallback(
    async (reenrollment: Reenrollment) => {
      try {
        await downloadConfirmation(reenrollment.id, reenrollment.student?.matricule || 'unknown');
        setSnackbar({ open: true, message: 'PDF téléchargé avec succès', severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: 'Erreur lors du téléchargement', severity: 'error' });
      }
    },
    [downloadConfirmation]
  );

  const handleConfirmValidation = useCallback(async () => {
    if (!selectedReenrollment) return;

    try {
      await validateReenrollment(selectedReenrollment.id);
      setSnackbar({ open: true, message: 'Réinscription validée avec succès', severity: 'success' });
      setValidateDialogOpen(false);
      setSelectedReenrollment(null);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de la validation';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  }, [selectedReenrollment, validateReenrollment]);

  const handleConfirmRejection = useCallback(
    async (reason: string) => {
      if (!selectedReenrollment) return;

      try {
        await rejectReenrollment(selectedReenrollment.id, reason);
        setSnackbar({ open: true, message: 'Réinscription rejetée', severity: 'success' });
        setRejectDialogOpen(false);
        setSelectedReenrollment(null);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Erreur lors du rejet';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [selectedReenrollment, rejectReenrollment]
  );

  const handleBatchValidate = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      const result = await batchValidate(selectedIds);
      const message = `${result.validated.length} réinscription(s) validée(s)${result.errors.length > 0 ? `, ${result.errors.length} erreur(s)` : ''}`;
      setSnackbar({
        open: true,
        message,
        severity: result.errors.length > 0 ? 'warning' : 'success',
      });
      setSelectedIds([]);
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la validation groupée', severity: 'error' });
    }
  }, [selectedIds, batchValidate]);

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

      // Debounce search
      const timeoutId = setTimeout(() => {
        setSearch(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [setSearch]
  );

  const handleCampaignFilterChange = useCallback(
    (event: any) => {
      setCampaignFilter(event.target.value || undefined);
    },
    [setCampaignFilter]
  );

  const handleStatusFilterChange = useCallback(
    (event: any) => {
      setStatusFilter(event.target.value || undefined);
    },
    [setStatusFilter]
  );

  // Calculate selectable count
  const selectableCount = useMemo(
    () => reenrollments.filter(r => r.status === 'Submitted' && r.can_be_validated).length,
    [reenrollments]
  );

  return (
    <Box>
      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {statistics.total}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {statistics.by_status.submitted}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics.by_status.validated}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Validées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {statistics.by_status.rejected}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Rejetées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardHeader
          title="Gestion des Réinscriptions"
          subheader="Validez et gérez les demandes de réinscription"
          action={
            selectedIds.length > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<i className="ri-check-double-line" />}
                onClick={handleBatchValidate}
              >
                Valider ({selectedIds.length})
              </Button>
            )
          }
        />
        <CardContent>
          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher un étudiant..."
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
                <InputLabel>Campagne</InputLabel>
                <Select value={params.campaign_id || ''} label="Campagne" onChange={handleCampaignFilterChange}>
                  <MenuItem value="">Toutes</MenuItem>
                  {campaigns.map(campaign => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select value={params.status || ''} label="Statut" onChange={handleStatusFilterChange}>
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Draft">Brouillon</MenuItem>
                  <MenuItem value="Submitted">Soumise</MenuItem>
                  <MenuItem value="Validated">Validée</MenuItem>
                  <MenuItem value="Rejected">Rejetée</MenuItem>
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
          {loading && reenrollments.length === 0 ? (
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
                      <TableCell>Étudiant</TableCell>
                      <TableCell>Campagne</TableCell>
                      <TableCell>Niveau</TableCell>
                      <TableCell>Éligibilité</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date soumission</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reenrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Aucune réinscription trouvée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reenrollments.map(reenrollment => {
                        const isSelectable = reenrollment.status === 'Submitted' && reenrollment.can_be_validated;
                        const isSelected = selectedIds.includes(reenrollment.id);

                        return (
                          <TableRow key={reenrollment.id} hover selected={isSelected}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleSelectOne(reenrollment.id)}
                                disabled={!isSelectable}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                  {reenrollment.student?.firstname?.[0]}
                                  {reenrollment.student?.lastname?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {reenrollment.student?.firstname} {reenrollment.student?.lastname}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {reenrollment.student?.matricule}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {reenrollment.campaign?.name || `#${reenrollment.campaign_id}`}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption">{reenrollment.previous_level}</Typography>
                                <i className="ri-arrow-right-line" style={{ fontSize: '0.75rem' }} />
                                <Chip
                                  label={reenrollment.target_level}
                                  size="small"
                                  color={reenrollment.is_redoing ? 'warning' : 'default'}
                                  variant={reenrollment.is_redoing ? 'filled' : 'outlined'}
                                />
                                {reenrollment.is_reorientation && (
                                  <Tooltip title="Réorientation">
                                    <i className="ri-swap-line" style={{ color: '#2196f3' }} />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  reenrollment.eligibility_status === 'Not_Eligible'
                                    ? 'Non éligible'
                                    : reenrollment.eligibility_status === 'Eligible'
                                      ? 'Éligible'
                                      : 'En attente'
                                }
                                color={getEligibilityColor(reenrollment.eligibility_status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  reenrollment.status === 'Submitted'
                                    ? 'Soumise'
                                    : reenrollment.status === 'Validated'
                                      ? 'Validée'
                                      : reenrollment.status === 'Rejected'
                                        ? 'Rejetée'
                                        : 'Brouillon'
                                }
                                color={getStatusColor(reenrollment.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">{formatDate(reenrollment.submitted_at)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Détails">
                                  <IconButton size="small" onClick={() => handleViewDetails(reenrollment)}>
                                    <i className="ri-eye-line" />
                                  </IconButton>
                                </Tooltip>
                                {reenrollment.confirmation_pdf_path && (
                                  <Tooltip title="Télécharger PDF">
                                    <IconButton size="small" onClick={() => handleDownloadPdf(reenrollment)}>
                                      <i className="ri-file-pdf-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {reenrollment.can_be_validated && (
                                  <Tooltip title="Valider">
                                    <IconButton size="small" color="success" onClick={() => handleValidate(reenrollment)}>
                                      <i className="ri-check-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {reenrollment.can_be_rejected && (
                                  <Tooltip title="Rejeter">
                                    <IconButton size="small" color="error" onClick={() => handleReject(reenrollment)}>
                                      <i className="ri-close-line" />
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

      {/* Validation Dialog */}
      <ReenrollmentValidationDialog
        open={validateDialogOpen}
        onClose={() => setValidateDialogOpen(false)}
        onConfirm={handleConfirmValidation}
        reenrollment={selectedReenrollment}
      />

      {/* Reject Dialog */}
      <ReenrollmentRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmRejection}
        reenrollment={selectedReenrollment}
      />

      {/* Detail Dialog */}
      <ReenrollmentDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        reenrollment={selectedReenrollment}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
