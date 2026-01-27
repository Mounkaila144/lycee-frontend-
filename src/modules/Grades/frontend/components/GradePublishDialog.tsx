'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

/**
 * Props for GradePublishDialog
 */
interface GradePublishDialogProps {
  open: boolean;
  onClose: () => void;
  evaluationId: number;
  evaluationName: string;
  completenessResult: {
    is_complete: boolean;
    total_students: number;
    entered_count: number;
    missing_count: number;
    absent_count: number;
  } | null;
  onCheckCompleteness: (evaluationId: number) => Promise<void>;
  onPublish: (evaluationId: number, notifyStudents: boolean) => Promise<void>;
  publishing: boolean;
  completenessChecking: boolean;
  error: Error | null;
}

/**
 * GradePublishDialog Component
 * Dialog for publishing grades with completeness check
 */
export const GradePublishDialog: React.FC<GradePublishDialogProps> = ({
  open,
  onClose,
  evaluationId,
  evaluationName,
  completenessResult,
  onCheckCompleteness,
  onPublish,
  publishing,
  completenessChecking,
  error,
}) => {
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Check completeness when dialog opens
  useEffect(() => {
    if (open && evaluationId) {
      setPublishSuccess(false);
      onCheckCompleteness(evaluationId);
    }
  }, [open, evaluationId, onCheckCompleteness]);

  /**
   * Handle publish
   */
  const handlePublish = async () => {
    try {
      await onPublish(evaluationId, notifyStudents);
      setPublishSuccess(true);
    } catch (err) {
      console.error('Error publishing:', err);
    }
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    if (!publishing) {
      setPublishSuccess(false);
      onClose();
    }
  };

  const canPublish = completenessResult?.is_complete && !publishing && !publishSuccess;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-send-plane-line" style={{ color: '#1976d2' }} />
          <Typography variant="h6">Publier les notes</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          {evaluationName}
        </Typography>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        {/* Success */}
        {publishSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Les notes ont été publiées avec succès !
          </Alert>
        )}

        {/* Loading */}
        {completenessChecking && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        )}

        {/* Completeness Check Results */}
        {!completenessChecking && completenessResult && !publishSuccess && (
          <>
            {/* Status */}
            <Alert
              severity={completenessResult.is_complete ? 'success' : 'warning'}
              icon={
                completenessResult.is_complete ? (
                  <i className="ri-checkbox-circle-fill" />
                ) : (
                  <i className="ri-error-warning-fill" />
                )
              }
              sx={{ mb: 2 }}
            >
              {completenessResult.is_complete
                ? 'Toutes les notes ont été saisies. Vous pouvez publier.'
                : `${completenessResult.missing_count} note(s) manquante(s). La publication est bloquée.`}
            </Alert>

            {/* Summary */}
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <i className="ri-checkbox-circle-fill" style={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${completenessResult.entered_count} note(s) saisie(s)`}
                  secondary={`sur ${completenessResult.total_students} étudiant(s)`}
                />
              </ListItem>
              {completenessResult.missing_count > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <i className="ri-close-circle-fill" style={{ color: '#f44336' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${completenessResult.missing_count} note(s) manquante(s)`}
                    secondary="Ces étudiants n'ont ni note ni statut absent"
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon>
                  <i className="ri-error-warning-fill" style={{ color: '#ff9800' }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${completenessResult.absent_count} étudiant(s) absent(s)`}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Publication Warning */}
            {completenessResult.is_complete && (
              <>
                <Alert severity="info" icon={<i className="ri-lock-line" />} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Attention :</strong> Une fois publiées, les notes seront visibles
                    par les étudiants et ne pourront plus être modifiées sans demande de correction.
                  </Typography>
                </Alert>

                {/* Notification Option */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifyStudents}
                      onChange={(e) => setNotifyStudents(e.target.checked)}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <i className="ri-notification-3-line" style={{ fontSize: 18 }} />
                      <Typography variant="body2">
                        Notifier les étudiants de la publication
                      </Typography>
                    </Box>
                  }
                />
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={publishing}>
          {publishSuccess ? 'Fermer' : 'Annuler'}
        </Button>
        {!publishSuccess && (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={!canPublish}
            startIcon={
              publishing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <i className="ri-send-plane-line" />
              )
            }
          >
            {publishing ? 'Publication...' : 'Publier les notes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
