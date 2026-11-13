'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { extractErrorMessage, lyceeGradesService } from '../services/lyceeGradesService';
import type { ClassEvaluation, ClassEvaluationType, SemesterRef } from '../types';
import { EVALUATION_TYPE_LABELS, toScore } from '../types';

interface EvaluationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (evaluation: ClassEvaluation) => void;
  classeId: number;
  subjectId: number;
  semesters: SemesterRef[];
  defaultSemesterId: number | null;
  evaluation?: ClassEvaluation | null;
}

interface FormState {
  title: string;
  type: ClassEvaluationType;
  evaluation_date: string;
  semester_id: number | '';
  max_score: string;
  weight: string;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const initialState = (evaluation: ClassEvaluation | null | undefined, semesterId: number | null): FormState =>
  evaluation
    ? {
        title: evaluation.title,
        type: evaluation.type,
        evaluation_date: evaluation.evaluation_date?.slice(0, 10) ?? today(),
        semester_id: evaluation.semester?.id ?? semesterId ?? '',
        max_score: String(toScore(evaluation.max_score) ?? 20),
        weight: String(toScore(evaluation.weight) ?? 1),
      }
    : { title: '', type: 'devoir', evaluation_date: today(), semester_id: semesterId ?? '', max_score: '20', weight: '1' };

/**
 * Création / modification d'une évaluation (prof sur ses affectations, ou Admin/Manager).
 */
export default function EvaluationFormDialog({
  open,
  onClose,
  onSaved,
  classeId,
  subjectId,
  semesters,
  defaultSemesterId,
  evaluation,
}: EvaluationFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => initialState(evaluation, defaultSemesterId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialState(evaluation, defaultSemesterId));
      setError(null);
    }
  }, [open, evaluation, defaultSemesterId]);

  const changeType = (type: ClassEvaluationType) =>
    setForm((previous) => ({
      ...previous,
      type,
      weight: !evaluation && previous.weight === (previous.type === 'composition' ? '2' : '1') ? (type === 'composition' ? '2' : '1') : previous.weight,
    }));

  const handleSubmit = async () => {
    const maxScore = Number(form.max_score.replace(',', '.'));
    const weight = Number(form.weight.replace(',', '.'));

    if (!form.title.trim() || !form.semester_id || !form.evaluation_date) {
      setError('Titre, semestre et date sont obligatoires.');

      return;
    }

    if (!Number.isFinite(maxScore) || maxScore <= 0 || !Number.isFinite(weight) || weight <= 0) {
      setError('Barème et coefficient doivent être des nombres positifs.');

      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      classe_id: classeId,
      subject_id: subjectId,
      semester_id: form.semester_id,
      title: form.title.trim(),
      type: form.type,
      evaluation_date: form.evaluation_date,
      max_score: maxScore,
      weight,
    };

    try {
      const saved = evaluation
        ? await lyceeGradesService.updateEvaluation(evaluation.id, payload)
        : await lyceeGradesService.createEvaluation(payload);

      onSaved(saved);
    } catch (err) {
      setError(await extractErrorMessage(err, "Échec de l'enregistrement de l'évaluation."));
    } finally {
      setSaving(false);
    }
  };

  const availableSemesters = semesters.filter((semester) => !semester.closed_at || semester.id === evaluation?.semester?.id);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{evaluation ? "Modifier l'évaluation" : 'Nouvelle évaluation'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={4} sx={{ pt: 2 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label='Titre'
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value.slice(0, 150) })}
              placeholder='Ex. Devoir n°1 — Fonctions'
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label='Type'
              value={form.type}
              onChange={(event) => changeType(event.target.value as ClassEvaluationType)}
            >
              {(Object.keys(EVALUATION_TYPE_LABELS) as ClassEvaluationType[]).map((type) => (
                <MenuItem key={type} value={type}>
                  {EVALUATION_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label='Semestre'
              value={form.semester_id}
              onChange={(event) => setForm({ ...form, semester_id: Number(event.target.value) })}
            >
              {availableSemesters.map((semester) => (
                <MenuItem key={semester.id} value={semester.id}>
                  {semester.name}
                  {semester.is_active ? ' (actif)' : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type='date'
              label='Date'
              value={form.evaluation_date}
              onChange={(event) => setForm({ ...form, evaluation_date: event.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label='Noté sur'
              value={form.max_score}
              onChange={(event) => setForm({ ...form, max_score: event.target.value })}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label='Coefficient (poids)'
              value={form.weight}
              onChange={(event) => setForm({ ...form, weight: event.target.value })}
              helperText='Composition : 2 par défaut'
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
