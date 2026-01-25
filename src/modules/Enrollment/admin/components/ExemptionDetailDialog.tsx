'use client';

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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { ModuleExemption, ExemptionStatus } from '../../types/exemption.types';
import { EXEMPTION_STATUS_COLORS, EXEMPTION_STATUS_LABELS } from '../../types/exemption.types';

interface ExemptionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  exemption: ModuleExemption | null;
}

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
 * ExemptionDetailDialog Component
 * Dialog for viewing exemption details
 */
export const ExemptionDetailDialog = ({ open, onClose, exemption }: ExemptionDetailDialogProps) => {
  if (!exemption) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-file-list-3-line" />
            <Typography variant="h6">Détails de la dispense</Typography>
          </Box>
          <Chip
            label={EXEMPTION_STATUS_LABELS[exemption.status as ExemptionStatus] || exemption.status}
            color={EXEMPTION_STATUS_COLORS[exemption.status as ExemptionStatus] || 'default'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {/* Header Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {exemption.student?.firstname?.[0]}
              {exemption.student?.lastname?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {exemption.student?.firstname} {exemption.student?.lastname}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {exemption.student?.matricule}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight={500}>
                {exemption.exemption_number}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Module Info */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Module concerné
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                Module
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {exemption.module?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Code: {exemption.module?.code}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                ECTS
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {exemption.module?.ects}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Année académique
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {exemption.academic_year?.year}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Exemption Details */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Détails de la demande
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Type de dispense
              </Typography>
              <Chip
                label={exemption.exemption_type_label}
                size="small"
                color={
                  exemption.exemption_type === 'Full'
                    ? 'primary'
                    : exemption.exemption_type === 'Partial'
                      ? 'secondary'
                      : 'default'
                }
                sx={{ mt: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Catégorie de motif
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {exemption.reason_category_label}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Date de demande
              </Typography>
              <Typography variant="body1">
                {formatDate(exemption.created_at)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="textSecondary">
                Motif détaillé
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {exemption.reason_details}
              </Typography>
            </Grid>
          </Grid>

          {/* Documents */}
          {exemption.uploaded_documents && exemption.uploaded_documents.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Documents justificatifs
              </Typography>
              <List dense>
                {exemption.uploaded_documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <i className="ri-file-pdf-line" style={{ fontSize: '1.25rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.original_name}
                      secondary={`${(doc.size / 1024).toFixed(1)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Teacher Review */}
          {exemption.teacher_opinion && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Avis de l&apos;enseignant
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {exemption.teacher_reviewer?.firstname} {exemption.teacher_reviewer?.lastname} - {formatDate(exemption.teacher_reviewed_at)}
                </Typography>
                <Typography variant="body1">{exemption.teacher_opinion}</Typography>
              </Box>
            </>
          )}

          {/* Validation Info */}
          {exemption.validated_at && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Décision de validation
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Validé par
                  </Typography>
                  <Typography variant="body1">
                    {exemption.validator?.firstname} {exemption.validator?.lastname}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Date de validation
                  </Typography>
                  <Typography variant="body1">{formatDate(exemption.validated_at)}</Typography>
                </Grid>
                {exemption.grants_ects && (
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      ECTS accordés
                    </Typography>
                    <Typography variant="body1" color="success.main" fontWeight={500}>
                      {exemption.ects_granted}
                    </Typography>
                  </Grid>
                )}
                {exemption.grade_granted && (
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      Note forfaitaire
                    </Typography>
                    <Typography variant="body1" color="success.main" fontWeight={500}>
                      {exemption.grade_granted}/20
                    </Typography>
                  </Grid>
                )}
                {exemption.validation_notes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="textSecondary">
                      Notes de validation
                    </Typography>
                    <Typography variant="body1">{exemption.validation_notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {/* Rejection Reason */}
          {exemption.status === 'Rejected' && exemption.rejection_reason && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }} color="error">
                Motif de rejet
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                <Typography variant="body1">{exemption.rejection_reason}</Typography>
              </Box>
            </>
          )}

          {/* Revocation Info */}
          {exemption.revoked_at && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }} color="error">
                Révocation
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Révoqué par {exemption.revoked_by_user?.firstname} {exemption.revoked_by_user?.lastname} le {formatDate(exemption.revoked_at)}
                </Typography>
                <Typography variant="body1">{exemption.revocation_reason}</Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
