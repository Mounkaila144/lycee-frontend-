'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import type { JuryDecisionRequest, DecisionType, PendingStudent } from '../../types/deliberation.types';

interface JuryDecisionFormProps {
  student: PendingStudent;
  onSubmit: (request: JuryDecisionRequest) => Promise<boolean>;
  onCancel: () => void;
}

const DECISION_OPTIONS: { value: DecisionType; label: string; color: string }[] = [
  { value: 'admitted', label: 'Admis', color: 'success.main' },
  { value: 'admitted_with_compensation', label: 'Admis par compensation', color: 'warning.main' },
  { value: 'deferred', label: 'Ajourné', color: 'info.main' },
  { value: 'retake', label: 'Rattrapage', color: 'warning.dark' },
  { value: 'excluded', label: 'Exclu', color: 'error.main' },
];

export const JuryDecisionForm: React.FC<JuryDecisionFormProps> = ({
  student,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<Partial<JuryDecisionRequest>>({
    student_id: student.student_id,
    decision: student.suggested_decision || undefined,
    justification: '',
    votes_for: 0,
    votes_against: 0,
    votes_abstain: 0,
    is_exceptional: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.decision) return;

    setSubmitting(true);
    await onSubmit({
      student_id: student.student_id,
      decision: form.decision,
      justification: form.justification || undefined,
      votes_for: form.votes_for,
      votes_against: form.votes_against,
      votes_abstain: form.votes_abstain,
      is_exceptional: form.is_exceptional,
    });
    setSubmitting(false);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Décision pour {student.student.full_name || `${student.student.firstname} ${student.student.lastname}`}
        {student.semester_average !== null && (
          <Typography
            component="span"
            variant="body2"
            color={student.semester_average >= 10 ? 'success.main' : 'error.main'}
            sx={{ ml: 1 }}
          >
            (Moy: {student.semester_average.toFixed(2)}/20)
          </Typography>
        )}
      </Typography>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Décision</InputLabel>
            <Select
              value={form.decision || ''}
              label="Décision"
              onChange={(e) => setForm({ ...form, decision: e.target.value as DecisionType })}
            >
              {DECISION_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Typography color={opt.color}>{opt.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Justification"
            fullWidth
            size="small"
            value={form.justification || ''}
            onChange={(e) => setForm({ ...form, justification: e.target.value })}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Votes pour"
            type="number"
            fullWidth
            size="small"
            value={form.votes_for ?? 0}
            onChange={(e) => setForm({ ...form, votes_for: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Votes contre"
            type="number"
            fullWidth
            size="small"
            value={form.votes_against ?? 0}
            onChange={(e) => setForm({ ...form, votes_against: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Abstentions"
            type="number"
            fullWidth
            size="small"
            value={form.votes_abstain ?? 0}
            onChange={(e) => setForm({ ...form, votes_abstain: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_exceptional || false}
                  onChange={(e) => setForm({ ...form, is_exceptional: e.target.checked })}
                />
              }
              label="Décision exceptionnelle (nécessite révision)"
            />
            <Box display="flex" gap={1}>
              <Button size="small" onClick={onCancel}>Annuler</Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSubmit}
                disabled={!form.decision || submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : undefined}
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
