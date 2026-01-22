'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

import type { Reenrollment } from '../../types/reenrollment.types';

interface ReenrollmentValidationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reenrollment: Reenrollment | null;
}

/**
 * ReenrollmentValidationDialog Component
 * Dialog for confirming reenrollment validation
 */
export const ReenrollmentValidationDialog = ({
  open,
  onClose,
  onConfirm,
  reenrollment,
}: ReenrollmentValidationDialogProps) => {
  if (!reenrollment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Valider la Réinscription</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Vous êtes sur le point de valider la réinscription de l'étudiant suivant :
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Étudiant
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {reenrollment.student?.firstname} {reenrollment.student?.lastname}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {reenrollment.student?.matricule}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Niveau précédent
            </Typography>
            <Chip label={reenrollment.previous_level} size="small" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Niveau cible
            </Typography>
            <Chip
              label={reenrollment.target_level}
              size="small"
              color={reenrollment.is_redoing ? 'warning' : 'success'}
            />
          </Box>
        </Box>

        {reenrollment.is_redoing && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cet étudiant redouble son niveau.
          </Alert>
        )}

        {reenrollment.is_reorientation && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Cet étudiant change de programme (réorientation).
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Cette action va :
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>
              <Typography variant="body2">Créer une nouvelle inscription pédagogique</Typography>
            </li>
            <li>
              <Typography variant="body2">Mettre à jour le niveau de l'étudiant</Typography>
            </li>
            {reenrollment.personal_data_updates && Object.keys(reenrollment.personal_data_updates).length > 0 && (
              <li>
                <Typography variant="body2">Appliquer les mises à jour des informations personnelles</Typography>
              </li>
            )}
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="success" onClick={onConfirm}>
          Valider la réinscription
        </Button>
      </DialogActions>
    </Dialog>
  );
};
