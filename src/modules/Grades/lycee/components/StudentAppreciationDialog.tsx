'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { extractErrorMessage, lyceeGradesService } from '../services/lyceeGradesService';
import type { Decimal, StudentRef } from '../types';
import { formatScore } from '../types';

interface StudentAppreciationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  student: StudentRef | null;
  semesterId: number;
  canEditGeneral: boolean;
  /** null = toutes les matières (Admin/Manager) ; sinon ids des matières modifiables */
  editableSubjectIds: number[] | null;
}

interface FieldState {
  subjectId: number | null;
  label: string;
  average: Decimal | null;
  initial: string;
  value: string;
}

/**
 * Appréciations du bulletin d'un élève : générale (PP / direction) et par matière (professeur de la matière).
 */
export default function StudentAppreciationDialog({
  open,
  onClose,
  onSaved,
  student,
  semesterId,
  canEditGeneral,
  editableSubjectIds,
}: StudentAppreciationDialogProps) {
  const [fields, setFields] = useState<FieldState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !student) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    lyceeGradesService
      .getStudentResults(student.id, semesterId)
      .then(({ data }) => {
        if (cancelled) {
          return;
        }

        const next: FieldState[] = [];

        if (canEditGeneral) {
          next.push({
            subjectId: null,
            label: 'Appréciation générale (conseil de classe)',
            average: data.general_average,
            initial: data.general_appreciation ?? '',
            value: data.general_appreciation ?? '',
          });
        }

        data.subjects
          .filter((subject) => editableSubjectIds === null || editableSubjectIds.includes(subject.subject.id))
          .forEach((subject) =>
            next.push({
              subjectId: subject.subject.id,
              label: subject.subject.name,
              average: subject.average,
              initial: subject.appreciation ?? '',
              value: subject.appreciation ?? '',
            }),
          );

        setFields(next);
      })
      .catch(async (err) => {
        if (!cancelled) {
          setError(await extractErrorMessage(err, "Impossible de charger les résultats de l'élève."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, student, semesterId, canEditGeneral, editableSubjectIds]);

  const changed = fields.filter((field) => field.value.trim() !== field.initial.trim());

  const handleSave = async () => {
    if (!student) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      for (const field of changed) {
        await lyceeGradesService.saveReportCardComment({
          student_id: student.id,
          semester_id: semesterId,
          subject_id: field.subjectId,
          comment: field.value.trim(),
        });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(await extractErrorMessage(err, "Échec de l'enregistrement des appréciations."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Appréciations — {student?.full_name}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress size={28} />
          </Box>
        ) : fields.length === 0 ? (
          <Alert severity='info'>Aucune appréciation modifiable pour cet élève.</Alert>
        ) : (
          <Box display='flex' flexDirection='column' gap={4} pt={2}>
            {fields.map((field, index) => (
              <Box key={field.subjectId ?? 'general'}>
                <Typography variant='subtitle2' gutterBottom>
                  {field.label} — moy. {formatScore(field.average)}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={field.subjectId === null ? 3 : 1}
                  size='small'
                  value={field.value}
                  onChange={(event) =>
                    setFields((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value.slice(0, 300) } : item,
                      ),
                    )
                  }
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Fermer
        </Button>
        <Button variant='contained' onClick={handleSave} disabled={saving || changed.length === 0}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
