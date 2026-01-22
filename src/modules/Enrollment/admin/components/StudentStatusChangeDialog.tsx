'use client';

import { useState, useMemo } from 'react';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

// Type Imports
import type { ThemeColor } from '@core/types';
import type { Student, StudentStatus, StatusChangeRequest } from '../../types/student.types';
import { STATUS_TRANSITIONS } from '../../types/student.types';

// Hook Imports
import { useStudentStatusMutations } from '../hooks/useStudentStatus';

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

const statusDescriptions: Record<StudentStatus, string> = {
  Actif: 'Étudiant en cours de formation avec accès complet à la plateforme.',
  Suspendu: 'Suspension temporaire - accès à la plateforme révoqué.',
  Exclu: 'Exclusion définitive - retrait de tous les modules et accès révoqué.',
  Diplômé: 'Formation terminée avec succès - génération automatique du diplôme.',
  Abandon: 'Abandon volontaire de la formation - libération des places dans les groupes.',
  Transféré: 'Transfert vers un autre établissement.',
};

const statusImpacts: Record<StudentStatus, string[]> = {
  Actif: ['Accès plateforme restauré', 'Réinscription aux modules possible'],
  Suspendu: ['Accès plateforme révoqué', 'Notes conservées', 'Retour possible'],
  Exclu: ['Accès plateforme révoqué définitivement', 'Retrait de tous modules', 'Archivage du dossier'],
  Diplômé: ['Génération automatique du diplôme', 'Accès consultation uniquement', 'Dossier archivé'],
  Abandon: ['Accès plateforme révoqué', 'Libération place groupe', 'Notes conservées'],
  Transféré: ['Dossier transféré', 'Accès plateforme révoqué', 'Historique conservé'],
};

interface StudentStatusChangeDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student;
  onSuccess?: () => void;
}

export const StudentStatusChangeDialog = ({
  open,
  onClose,
  student,
  onSuccess,
}: StudentStatusChangeDialogProps) => {
  // Form state - ensure all values are always defined (never undefined)
  const [newStatus, setNewStatus] = useState<StudentStatus | ''>('');
  const [reason, setReason] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [document, setDocument] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Guard: if no student, don't render
  if (!student) {
    return null;
  }

  // Mutations
  const { changeStatus, isChangingStatus } = useStudentStatusMutations();

  // Get allowed transitions
  const allowedStatuses = useMemo(() => {
    return STATUS_TRANSITIONS[student.status] || [];
  }, [student.status]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      newStatus !== '' &&
      (reason || '').length >= 10 &&
      (effectiveDate || '') !== ''
    );
  }, [newStatus, reason, effectiveDate]);

  // Handle status change
  const handleStatusChange = (status: StudentStatus) => {
    setNewStatus(status);
    setFormError(null);
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        setFormError('Format de fichier non supporté. Utilisez PDF, JPG ou PNG.');
        return;
      }

      if (file.size > maxSize) {
        setFormError('Le fichier ne doit pas dépasser 2 Mo.');
        return;
      }

      setDocument(file);
      setFormError(null);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid || newStatus === '') return;

    const data: StatusChangeRequest = {
      status: newStatus,
      reason,
      effective_date: effectiveDate,
      document: document || undefined,
    };

    changeStatus(
      { studentId: student.id, data },
      {
        onSuccess: () => {
          // Parent handles closing and refetching
          onSuccess?.();
        },
        onError: (error: Error) => {
          setFormError(error.message || 'Erreur lors du changement de statut');
        },
      }
    );
  };

  // Handle close
  const handleClose = () => {
    setNewStatus('');
    setReason('');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setDocument(null);
    setFormError(null);
    onClose();
  };

  // Remove file
  const handleRemoveFile = () => {
    setDocument(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h5">Changer le Statut</Typography>
          <IconButton onClick={handleClose} size="small" disabled={isChangingStatus}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Current Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Étudiant
          </Typography>
          <Typography variant="h6">
            {student.firstname} {student.lastname}
          </Typography>
          <Box className="flex items-center gap-2" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Statut actuel:
            </Typography>
            <Chip
              label={student.status}
              size="small"
              color={statusColorMap[student.status]}
              variant="tonal"
            />
          </Box>
        </Box>

        {/* No transitions available */}
        {allowedStatuses.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Statut final</AlertTitle>
            Le statut "{student.status}" est un statut final. Aucune transition n'est autorisée.
          </Alert>
        )}

        {/* Form */}
        {allowedStatuses.length > 0 && (
          <>
            {/* New Status Selection */}
            <TextField
              select
              fullWidth
              label="Nouveau statut"
              value={newStatus || ''}
              onChange={(e) => handleStatusChange(e.target.value as StudentStatus)}
              sx={{ mb: 3 }}
              required
            >
              {allowedStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  <Box className="flex items-center gap-2">
                    <Chip
                      label={status}
                      size="small"
                      color={statusColorMap[status]}
                      sx={{ minWidth: 90 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {statusDescriptions[status]}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Impact Warning */}
            {newStatus && (
              <Alert
                severity={
                  newStatus === 'Actif' ? 'success' :
                  newStatus === 'Exclu' ? 'error' :
                  newStatus === 'Diplômé' ? 'info' : 'warning'
                }
                sx={{ mb: 3 }}
              >
                <AlertTitle>Impacts du changement</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {statusImpacts[newStatus].map((impact, index) => (
                    <li key={index}>{impact}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Reason */}
            <TextField
              fullWidth
              label="Motif du changement"
              value={reason || ''}
              onChange={(e) => setReason(e.target.value || '')}
              multiline
              rows={3}
              required
              helperText={`${(reason || '').length}/1000 caractères (minimum 10)`}
              error={(reason || '').length > 0 && (reason || '').length < 10}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 1000 }}
            />

            {/* Effective Date */}
            <TextField
              fullWidth
              type="date"
              label="Date effective"
              value={effectiveDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEffectiveDate(e.target.value || new Date().toISOString().split('T')[0])}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ mb: 3 }}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
              }}
            />

            {/* Document Upload */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Document justificatif (optionnel)
              </Typography>
              <input
                type="file"
                id="status-document"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="status-document">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<i className="ri-upload-2-line" />}
                  disabled={isChangingStatus}
                >
                  Télécharger un document
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                PDF, JPG ou PNG (max 2 Mo)
              </Typography>

              {document && (
                <Box className="flex items-center gap-2" sx={{ mt: 1 }}>
                  <Chip
                    label={document.name}
                    onDelete={handleRemoveFile}
                    size="small"
                    icon={<i className="ri-file-line" />}
                  />
                </Box>
              )}
            </Box>

            {/* Form Error */}
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={isChangingStatus}>
          Annuler
        </Button>
        {allowedStatuses.length > 0 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid || isChangingStatus}
            startIcon={
              isChangingStatus ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <i className="ri-check-line" />
              )
            }
          >
            {isChangingStatus ? 'Enregistrement...' : 'Confirmer le changement'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentStatusChangeDialog;
