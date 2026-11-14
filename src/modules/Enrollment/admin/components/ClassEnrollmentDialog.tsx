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
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';
import { classeService } from '@/modules/StructureAcademique/admin/services/classeService';
import type { Classe } from '@/modules/StructureAcademique/types/classe.types';

import { studentManagementService } from '../services/studentManagementService';
import type { StudentClassEnrollment } from '../../types/studentManagement.types';

export interface ClassEnrollmentTarget {
  id: number;
  fullName: string;

  /** Classe actuelle (année active) : présente → « Changer de classe », absente → « Inscrire en classe » */
  currentClass: { classe_id: number; classe_name: string | null } | null;
}

interface ClassEnrollmentDialogProps {
  open: boolean;
  student: ClassEnrollmentTarget | null;
  onClose: () => void;
  onSuccess: (enrollment: StudentClassEnrollment, message: string) => void;
}

const classeLabel = (classe: Classe): string => {
  const count = classe.students_count ?? 0;

  return classe.max_capacity ? `${classe.name} (${count}/${classe.max_capacity})` : `${classe.name} (${count})`;
};

const isFull = (classe: Classe): boolean => Boolean(classe.max_capacity) && (classe.students_count ?? 0) >= classe.max_capacity;

/**
 * Inscrire un élève dans une classe de l'année active, ou le changer de classe (transfert interne).
 */
export const ClassEnrollmentDialog = ({ open, student, onClose, onSuccess }: ClassEnrollmentDialogProps) => {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classeId, setClasseId] = useState<number | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isChange = Boolean(student?.currentClass);

  useEffect(() => {
    if (!open) return;

    setClasseId('');
    setComment('');
    setError(null);
    setLoadingClasses(true);

    classeService
      .getClasses({ per_page: 200 })
      .then(setClasses)
      .catch(async (err) => setError(await extractErrorMessage(err, 'Impossible de charger les classes.')))
      .finally(() => setLoadingClasses(false));
  }, [open]);

  const handleSubmit = async () => {
    if (!student || classeId === '') return;

    setSubmitting(true);
    setError(null);

    try {
      const enrollment = isChange
        ? await studentManagementService.changeClass(student.id, classeId, comment)
        : await studentManagementService.enrollInClass(student.id, classeId, comment);

      onSuccess(
        enrollment,
        isChange
          ? `${student.fullName} a été transféré(e) en ${enrollment.classe?.name ?? 'nouvelle classe'}.`
          : `${student.fullName} est inscrit(e) en ${enrollment.classe?.name ?? 'classe'}.`,
      );
    } catch (err) {
      setError(await extractErrorMessage(err, "L'inscription a échoué."));
    } finally {
      setSubmitting(false);
    }
  };

  const availableClasses = classes.filter((classe) => classe.id !== student?.currentClass?.classe_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{isChange ? 'Changer de classe' : 'Inscrire en classe'}</DialogTitle>
      <DialogContent dividers>
        <Box className='flex flex-col gap-4'>
          {student && (
            <Typography>
              Élève : <strong>{student.fullName}</strong>
              {student.currentClass && (
                <>
                  {' '}— classe actuelle : <strong>{student.currentClass.classe_name ?? '—'}</strong>
                </>
              )}
            </Typography>
          )}
          {isChange && (
            <Alert severity='info'>
              Transfert interne : l&apos;élève quitte sa classe actuelle pour la nouvelle classe (même année scolaire).
              Le changement est tracé dans l&apos;historique et le journal d&apos;audit.
            </Alert>
          )}
          {error && <Alert severity='error'>{error}</Alert>}
          {loadingClasses ? (
            <Box className='flex justify-center' sx={{ py: 2 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TextField
              select
              fullWidth
              label={isChange ? 'Nouvelle classe' : 'Classe'}
              value={classeId}
              onChange={(event) => setClasseId(Number(event.target.value))}
              helperText="Classes de l'année scolaire active (effectif / capacité)."
            >
              {availableClasses.length === 0 && (
                <MenuItem value='' disabled>
                  Aucune classe disponible
                </MenuItem>
              )}
              {availableClasses.map((classe) => (
                <MenuItem key={classe.id} value={classe.id} disabled={isFull(classe)}>
                  {classeLabel(classe)}
                  {isFull(classe) ? ' — complète' : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            fullWidth
            label={isChange ? 'Motif (facultatif)' : 'Remarque (facultatif)'}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            inputProps={{ maxLength: 255 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary' disabled={submitting}>
          Annuler
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={submitting || classeId === ''}>
          {submitting ? <CircularProgress size={20} /> : isChange ? 'Changer de classe' : 'Inscrire'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassEnrollmentDialog;
