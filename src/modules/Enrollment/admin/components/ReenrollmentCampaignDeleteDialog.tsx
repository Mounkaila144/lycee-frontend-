'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import type { ReenrollmentCampaign } from '../../types/reenrollment.types';

interface ReenrollmentCampaignDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaign: ReenrollmentCampaign | null;
}

/**
 * ReenrollmentCampaignDeleteDialog Component
 * Dialog for confirming campaign deletion
 */
export const ReenrollmentCampaignDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  campaign,
}: ReenrollmentCampaignDeleteDialogProps) => {
  if (!campaign) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Supprimer la Campagne</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Êtes-vous sûr de vouloir supprimer la campagne <strong>{campaign.name}</strong> ?
          </Typography>
        </Alert>
        <Typography variant="body2" color="textSecondary">
          Cette action est irréversible. La campagne et toutes ses données associées seront supprimées définitivement.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
