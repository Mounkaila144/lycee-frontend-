'use client';

import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import type { FinalStatistics, PublishFinalResultsRequest } from '../../types/finalResult.types';

interface PublishFinalResultsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: PublishFinalResultsRequest) => void;
  statistics: FinalStatistics | undefined;
  publishing: boolean;
}

export const PublishFinalResultsDialog: React.FC<PublishFinalResultsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  statistics,
  publishing,
}) => {
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [generateAttestations, setGenerateAttestations] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      notify_students: notifyStudents,
      generate_attestations: generateAttestations,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Publier les résultats finaux
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Cette action est irréversible. Assurez-vous que tous les recalculs sont terminés.
        </Alert>

        {statistics && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Récapitulatif des résultats
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              <Chip label={`${statistics.admitted} Admis`} color="success" />
              <Chip label={`${statistics.admitted_with_debts} Admis avec dettes`} color="warning" />
              <Chip label={`${statistics.deferred_final} Ajournés`} color="error" />
              <Chip label={`${statistics.repeating} Redoublants`} color="default" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total : {statistics.total_students} étudiants | Taux de réussite : {statistics.pass_rate?.toFixed(1)}%
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Options de publication
          </Typography>
          <FormControlLabel
            control={
              <Checkbox checked={notifyStudents} onChange={(e) => setNotifyStudents(e.target.checked)} />
            }
            label="Envoyer les notifications aux étudiants"
          />
          <FormControlLabel
            control={
              <Checkbox checked={generateAttestations} onChange={(e) => setGenerateAttestations(e.target.checked)} />
            }
            label="Générer les attestations de réussite (PDF)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={publishing}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={publishing}
          startIcon={publishing ? <CircularProgress size={16} /> : <i className="ri-send-plane-line" />}
        >
          {publishing ? 'Publication...' : 'Publier les résultats'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
