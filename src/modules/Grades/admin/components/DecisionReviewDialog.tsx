'use client';

import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import type { JuryDecision, DecisionReviewRequest } from '../../types/deliberation.types';

interface DecisionReviewDialogProps {
  open: boolean;
  onClose: () => void;
  decision: JuryDecision | null;
  onReview: (decisionId: number, request: DecisionReviewRequest) => Promise<boolean>;
}

const decisionLabelMap: Record<string, string> = {
  admitted: 'Admis',
  admitted_with_compensation: 'Admis par compensation',
  deferred: 'Ajourné',
  retake: 'Rattrapage',
  excluded: 'Exclu',
};

export const DecisionReviewDialog: React.FC<DecisionReviewDialogProps> = ({
  open,
  onClose,
  decision,
  onReview,
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!decision) return;

    setSubmitting(true);
    const success = await onReview(decision.id, { review_status: status, review_notes: notes || undefined });

    setSubmitting(false);

    if (success) {
      setNotes('');
      onClose();
    }
  };

  if (!decision) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Révision de décision exceptionnelle</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
          <Typography variant="body1" fontWeight={500}>
            {decision.student?.full_name || `${decision.student?.firstname} ${decision.student?.lastname}`}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Décision</Typography>
          <Chip
            label={decision.decision_label || decisionLabelMap[decision.decision] || decision.decision}
            size="small"
            color="warning"
          />
        </Box>

        {decision.justification && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Justification</Typography>
            <Typography variant="body2">{decision.justification}</Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Votes</Typography>
          <Box display="flex" gap={1}>
            <Chip label={`Pour: ${decision.votes_for}`} size="small" color="success" variant="outlined" />
            <Chip label={`Contre: ${decision.votes_against}`} size="small" color="error" variant="outlined" />
            <Chip label={`Abstention: ${decision.votes_abstain}`} size="small" variant="outlined" />
          </Box>
        </Box>

        <TextField
          label="Notes de révision"
          fullWidth
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleReview('rejected')}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <i className="ri-close-line" />}
        >
          Rejeter
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleReview('approved')}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
        >
          Approuver
        </Button>
      </DialogActions>
    </Dialog>
  );
};
