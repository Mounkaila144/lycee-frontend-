'use client';

// MUI Imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

// Type Imports
import type { ThemeColor } from '@core/types';
import type { Student, StudentStatus, StudentStatusHistory } from '../../types/student.types';

// Hook Imports
import {
  useStudentStatusHistory,
  useStatusDocumentDownload,
} from '../hooks/useStudentStatus';

type StudentStatusColor = {
  [key in StudentStatus]: ThemeColor;
};

const statusColorMap: StudentStatusColor = {
  Actif: 'success',
  Suspendu: 'warning',
  Exclu: 'error',
  Diplômé: 'info',
  Abandon: 'secondary',
  Transféré: 'primary',
};

const statusIconMap: Record<StudentStatus, string> = {
  Actif: 'ri-user-follow-line',
  Suspendu: 'ri-pause-circle-line',
  Exclu: 'ri-user-unfollow-line',
  Diplômé: 'ri-graduation-cap-line',
  Abandon: 'ri-logout-box-line',
  Transféré: 'ri-arrow-right-up-line',
};

interface StudentStatusHistoryTabProps {
  student: Student;
  onChangeStatus?: () => void;
}

export const StudentStatusHistoryTab = ({
  student,
  onChangeStatus,
}: StudentStatusHistoryTabProps) => {
  // Fetch status history
  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useStudentStatusHistory(student.id);

  // Document download hook
  const { downloadDocument, isDownloading } = useStatusDocumentDownload();

  // Handle document download
  const handleDownloadDocument = async (historyEntry: StudentStatusHistory) => {
    if (historyEntry.document_path) {
      await downloadDocument(
        student.id,
        historyEntry.id,
        `justificatif-${historyEntry.new_status}.pdf`
      );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format datetime
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className="flex justify-center items-center" sx={{ py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      >
        Erreur lors du chargement de l'historique des statuts
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with actions */}
      <Box className="flex justify-between items-center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6">Historique des Statuts</Typography>
          <Typography variant="body2" color="text.secondary">
            Suivi complet des changements de statut de l'étudiant
          </Typography>
        </Box>
        {onChangeStatus && (
          <Button
            variant="contained"
            size="small"
            startIcon={<i className="ri-exchange-line" />}
            onClick={onChangeStatus}
          >
            Changer le statut
          </Button>
        )}
      </Box>

      {/* Current Status Card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box className="flex justify-between items-center">
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Statut actuel
              </Typography>
              <Box className="flex items-center gap-2" sx={{ mt: 1 }}>
                <Chip
                  label={student.status}
                  color={statusColorMap[student.status]}
                  icon={<i className={statusIconMap[student.status]} />}
                />
              </Box>
            </Box>
            <Box className="text-right">
              <Typography variant="subtitle2" color="text.secondary">
                Nombre de changements
              </Typography>
              <Typography variant="h4">{history?.length || 0}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Timeline */}
      {history && history.length > 0 ? (
        <Timeline position="alternate">
          {history.map((entry, index) => (
            <TimelineItem key={entry.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(entry.effective_date)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(entry.created_at)}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={statusColorMap[entry.new_status]} variant="outlined">
                  <i className={statusIconMap[entry.new_status]} style={{ fontSize: 16 }} />
                </TimelineDot>
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Card variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    {/* Status Change */}
                    <Box className="flex items-center gap-2" sx={{ mb: 1 }}>
                      <Chip
                        label={entry.old_status}
                        size="small"
                        color={statusColorMap[entry.old_status]}
                        variant="outlined"
                      />
                      <i className="ri-arrow-right-line" />
                      <Chip
                        label={entry.new_status}
                        size="small"
                        color={statusColorMap[entry.new_status]}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Reason */}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Motif:</strong> {entry.reason}
                    </Typography>

                    {/* Changed by */}
                    {entry.changed_by_user && (
                      <Typography variant="caption" color="text.secondary">
                        Par: {entry.changed_by_user.firstname} {entry.changed_by_user.lastname}
                      </Typography>
                    )}

                    {/* Document */}
                    {entry.document_path && (
                      <Box sx={{ mt: 1 }}>
                        <Tooltip title="Télécharger le justificatif">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadDocument(entry)}
                            disabled={isDownloading}
                          >
                            <i className="ri-attachment-line" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary">
                          Document justificatif disponible
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <Box className="text-center" sx={{ py: 6 }}>
          <i
            className="ri-history-line"
            style={{ fontSize: 48, color: 'var(--mui-palette-text-secondary)' }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Aucun historique de changement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            L'étudiant n'a jamais changé de statut depuis sa création.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StudentStatusHistoryTab;
