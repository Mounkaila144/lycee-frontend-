'use client';

import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import type { CreateDeliberationRequest, SessionType } from '../../types/deliberation.types';

interface CreateDeliberationDialogProps {
  open: boolean;
  onClose: () => void;
  semesterId: number;
  onSubmit: (request: CreateDeliberationRequest) => Promise<any>;
}

export const CreateDeliberationDialog: React.FC<CreateDeliberationDialogProps> = ({
  open,
  onClose,
  semesterId,
  onSubmit,
}) => {
  const [form, setForm] = useState<Partial<CreateDeliberationRequest>>({
    semester_id: semesterId,
    session_type: 'regular',
    scheduled_at: '',
    location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await onSubmit({
      ...form,
      semester_id: semesterId,
    } as CreateDeliberationRequest);

    setSubmitting(false);

    if (result) {
      onClose();
      setForm({
        semester_id: semesterId,
        session_type: 'regular',
        scheduled_at: '',
        location: '',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nouvelle session de délibération</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Type de session</InputLabel>
              <Select
                value={form.session_type || 'regular'}
                label="Type de session"
                onChange={(e) => setForm({ ...form, session_type: e.target.value as SessionType })}
              >
                <MenuItem value="regular">Ordinaire</MenuItem>
                <MenuItem value="rattrapage">Rattrapage</MenuItem>
                <MenuItem value="special">Spéciale</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Date et heure"
              type="datetime-local"
              fullWidth
              size="small"
              value={form.scheduled_at || ''}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Lieu"
              fullWidth
              size="small"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Salle de réunion, amphithéâtre..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes additionnelles pour la session..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <i className="ri-add-line" />}
        >
          {submitting ? 'Création...' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
