'use client';

import { useTranslation } from '@/shared/i18n/use-translation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { Reenrollment } from '../../types/reenrollment.types';

interface ReenrollmentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  reenrollment: Reenrollment | null;
}

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
 * Get status chip color
 */
const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
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
const getEligibilityColor = (status: string): 'default' | 'success' | 'error' => {
  switch (status) {
    case 'Eligible':
      return 'success';
    case 'Not_Eligible':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * ReenrollmentDetailDialog Component
 * Dialog for displaying detailed reenrollment information
 */
export const ReenrollmentDetailDialog = ({
  open,
  onClose,
  reenrollment,
}: ReenrollmentDetailDialogProps) => {
  if (!reenrollment) return null;

  const statusLabels: Record<string, string> = {
    Draft: 'Brouillon',
    Submitted: 'Soumise',
    Validated: 'Validée',
    Rejected: 'Rejetée',
  };

  const eligibilityLabels: Record<string, string> = {
    Eligible: 'Éligible',
    Not_Eligible: 'Non éligible',
    Pending: 'En attente',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Détails de la Réinscription
        <Chip
          label={statusLabels[reenrollment.status] || reenrollment.status}
          color={getStatusColor(reenrollment.status)}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Student Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {reenrollment.student?.firstname?.[0]}
                    {reenrollment.student?.lastname?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {reenrollment.student?.firstname} {reenrollment.student?.lastname}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {reenrollment.student?.matricule}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Email: {reenrollment.student?.email || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Level Transition */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Progression de niveau
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip label={reenrollment.previous_level} size="medium" />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Niveau actuel
                    </Typography>
                  </Box>
                  <i className="ri-arrow-right-line" style={{ fontSize: '1.5rem' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label={reenrollment.target_level}
                      size="medium"
                      color={reenrollment.is_redoing ? 'warning' : 'success'}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Niveau cible
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {reenrollment.is_redoing && <Chip label="Redoublement" color="warning" size="small" />}
                  {reenrollment.is_reorientation && <Chip label="Réorientation" color="info" size="small" />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Campaign Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Campagne
                </Typography>
                <Typography variant="body1">
                  {reenrollment.campaign?.name || `Campagne #${reenrollment.campaign_id}`}
                </Typography>
                {reenrollment.target_program && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Programme: {reenrollment.target_program.name}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Eligibility */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Éligibilité
                </Typography>
                <Chip
                  label={eligibilityLabels[reenrollment.eligibility_status] || reenrollment.eligibility_status}
                  color={getEligibilityColor(reenrollment.eligibility_status)}
                  sx={{ mb: 1 }}
                />
                {reenrollment.eligibility_notes && (
                  <Typography variant="body2" color="textSecondary">
                    {reenrollment.eligibility_notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Timeline */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Chronologie
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <i className="ri-draft-line" />
                    </ListItemIcon>
                    <ListItemText primary="Création" secondary={formatDate(reenrollment.created_at)} />
                  </ListItem>
                  {reenrollment.submitted_at && (
                    <ListItem>
                      <ListItemIcon>
                        <i className="ri-send-plane-line" />
                      </ListItemIcon>
                      <ListItemText primary="Soumission" secondary={formatDate(reenrollment.submitted_at)} />
                    </ListItem>
                  )}
                  {reenrollment.validated_at && (
                    <ListItem>
                      <ListItemIcon>
                        <i
                          className={reenrollment.status === 'Validated' ? 'ri-check-line' : 'ri-close-line'}
                          style={{ color: reenrollment.status === 'Validated' ? 'green' : 'red' }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={reenrollment.status === 'Validated' ? 'Validation' : 'Rejet'}
                        secondary={`${formatDate(reenrollment.validated_at)}${reenrollment.validator ? ` par ${reenrollment.validator.name}` : ''}`}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Rejection Reason */}
          {reenrollment.status === 'Rejected' && reenrollment.rejection_reason && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Motif du rejet
                  </Typography>
                  <Typography variant="body2">{reenrollment.rejection_reason}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Personal Data Updates */}
          {reenrollment.personal_data_updates && Object.keys(reenrollment.personal_data_updates).length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Mises à jour des informations personnelles
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {Object.entries(reenrollment.personal_data_updates).map(([field, value]) => (
                      <li key={field}>
                        <Typography variant="body2">
                          <strong>{field}:</strong> {String(value)}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Documents */}
          {reenrollment.uploaded_documents && reenrollment.uploaded_documents.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Documents téléchargés
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {reenrollment.uploaded_documents.map((doc, index) => (
                      <Chip key={index} label={doc} size="small" icon={<i className="ri-file-line" />} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Rules Acceptance */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i
                className={reenrollment.has_accepted_rules ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}
                style={{ color: reenrollment.has_accepted_rules ? 'green' : 'gray' }}
              />
              <Typography variant="body2">
                {reenrollment.has_accepted_rules ? 'Règlement intérieur accepté' : 'Règlement intérieur non accepté'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
