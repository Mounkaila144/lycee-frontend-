'use client';

import React, { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import type { GradeHistory, GradeChangeType } from '../../types/validation.types';

interface GradeHistoryModalProps {
  open: boolean;
  onClose: () => void;
  gradeId: number | null;
  studentName: string;
  history: GradeHistory[];
  loading: boolean;
  error: Error | null;
  onFetchHistory: (gradeId: number) => void;
}

const getChangeTypeColor = (type: GradeChangeType): 'success' | 'info' | 'warning' => {
  switch (type) {
    case 'creation':
      return 'success';
    case 'modification':
      return 'info';
    case 'correction':
      return 'warning';
    default:
      return 'info';
  }
};

const getChangeTypeLabel = (type: GradeChangeType): string => {
  switch (type) {
    case 'creation':
      return 'Création';
    case 'modification':
      return 'Modification';
    case 'correction':
      return 'Correction';
    default:
      return type;
  }
};

const getChangeTypeIcon = (type: GradeChangeType): string => {
  switch (type) {
    case 'creation':
      return 'ri-add-line';
    case 'modification':
      return 'ri-edit-line';
    case 'correction':
      return 'ri-error-warning-line';
    default:
      return 'ri-history-line';
  }
};

export const GradeHistoryModal: React.FC<GradeHistoryModalProps> = ({
  open,
  onClose,
  gradeId,
  studentName,
  history,
  loading,
  error,
  onFetchHistory,
}) => {
  useEffect(() => {
    if (open && gradeId) {
      onFetchHistory(gradeId);
    }
  }, [open, gradeId, onFetchHistory]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Historique des modifications</Typography>
            <Typography variant="body2" color="text.secondary">
              {studentName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        {!loading && !error && history.length === 0 && (
          <Box py={4} textAlign="center">
            <Typography color="text.secondary">
              Aucun historique de modification pour cette note.
            </Typography>
          </Box>
        )}

        {!loading && history.length > 0 && (
          <Timeline position="right" sx={{ p: 0 }}>
            {history.map((entry, index) => (
              <TimelineItem key={entry.id}>
                <TimelineOppositeContent
                  sx={{ maxWidth: 120, px: 1 }}
                  variant="caption"
                  color="text.secondary"
                >
                  {new Date(entry.changed_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  <br />
                  {new Date(entry.changed_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getChangeTypeColor(entry.change_type)} variant="outlined">
                    <i className={getChangeTypeIcon(entry.change_type)} style={{ fontSize: 16 }} />
                  </TimelineDot>
                  {index < history.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: 1.5, px: 2 }}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Chip
                        label={getChangeTypeLabel(entry.change_type)}
                        color={getChangeTypeColor(entry.change_type)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {entry.old_value !== null ? entry.old_value : '—'}
                      </Typography>
                      <i className="ri-arrow-right-line" style={{ fontSize: 14, color: '#999' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {entry.new_value !== null ? entry.new_value : '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /20
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Par: {typeof entry.changed_by === 'object' && entry.changed_by?.name
                        ? entry.changed_by.name
                        : entry.changed_by_user?.name || `Utilisateur #${entry.changed_by}`}
                    </Typography>

                    {entry.reason && (
                      <Box mt={0.5}>
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          Motif: {entry.reason}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
