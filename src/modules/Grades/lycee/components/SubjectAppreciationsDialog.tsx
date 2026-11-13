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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { extractErrorMessage, lyceeGradesService } from '../services/lyceeGradesService';
import { formatScore, scoreColor } from '../types';
import type { Decimal } from '../types';

interface SubjectAppreciationsDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (count: number) => void;
  classeId: number;
  subjectId: number;
  semesterId: number;
  title: string;
}

interface AppreciationRow {
  studentId: number;
  fullName: string;
  average: Decimal | null;
  initial: string;
  comment: string;
}

/**
 * Appréciations d'une matière pour tous les élèves d'une classe sur un semestre
 * (professeur de la matière). Moyennes provisoires (évaluations non publiées incluses).
 */
export default function SubjectAppreciationsDialog({
  open,
  onClose,
  onSaved,
  classeId,
  subjectId,
  semesterId,
  title,
}: SubjectAppreciationsDialogProps) {
  const [rows, setRows] = useState<AppreciationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await lyceeGradesService.getClassResults(classeId, semesterId, true);
        const details = await Promise.all(
          results.students.map((row) =>
            lyceeGradesService
              .getStudentResults(row.student.id, semesterId)
              .then((response) => response.data)
              .catch(() => null),
          ),
        );

        if (cancelled) {
          return;
        }

        setRows(
          results.students.map((row, index) => {
            const appreciation =
              details[index]?.subjects.find((subject) => subject.subject.id === subjectId)?.appreciation ?? '';

            return {
              studentId: row.student.id,
              fullName: row.student.full_name,
              average: row.subjects?.[String(subjectId)]?.average ?? null,
              initial: appreciation,
              comment: appreciation,
            };
          }),
        );
      } catch (err) {
        if (!cancelled) {
          setError(await extractErrorMessage(err, 'Impossible de charger les élèves.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, classeId, subjectId, semesterId]);

  const changed = rows.filter((row) => row.comment.trim() !== row.initial.trim());

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      for (const row of changed) {
        await lyceeGradesService.saveReportCardComment({
          student_id: row.studentId,
          semester_id: semesterId,
          subject_id: subjectId,
          comment: row.comment.trim(),
        });
      }

      onSaved?.(changed.length);
      onClose();
    } catch (err) {
      setError(await extractErrorMessage(err, "Échec de l'enregistrement des appréciations."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth='md'>
      <DialogTitle>Appréciations — {title}</DialogTitle>
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
        ) : rows.length === 0 ? (
          <Alert severity='info'>Aucun élève.</Alert>
        ) : (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Élève</TableCell>
                <TableCell align='center' width={110}>
                  Moy. (prov.)
                </TableCell>
                <TableCell>Appréciation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.studentId}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell align='center'>
                    <Typography color={scoreColor(row.average)} fontWeight={600}>
                      {formatScore(row.average)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size='small'
                      value={row.comment}
                      placeholder='Ex. Bon travail, continuez ainsi.'
                      onChange={(event) =>
                        setRows((previous) =>
                          previous.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, comment: event.target.value.slice(0, 300) } : item,
                          ),
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Fermer
        </Button>
        <Button variant='contained' onClick={handleSave} disabled={saving || changed.length === 0}>
          {saving ? 'Enregistrement…' : `Enregistrer (${changed.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
