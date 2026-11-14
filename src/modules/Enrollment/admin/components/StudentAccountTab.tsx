'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';

import { studentManagementService } from '../services/studentManagementService';
import type { PortalAccount } from '../../types/studentManagement.types';
import type { Student } from '../../types/student.types';
import { PortalAccountPanel } from './PortalAccountPanel';

interface StudentAccountTabProps {
  student: Student;
  canManage: boolean;
}

/**
 * Onglet « Compte » de la fiche élève : compte de connexion au portail Élève.
 */
export const StudentAccountTab = ({ student, canManage }: StudentAccountTabProps) => {
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setAccount(await studentManagementService.getStudentAccount(student.id));
    } catch (err) {
      setError(await extractErrorMessage(err, 'Impossible de charger le compte de connexion.'));
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    load();
  }, [load]);

  const fullName = `${student.firstname} ${student.lastname}`;

  return (
    <Box className='flex flex-col gap-4'>
      <Box>
        <Typography variant='h6'>Compte de connexion de l&apos;élève</Typography>
        <Typography variant='body2' color='text.secondary'>
          Permet à l&apos;élève de se connecter à son espace (notes, emploi du temps, absences…). Rôle : Élève.
        </Typography>
      </Box>
      {error && <Alert severity='error'>{error}</Alert>}
      {loading ? (
        <Box className='flex justify-center' sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <PortalAccountPanel
          account={account}
          ownerLabel={`l'élève ${fullName}`}
          usernameHint={student.matricule ? `eleve.${student.matricule.toLowerCase()}` : 'prenom.nom'}
          canManage={canManage}
          onCreate={(username) => studentManagementService.createStudentAccount(student.id, username)}
          onResetPassword={() => studentManagementService.resetStudentPassword(student.id)}
          onToggleActive={(isActive) => studentManagementService.setStudentAccountActive(student.id, isActive)}
          onChanged={setAccount}
        />
      )}
    </Box>
  );
};

export default StudentAccountTab;
