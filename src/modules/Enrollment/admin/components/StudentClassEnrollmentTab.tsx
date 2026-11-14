'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { ThemeColor } from '@core/types';
import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';

import { studentManagementService } from '../services/studentManagementService';
import type { ClassEnrollmentStatus, StudentClassEnrollment } from '../../types/studentManagement.types';
import type { Student } from '../../types/student.types';
import { ClassEnrollmentDialog } from './ClassEnrollmentDialog';

const statusColors: Record<ClassEnrollmentStatus, ThemeColor> = {
  Actif: 'success',
  Terminé: 'info',
  Transféré: 'warning',
  Annulé: 'secondary',
};

interface StudentClassEnrollmentTabProps {
  student: Student;
  canManage: boolean;
  onChanged?: () => void;
}

/**
 * Onglet « Classe » de la fiche élève : classe de l'année active, historique, inscription / changement / annulation.
 */
export const StudentClassEnrollmentTab = ({ student, canManage, onChanged }: StudentClassEnrollmentTabProps) => {
  const [enrollments, setEnrollments] = useState<StudentClassEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setEnrollments(await studentManagementService.getClassEnrollments(student.id));
    } catch (err) {
      setError(await extractErrorMessage(err, 'Impossible de charger les inscriptions en classe.'));
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    load();
  }, [load]);

  const current = enrollments.find((enrollment) => enrollment.status === 'Actif' && enrollment.academic_year?.is_active) ?? null;

  const handleCancel = async (enrollment: StudentClassEnrollment) => {
    const reason = window.prompt(`Annuler l'inscription en ${enrollment.classe?.name ?? 'classe'} ? Motif (facultatif) :`);

    if (reason === null) return;

    setError(null);

    try {
      await studentManagementService.cancelClassEnrollment(enrollment.id, reason);
      setSuccess('Inscription annulée.');
      await load();
      onChanged?.();
    } catch (err) {
      setError(await extractErrorMessage(err, "L'annulation a échoué."));
    }
  };

  return (
    <Box className='flex flex-col gap-4'>
      {error && <Alert severity='error' onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity='success' onClose={() => setSuccess(null)}>{success}</Alert>}

      <Box className='flex flex-wrap items-center justify-between gap-3'>
        <Box>
          <Typography variant='h6'>Classe de l&apos;année en cours</Typography>
          <Typography color={current ? 'text.primary' : 'text.secondary'}>
            {current
              ? `${current.classe?.name ?? '—'} (${current.academic_year?.name ?? ''}) — ${current.assignment_type}`
              : "Non inscrit dans une classe pour l'année active."}
          </Typography>
        </Box>
        {canManage && (
          <Box className='flex gap-2'>
            <Button
              variant='contained'
              startIcon={<i className={current ? 'ri-arrow-left-right-line' : 'ri-user-add-line'} />}
              onClick={() => setDialogOpen(true)}
            >
              {current ? 'Changer de classe' : 'Inscrire en classe'}
            </Button>
            {current && (
              <Button variant='outlined' color='error' onClick={() => handleCancel(current)}>
                Annuler l&apos;inscription
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Typography variant='h6'>Historique</Typography>
      {loading ? (
        <Box className='flex justify-center' sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : enrollments.length === 0 ? (
        <Typography color='text.secondary'>Aucune inscription en classe.</Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Année</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Inscrit le</TableCell>
              <TableCell>Décision / remarques</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.academic_year?.name ?? '—'}</TableCell>
                <TableCell>{enrollment.classe?.name ?? '—'}</TableCell>
                <TableCell>{enrollment.assignment_type}</TableCell>
                <TableCell>
                  <Chip size='small' variant='tonal' color={statusColors[enrollment.status] ?? 'default'} label={enrollment.status} />
                </TableCell>
                <TableCell>
                  {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR') : '—'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'pre-line' }}>
                  {[enrollment.final_decision, enrollment.notes].filter(Boolean).join('\n') || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ClassEnrollmentDialog
        open={dialogOpen}
        student={{
          id: student.id,
          fullName: `${student.firstname} ${student.lastname}`,
          currentClass: current ? { classe_id: current.classe_id, classe_name: current.classe?.name ?? null } : null,
        }}
        onClose={() => setDialogOpen(false)}
        onSuccess={async (_enrollment, message) => {
          setDialogOpen(false);
          setSuccess(message);
          await load();
          onChanged?.();
        }}
      />
    </Box>
  );
};

export default StudentClassEnrollmentTab;
