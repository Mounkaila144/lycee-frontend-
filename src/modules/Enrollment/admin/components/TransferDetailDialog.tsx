'use client';

import { useEffect } from 'react';
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
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useTransferDetails } from '../hooks/useTransfers';

import type { Transfer, TransferStatus, EquivalenceType } from '../../types/transfer.types';

interface TransferDetailDialogProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
  onOpenEquivalences?: () => void;
}

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
 * Format date for display
 */
const formatDate = (dateString: string | null | undefined) => {
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
 * TransferDetailDialog Component
 * Dialog for viewing transfer details
 */
export const TransferDetailDialog = ({ open, onClose, transfer: initialTransfer, onOpenEquivalences }: TransferDetailDialogProps) => {
  const { t } = useTranslation('Enrollment');
  const { transfer: detailedTransfer, loading, refresh } = useTransferDetails(initialTransfer?.id || null);

  // Refresh when dialog opens
  useEffect(() => {
    if (open && initialTransfer?.id) {
      refresh();
    }
  }, [open, initialTransfer?.id, refresh]);

  const transfer = detailedTransfer || initialTransfer;

  if (!transfer) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <i className="ri-exchange-line" />
            </Avatar>
            <Box>
              <Typography variant="h6">{t('Transfer details')}</Typography>
              <Typography variant="body2" color="textSecondary">
                {transfer.transfer_number}
              </Typography>
            </Box>
          </Box>
          <Chip label={getStatusLabel(transfer.status)} color={getStatusColor(transfer.status)} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Grid container spacing={3}>
              {/* Left Column - Student Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                {/* Personal Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      <i className="ri-user-line" style={{ marginRight: 8 }} />
                      {t('Candidate information')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, fontSize: '1.5rem' }}>
                        {transfer.firstname?.[0]}
                        {transfer.lastname?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{transfer.full_name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {transfer.email}
                        </Typography>
                        {transfer.phone && (
                          <Typography variant="body2" color="textSecondary">
                            {transfer.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      <strong>{t('Birth date')}:</strong> {formatDate(transfer.birthdate)?.split(',')[0]}
                    </Typography>
                    {transfer.student && (
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`Matricule: ${transfer.student.matricule}`}
                          color="success"
                          icon={<i className="ri-check-line" />}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Origin Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      <i className="ri-building-line" style={{ marginRight: 8 }} />
                      {t('Origin institution')}
                    </Typography>
                    <List dense disablePadding>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i className="ri-school-line" />
                        </ListItemIcon>
                        <ListItemText primary={transfer.origin_institution} secondary={t('Institution')} />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i className="ri-book-line" />
                        </ListItemIcon>
                        <ListItemText primary={transfer.origin_program} secondary={t('Program')} />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i className="ri-graduation-cap-line" />
                        </ListItemIcon>
                        <ListItemText primary={transfer.origin_level} secondary={t('Level')} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {/* Target Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      <i className="ri-arrow-right-circle-line" style={{ marginRight: 8 }} />
                      {t('Target program')}
                    </Typography>
                    <List dense disablePadding>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i className="ri-book-line" />
                        </ListItemIcon>
                        <ListItemText primary={transfer.target_program?.name || '-'} secondary={t('Program')} />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i className="ri-graduation-cap-line" />
                        </ListItemIcon>
                        <ListItemText primary={transfer.target_level} secondary={t('Level')} />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i className="ri-calendar-line" />
                        </ListItemIcon>
                        <ListItemText primary={transfer.academic_year?.name || '-'} secondary={t('Academic year')} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - ECTS & Equivalences */}
              <Grid size={{ xs: 12, md: 6 }}>
                {/* ECTS Summary */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      <i className="ri-award-line" style={{ marginRight: 8 }} />
                      {t('ECTS Summary')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{t('Claimed ECTS')}:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {transfer.total_ects_claimed}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{t('Granted ECTS')}:</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {transfer.total_ects_granted}
                        </Typography>
                      </Box>
                      {transfer.total_ects_claimed > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="textSecondary">
                            {t('Progress')}: {Math.round((transfer.total_ects_granted / transfer.total_ects_claimed) * 100)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(transfer.total_ects_granted / transfer.total_ects_claimed) * 100}
                            sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                          />
                        </Box>
                      )}
                    </Box>

                    {transfer.equivalence_statistics && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                          {t('Equivalences statistics')}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid size={6}>
                            <Chip label={`Total: ${transfer.equivalence_statistics.total}`} size="small" />
                          </Grid>
                          <Grid size={6}>
                            <Chip label={`Validées: ${transfer.equivalence_statistics.validated}`} size="small" color="success" />
                          </Grid>
                          <Grid size={6}>
                            <Chip label={`Totales: ${transfer.equivalence_statistics.full}`} size="small" color="primary" />
                          </Grid>
                          <Grid size={6}>
                            <Chip label={`Partielles: ${transfer.equivalence_statistics.partial}`} size="small" color="warning" />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Transfer Reason */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      <i className="ri-file-text-line" style={{ marginRight: 8 }} />
                      {t('Transfer reason')}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {transfer.transfer_reason}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Documents */}
                {transfer.documents && transfer.documents.length > 0 && (
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        <i className="ri-attachment-line" style={{ marginRight: 8 }} />
                        Documents ({transfer.documents.length})
                      </Typography>
                      <List dense>
                        {transfer.documents.map(doc => (
                          <ListItem key={doc.id} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <i className="ri-file-pdf-line" />
                            </ListItemIcon>
                            <ListItemText primary={doc.original_name} secondary={doc.type_label} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {/* Rejection Reason */}
                {transfer.status === 'Rejected' && transfer.rejection_reason && (
                  <Card variant="outlined" sx={{ mb: 3, borderColor: 'error.main' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} color="error" sx={{ mb: 2 }}>
                        <i className="ri-close-circle-line" style={{ marginRight: 8 }} />
                        {t('Rejection reason')}
                      </Typography>
                      <Typography variant="body2">{transfer.rejection_reason}</Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Review Info */}
                {transfer.reviewer && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        <i className="ri-user-star-line" style={{ marginRight: 8 }} />
                        {t('Review information')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Reviewed by')}:</strong> {transfer.reviewer.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('Date')}:</strong> {formatDate(transfer.reviewed_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>

            {/* Equivalences Table */}
            {transfer.equivalences && transfer.equivalences.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  <i className="ri-exchange-line" style={{ marginRight: 8 }} />
                  Équivalences proposées ({transfer.equivalences.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Module origine</TableCell>
                        <TableCell>ECTS</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Module cible</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>ECTS accordés</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transfer.equivalences.map(equiv => (
                        <TableRow key={equiv.id}>
                          <TableCell>
                            <Typography variant="body2">{equiv.origin_module_name}</Typography>
                            {equiv.origin_module_code && (
                              <Typography variant="caption" color="textSecondary">
                                {equiv.origin_module_code}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{equiv.origin_ects}</TableCell>
                          <TableCell>{equiv.origin_grade !== null ? `${equiv.origin_grade}/20` : '-'}</TableCell>
                          <TableCell>{equiv.target_module?.name || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={equiv.equivalence_type_label}
                              color={getEquivalenceTypeColor(equiv.equivalence_type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{equiv.granted_ects}</TableCell>
                          <TableCell>
                            <Chip
                              label={equiv.status === 'Validated' ? 'Validée' : equiv.status === 'Rejected' ? 'Rejetée' : 'Proposée'}
                              color={equiv.status === 'Validated' ? 'success' : equiv.status === 'Rejected' ? 'error' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Timeline */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                <i className="ri-time-line" style={{ marginRight: 8 }} />
                {t('History')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`${t('Created')}: ${formatDate(transfer.created_at)}`} size="small" variant="outlined" />
                {transfer.reviewed_at && <Chip label={`${t('Reviewed')}: ${formatDate(transfer.reviewed_at)}`} size="small" variant="outlined" />}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {onOpenEquivalences && (transfer.status === 'Under_Review' || transfer.status === 'Equivalences_Proposed') && (
          <Button variant="outlined" color="secondary" onClick={onOpenEquivalences} startIcon={<i className="ri-exchange-line" />}>
            {t('Manage equivalences')}
          </Button>
        )}
        <Button onClick={onClose}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
