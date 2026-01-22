'use client';

import { useState, useCallback } from 'react';

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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { useReenrollmentCampaigns, useCampaignStatistics } from '../hooks/useReenrollmentCampaigns';
import { ReenrollmentCampaignFormDialog } from './ReenrollmentCampaignFormDialog';
import { ReenrollmentCampaignDeleteDialog } from './ReenrollmentCampaignDeleteDialog';
import { ReenrollmentCampaignStatisticsDialog } from './ReenrollmentCampaignStatisticsDialog';

import type { ReenrollmentCampaign, ReenrollmentCampaignStatus } from '../../types/reenrollment.types';

/**
 * Get status chip color
 */
const getStatusColor = (status: ReenrollmentCampaignStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Active':
      return 'success';
    case 'Closed':
      return 'error';
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
  });
};

/**
 * ReenrollmentCampaigns Component
 * Main component for managing reenrollment campaigns
 */
export const ReenrollmentCampaigns = () => {
  const {
    campaigns,
    loading,
    error,
    pagination,
    params,
    setPage,
    setPageSize,
    setStatusFilter,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activateCampaign,
    closeCampaign,
    refresh,
  } = useReenrollmentCampaigns({ page: 1, per_page: 10 });

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ReenrollmentCampaign | null>(null);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuCampaign, setMenuCampaign] = useState<ReenrollmentCampaign | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedCampaign(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = useCallback((campaign: ReenrollmentCampaign) => {
    setSelectedCampaign(campaign);
    setFormDialogOpen(true);
    setMenuAnchor(null);
  }, []);

  const handleDelete = useCallback((campaign: ReenrollmentCampaign) => {
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  }, []);

  const handleViewStats = useCallback((campaign: ReenrollmentCampaign) => {
    setSelectedCampaign(campaign);
    setStatsDialogOpen(true);
    setMenuAnchor(null);
  }, []);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, campaign: ReenrollmentCampaign) => {
    setMenuAnchor(event.currentTarget);
    setMenuCampaign(campaign);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setMenuCampaign(null);
  }, []);

  const handleActivate = useCallback(async () => {
    if (!menuCampaign) return;

    try {
      await activateCampaign(menuCampaign.id);
      setSnackbar({ open: true, message: 'Campagne activée avec succès', severity: 'success' });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de l\'activation';
      setSnackbar({ open: true, message, severity: 'error' });
    }

    handleMenuClose();
  }, [menuCampaign, activateCampaign, handleMenuClose]);

  const handleClose = useCallback(async () => {
    if (!menuCampaign) return;

    try {
      await closeCampaign(menuCampaign.id);
      setSnackbar({ open: true, message: 'Campagne clôturée avec succès', severity: 'success' });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de la clôture';
      setSnackbar({ open: true, message, severity: 'error' });
    }

    handleMenuClose();
  }, [menuCampaign, closeCampaign, handleMenuClose]);

  const handleFormClose = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedCampaign(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedCampaign(null);
  }, []);

  const handleStatsClose = useCallback(() => {
    setStatsDialogOpen(false);
    setSelectedCampaign(null);
  }, []);

  const handleSave = useCallback(
    async (data: any) => {
      try {
        if (selectedCampaign) {
          await updateCampaign(selectedCampaign.id, data);
          setSnackbar({ open: true, message: 'Campagne modifiée avec succès', severity: 'success' });
        } else {
          await createCampaign(data);
          setSnackbar({ open: true, message: 'Campagne créée avec succès', severity: 'success' });
        }

        handleFormClose();
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Une erreur est survenue';
        setSnackbar({ open: true, message, severity: 'error' });
        throw err;
      }
    },
    [selectedCampaign, createCampaign, updateCampaign, handleFormClose]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCampaign) return;

    try {
      await deleteCampaign(selectedCampaign.id);
      setSnackbar({ open: true, message: 'Campagne supprimée avec succès', severity: 'success' });
      handleDeleteClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  }, [selectedCampaign, deleteCampaign, handleDeleteClose]);

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

  const handleStatusFilterChange = useCallback(
    (event: any) => {
      setStatusFilter(event.target.value || undefined);
    },
    [setStatusFilter]
  );

  return (
    <Box>
      <Card>
        <CardHeader
          title="Campagnes de Réinscription"
          subheader="Gérez les campagnes de réinscription pour les années académiques"
          action={
            <Button variant="contained" color="primary" startIcon={<i className="ri-add-line" />} onClick={handleCreate}>
              Nouvelle Campagne
            </Button>
          }
        />
        <CardContent>
          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={params.status || ''}
                  label="Statut"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Draft">Brouillon</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Closed">Clôturée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="outlined" startIcon={<i className="ri-refresh-line" />} onClick={refresh}>
                Actualiser
              </Button>
            </Grid>
          </Grid>

          {/* Table */}
          {loading && campaigns.length === 0 ? (
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
                      <TableCell>Nom</TableCell>
                      <TableCell>Année Source</TableCell>
                      <TableCell>Année Cible</TableCell>
                      <TableCell>Période</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Réinscriptions</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Aucune campagne trouvée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map(campaign => (
                        <TableRow key={campaign.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {campaign.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {campaign.from_academic_year?.name || `ID: ${campaign.from_academic_year_id}`}
                          </TableCell>
                          <TableCell>
                            {campaign.to_academic_year?.name || `ID: ${campaign.to_academic_year_id}`}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block">
                              Du {formatDate(campaign.start_date)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Au {formatDate(campaign.end_date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={campaign.status} color={getStatusColor(campaign.status)} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={campaign.reenrollments_count || 0} variant="outlined" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Actions">
                              <IconButton size="small" onClick={e => handleMenuOpen(e, campaign)}>
                                <i className="ri-more-2-line" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
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

      {/* Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuCampaign && handleViewStats(menuCampaign)}>
          <ListItemIcon>
            <i className="ri-bar-chart-2-line" />
          </ListItemIcon>
          <ListItemText>Statistiques</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuCampaign && handleEdit(menuCampaign)}>
          <ListItemIcon>
            <i className="ri-edit-line" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <Divider />
        {menuCampaign?.status === 'Draft' && (
          <MenuItem onClick={handleActivate}>
            <ListItemIcon>
              <i className="ri-play-circle-line" style={{ color: 'green' }} />
            </ListItemIcon>
            <ListItemText>Activer</ListItemText>
          </MenuItem>
        )}
        {menuCampaign?.status === 'Active' && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <i className="ri-stop-circle-line" style={{ color: 'orange' }} />
            </ListItemIcon>
            <ListItemText>Clôturer</ListItemText>
          </MenuItem>
        )}
        {menuCampaign?.status === 'Draft' && (
          <>
            <Divider />
            <MenuItem onClick={() => menuCampaign && handleDelete(menuCampaign)} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <i className="ri-delete-bin-line" style={{ color: 'red' }} />
              </ListItemIcon>
              <ListItemText>Supprimer</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Form Dialog */}
      <ReenrollmentCampaignFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        onSave={handleSave}
        campaign={selectedCampaign}
      />

      {/* Delete Dialog */}
      <ReenrollmentCampaignDeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onConfirm={handleConfirmDelete}
        campaign={selectedCampaign}
      />

      {/* Statistics Dialog */}
      <ReenrollmentCampaignStatisticsDialog
        open={statsDialogOpen}
        onClose={handleStatsClose}
        campaign={selectedCampaign}
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
