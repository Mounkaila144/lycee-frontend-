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
import LinearProgress from '@mui/material/LinearProgress';

import { useTransfers, useTransferStatistics } from '../hooks/useTransfers';
import { TransferFormDialog } from './TransferFormDialog';
import { TransferDetailDialog } from './TransferDetailDialog';
import { TransferRejectDialog } from './TransferRejectDialog';
import { EquivalenceMatcherDialog } from './EquivalenceMatcherDialog';

import type { Transfer, TransferStatus } from '../../types/transfer.types';

/**
 * Get status chip color
 */
const getStatusColor = (
  status: TransferStatus
): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
  switch (status) {
    case 'Submitted':
      return 'warning';
    case 'Under_Review':
      return 'info';
    case 'Equivalences_Proposed':
      return 'secondary';
    case 'Validated':
      return 'primary';
    case 'Integrated':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get status label in French
 */
const getStatusLabel = (status: TransferStatus): string => {
  const labels: Record<TransferStatus, string> = {
    Submitted: 'Soumise',
    Under_Review: 'En révision',
    Equivalences_Proposed: 'Équivalences proposées',
    Validated: 'Validée',
    Integrated: 'Intégrée',
    Rejected: 'Rejetée',
  };

  return labels[status] || status;
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
  });
};

/**
 * Transfers Component
 * Admin dashboard for managing student transfers and equivalences
 */
export const Transfers = () => {
  const {
    transfers,
    loading,
    error,
    pagination,
    params,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    startReview,
    validateTransfer,
    integrateTransfer,
    rejectTransfer,
    downloadCertificate,
    refresh,
  } = useTransfers({ page: 1, per_page: 10 });

  const { statistics } = useTransferStatistics();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [equivalenceDialogOpen, setEquivalenceDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

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
        const selectableIds = transfers.filter(t => t.can_be_reviewed).map(t => t.id);
        setSelectedIds(selectableIds);
      } else {
        setSelectedIds([]);
      }
    },
    [transfers]
  );

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  }, []);

  // Action handlers
  const handleViewDetails = useCallback((transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setDetailDialogOpen(true);
  }, []);

  const handleOpenEquivalenceMatcher = useCallback((transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setEquivalenceDialogOpen(true);
  }, []);

  // Helper to extract error message from various error types
  const getErrorMessage = useCallback((err: any, defaultMessage: string): string => {
    // Axios error with response
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    // Axios error with errors object
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0] as string;
      }
    }
    // Standard Error object
    if (err?.message) {
      return err.message;
    }
    return defaultMessage;
  }, []);

  const handleStartReview = useCallback(
    async (transfer: Transfer) => {
      setAlertError(null);
      try {
        await startReview(transfer.id);
        setSnackbar({ open: true, message: 'Révision démarrée', severity: 'success' });
      } catch (err: any) {
        const message = getErrorMessage(err, 'Erreur lors du démarrage de la révision');
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [startReview, getErrorMessage]
  );

  const handleValidate = useCallback(
    async (transfer: Transfer) => {
      setAlertError(null);
      try {
        await validateTransfer(transfer.id);
        setSnackbar({ open: true, message: 'Transfert validé avec succès', severity: 'success' });
      } catch (err: any) {
        const message = getErrorMessage(err, 'Erreur lors de la validation');
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [validateTransfer, getErrorMessage]
  );

  const handleIntegrate = useCallback(
    async (transfer: Transfer) => {
      setAlertError(null);
      try {
        const result = await integrateTransfer(transfer.id);
        setSnackbar({
          open: true,
          message: `Étudiant intégré avec succès. Matricule: ${result.student_matricule}`,
          severity: 'success',
        });
      } catch (err: any) {
        const message = getErrorMessage(err, "Erreur lors de l'intégration");
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [integrateTransfer, getErrorMessage]
  );

  const handleReject = useCallback((transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setRejectDialogOpen(true);
  }, []);

  const handleConfirmRejection = useCallback(
    async (reason: string) => {
      if (!selectedTransfer) return;

      setAlertError(null);
      try {
        await rejectTransfer(selectedTransfer.id, reason);
        setSnackbar({ open: true, message: 'Transfert rejeté', severity: 'success' });
        setRejectDialogOpen(false);
        setSelectedTransfer(null);
      } catch (err: any) {
        const message = getErrorMessage(err, 'Erreur lors du rejet');
        setAlertError(message);
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [selectedTransfer, rejectTransfer, getErrorMessage]
  );

  const handleDownloadCertificate = useCallback(
    async (transfer: Transfer) => {
      setAlertError(null);
      try {
        await downloadCertificate(transfer.id, transfer.transfer_number);
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

      // Debounce search
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

  // Calculate selectable count
  const selectableCount = useMemo(() => transfers.filter(t => t.can_be_reviewed).length, [transfers]);

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
                  {statistics.by_status?.submitted || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Soumises
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {statistics.by_status?.under_review || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En révision
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="secondary.main">
                  {statistics.by_status?.equivalences_proposed || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Équivalences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {statistics.by_status?.integrated || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Intégrées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main">
                  {statistics.by_status?.rejected || 0}
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
          title="Gestion des Transferts"
          subheader="Traitez les demandes de transfert et gérez les équivalences"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<i className="ri-add-line" />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Nouveau transfert
              </Button>
            </Box>
          }
        />
        <CardContent>
          {/* Persistent Error Alert */}
          {alertError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setAlertError(null)}
            >
              {alertError}
            </Alert>
          )}

          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher par numéro, nom, email..."
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
                  <MenuItem value="Submitted">Soumise</MenuItem>
                  <MenuItem value="Under_Review">En révision</MenuItem>
                  <MenuItem value="Equivalences_Proposed">Équivalences proposées</MenuItem>
                  <MenuItem value="Validated">Validée</MenuItem>
                  <MenuItem value="Integrated">Intégrée</MenuItem>
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
          {loading && transfers.length === 0 ? (
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
                      <TableCell>N° Demande</TableCell>
                      <TableCell>Candidat</TableCell>
                      <TableCell>Origine</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>ECTS</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transfers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Aucune demande de transfert trouvée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transfers.map(transfer => {
                        const isSelectable = transfer.can_be_reviewed;
                        const isSelected = selectedIds.includes(transfer.id);

                        return (
                          <TableRow key={transfer.id} hover selected={isSelected}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleSelectOne(transfer.id)}
                                disabled={!isSelectable}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500} color="primary">
                                {transfer.transfer_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                  {transfer.firstname?.[0]}
                                  {transfer.lastname?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {transfer.full_name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {transfer.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{transfer.origin_institution}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {transfer.origin_program} - {transfer.origin_level}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{transfer.target_program?.name || '-'}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {transfer.target_level}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flexGrow: 1, minWidth: 40 }}>
                                  <Typography variant="body2">
                                    {transfer.total_ects_granted}/{transfer.total_ects_claimed}
                                  </Typography>
                                  {transfer.total_ects_claimed > 0 && (
                                    <LinearProgress
                                      variant="determinate"
                                      value={(transfer.total_ects_granted / transfer.total_ects_claimed) * 100}
                                      sx={{ height: 4, borderRadius: 2 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={getStatusLabel(transfer.status)} color={getStatusColor(transfer.status)} size="small" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">{formatDate(transfer.created_at)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Détails">
                                  <IconButton size="small" onClick={() => handleViewDetails(transfer)}>
                                    <i className="ri-eye-line" />
                                  </IconButton>
                                </Tooltip>
                                {transfer.can_be_reviewed && (
                                  <Tooltip title="Démarrer révision">
                                    <IconButton size="small" color="info" onClick={() => handleStartReview(transfer)}>
                                      <i className="ri-play-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {(transfer.status === 'Under_Review' || transfer.status === 'Equivalences_Proposed') && (
                                  <Tooltip title="Gérer équivalences">
                                    <IconButton size="small" color="secondary" onClick={() => handleOpenEquivalenceMatcher(transfer)}>
                                      <i className="ri-exchange-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {transfer.can_be_validated && (
                                  <Tooltip title="Valider">
                                    <IconButton size="small" color="primary" onClick={() => handleValidate(transfer)}>
                                      <i className="ri-check-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {transfer.can_be_integrated && (
                                  <Tooltip title="Intégrer l'étudiant">
                                    <IconButton size="small" color="success" onClick={() => handleIntegrate(transfer)}>
                                      <i className="ri-user-add-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {transfer.can_be_rejected && (
                                  <Tooltip title="Rejeter">
                                    <IconButton size="small" color="error" onClick={() => handleReject(transfer)}>
                                      <i className="ri-close-line" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {transfer.equivalence_certificate_path && (
                                  <Tooltip title="Télécharger attestation">
                                    <IconButton size="small" onClick={() => handleDownloadCertificate(transfer)}>
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
      <TransferFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setSnackbar({ open: true, message: 'Demande de transfert créée avec succès', severity: 'success' });
          refresh();
        }}
      />

      {/* Detail Dialog */}
      <TransferDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        transfer={selectedTransfer}
        onOpenEquivalences={() => {
          setDetailDialogOpen(false);
          setEquivalenceDialogOpen(true);
        }}
      />

      {/* Reject Dialog */}
      <TransferRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmRejection}
        transfer={selectedTransfer}
      />

      {/* Equivalence Matcher Dialog */}
      <EquivalenceMatcherDialog
        open={equivalenceDialogOpen}
        onClose={() => {
          setEquivalenceDialogOpen(false);
          refresh();
        }}
        transfer={selectedTransfer}
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
