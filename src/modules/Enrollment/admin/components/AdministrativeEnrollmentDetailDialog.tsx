'use client';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

// Type Imports
import type { ThemeColor } from '@core/types';
import type { AdministrativeEnrollment, AdministrativeEnrollmentStatus, AcademicLevel } from '../../types/administrativeEnrollment.types';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';

interface Props {
  open: boolean;
  onClose: () => void;
  enrollment: AdministrativeEnrollment | null;
  onEdit: (enrollment: AdministrativeEnrollment) => void;
  onDelete: (enrollment: AdministrativeEnrollment) => void;
}

type EnrollmentStatusColor = {
  [key in AdministrativeEnrollmentStatus]: ThemeColor;
};

const statusColorMap: EnrollmentStatusColor = {
  Actif: 'success',
  Suspendu: 'warning',
  Annulé: 'error',
  Terminé: 'info',
  Validé: 'primary',
  Rejeté: 'secondary',
};

const levelLabels: Record<AcademicLevel, string> = {
  L1: 'Licence 1',
  L2: 'Licence 2',
  L3: 'Licence 3',
  M1: 'Master 1',
  M2: 'Master 2',
};

export const AdministrativeEnrollmentDetailDialog = ({ open, onClose, enrollment, onEdit, onDelete }: Props) => {
  if (!enrollment) return null;

  const student = enrollment.student;
  const programme = enrollment.programme;
  const semester = enrollment.semester;
  const academicYear = enrollment.academic_year;
  const moduleEnrollments = enrollment.module_enrollments || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Détails de l'inscription</Typography>
          <Box>
            <IconButton onClick={() => onEdit(enrollment)} title="Modifier">
              <i className="ri-edit-line" />
            </IconButton>
            <IconButton onClick={() => onDelete(enrollment)} title="Supprimer" color="error">
              <i className="ri-delete-bin-line" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Student Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            ETUDIANT
          </Typography>
          {student && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomAvatar skin="light" size={50} color="primary">
                {student.matricule?.substring(0, 2).toUpperCase() || '??'}
              </CustomAvatar>
              <Box>
                <Typography variant="h6">
                  {student.firstname} {student.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.matricule}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Enrollment Info */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Programme
            </Typography>
            <Typography variant="body1">{programme?.libelle || '-'}</Typography>
            {programme?.code && (
              <Typography variant="caption" color="text.secondary">
                {programme.code}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Niveau
            </Typography>
            <Chip
              label={levelLabels[enrollment.level] || enrollment.level}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Semestre
            </Typography>
            <Typography variant="body1">{semester?.name || '-'}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Année académique
            </Typography>
            <Typography variant="body1">{academicYear?.name || '-'}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Date d'inscription
            </Typography>
            <Typography variant="body1">
              {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR') : '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Statut
            </Typography>
            <Chip label={enrollment.status} color={statusColorMap[enrollment.status]} variant="tonal" size="small" />
          </Grid>

          {enrollment.total_credits !== undefined && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total crédits
              </Typography>
              <Typography variant="body1">{enrollment.total_credits} ECTS</Typography>
            </Grid>
          )}

          {enrollment.notes && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1">{enrollment.notes}</Typography>
            </Grid>
          )}
        </Grid>

        {/* Module Enrollments */}
        {moduleEnrollments.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              MODULES INSCRITS ({moduleEnrollments.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell align="center">ECTS</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moduleEnrollments.map((me) => (
                    <TableRow key={me.id}>
                      <TableCell>{me.module?.code || '-'}</TableCell>
                      <TableCell>{me.module?.libelle || '-'}</TableCell>
                      <TableCell align="center">{me.module?.credits_ects || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={me.module?.type || '-'}
                          size="small"
                          color={me.module?.type === 'Obligatoire' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={me.status} size="small" variant="tonal" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Créé le: {enrollment.created_at ? new Date(enrollment.created_at).toLocaleString('fr-FR') : '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Modifié le: {enrollment.updated_at ? new Date(enrollment.updated_at).toLocaleString('fr-FR') : '-'}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
