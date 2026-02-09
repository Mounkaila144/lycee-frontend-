'use client';

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { AbsenceType, AbsencePolicy } from '../../types/absence.types';

/**
 * Get color for absence type chip
 */
export const getAbsenceTypeColor = (type: AbsenceType | null): 'error' | 'warning' | 'success' | 'default' => {
  switch (type) {
    case 'unjustified':
      return 'error';
    case 'pending':
      return 'warning';
    case 'justified':
      return 'success';
    default:
      return 'default';
  }
};

/**
 * Get label for absence type
 */
export const getAbsenceTypeLabel = (type: AbsenceType | null): string => {
  switch (type) {
    case 'unjustified':
      return 'Non justifiée';
    case 'pending':
      return 'En attente';
    case 'justified':
      return 'Justifiée';
    default:
      return 'Absent';
  }
};

interface AbsenceManagementModalProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  gradeId: number | null;
  currentAbsenceType: AbsenceType | null;
  absencePolicy: AbsencePolicy | null;
  onUpdateAbsenceType: (gradeId: number, absenceType: AbsenceType, comment?: string) => void;
  onUploadJustification?: (gradeId: number, file: File, comment?: string) => void;
  onScheduleReplacement?: (data: {
    scheduled_at: string;
    location: string;
    type: 'same' | 'alternative';
    comment?: string;
  }) => void;
  updating?: boolean;
  uploading?: boolean;
}

/**
 * AbsenceManagementModal Component
 * Modal for managing individual student absences
 */
export const AbsenceManagementModal: React.FC<AbsenceManagementModalProps> = ({
  open,
  onClose,
  studentName,
  gradeId,
  currentAbsenceType,
  absencePolicy,
  onUpdateAbsenceType,
  onUploadJustification,
  onScheduleReplacement,
  updating = false,
  uploading = false,
}) => {
  const [absenceType, setAbsenceType] = useState<AbsenceType>(currentAbsenceType || 'unjustified');
  const [comment, setComment] = useState('');
  const [justificationFile, setJustificationFile] = useState<File | null>(null);
  const [justificationComment, setJustificationComment] = useState('');
  const [showReplacement, setShowReplacement] = useState(false);
  const [replacementData, setReplacementData] = useState({
    scheduled_at: '',
    location: '',
    type: 'same' as 'same' | 'alternative',
    comment: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (open) {
      setAbsenceType(currentAbsenceType || 'unjustified');
      setComment('');
      setJustificationFile(null);
      setJustificationComment('');
      setShowReplacement(false);
      setError(null);
    }
  }, [open, currentAbsenceType]);

  /**
   * Handle absence type change and save
   */
  const handleSaveAbsenceType = useCallback(() => {
    if (!gradeId) return;
    onUpdateAbsenceType(gradeId, absenceType, comment || undefined);
  }, [gradeId, absenceType, comment, onUpdateAbsenceType]);

  /**
   * Handle justification file selection
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Formats acceptés: PDF, JPG, PNG');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 Mo');
      return;
    }

    setError(null);
    setJustificationFile(file);
  }, []);

  /**
   * Handle justification upload
   */
  const handleUploadJustification = useCallback(() => {
    if (!gradeId || !justificationFile || !onUploadJustification) return;
    onUploadJustification(gradeId, justificationFile, justificationComment || undefined);
  }, [gradeId, justificationFile, justificationComment, onUploadJustification]);

  /**
   * Handle schedule replacement
   */
  const handleScheduleReplacement = useCallback(() => {
    if (!onScheduleReplacement) return;
    if (!replacementData.scheduled_at || !replacementData.location) {
      setError('Veuillez remplir la date et le lieu');
      return;
    }
    onScheduleReplacement(replacementData);
  }, [replacementData, onScheduleReplacement]);

  /**
   * Get policy effect description
   */
  const getPolicyEffect = (): string => {
    if (!absencePolicy) return '';

    if (absenceType === 'unjustified') {
      return absencePolicy.unjustified_grade_is_zero
        ? 'Note = 0 (incluse dans le calcul de la moyenne)'
        : 'Exclue du calcul de la moyenne (coefficient retiré)';
    }

    if (absenceType === 'justified') {
      if (absencePolicy.justified_allows_replacement) {
        return 'Évaluation de remplacement autorisée. Si pas de remplacement: exclue du calcul.';
      }
      return 'Exclue du calcul de la moyenne (coefficient retiré)';
    }

    return 'En attente de justificatif. Traitement selon décision finale.';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-user-unfollow-line" style={{ fontSize: 24 }} />
          <Typography variant="h6">Gérer l&apos;absence</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {studentName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Absence Type Selector */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Statut de l&apos;absence
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Type d&apos;absence</InputLabel>
            <Select
              value={absenceType}
              label="Type d'absence"
              onChange={(e) => setAbsenceType(e.target.value as AbsenceType)}
            >
              <MenuItem value="unjustified">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label="NJ" size="small" color="error" sx={{ height: 20 }} />
                  Non justifiée
                </Box>
              </MenuItem>
              <MenuItem value="pending">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label="EA" size="small" color="warning" sx={{ height: 20 }} />
                  En attente de justificatif
                </Box>
              </MenuItem>
              <MenuItem value="justified">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label="J" size="small" color="success" sx={{ height: 20 }} />
                  Justifiée
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Policy effect */}
          {absencePolicy && (
            <Alert severity="info" sx={{ mt: 1 }} icon={<i className="ri-information-line" />}>
              <Typography variant="caption">
                <strong>Effet sur la moyenne:</strong> {getPolicyEffect()}
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Comment */}
        <Box mb={3}>
          <TextField
            fullWidth
            size="small"
            label="Commentaire administratif"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={2}
            inputProps={{ maxLength: 500 }}
            helperText={`${comment.length}/500 caractères`}
          />
        </Box>

        {/* Save Type Button */}
        <Box mb={3} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveAbsenceType}
            disabled={updating || absenceType === currentAbsenceType}
            startIcon={updating ? <CircularProgress size={16} /> : <i className="ri-save-line" />}
          >
            Enregistrer le statut
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Justification Upload Section */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            <i className="ri-file-upload-line" style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Justificatif
          </Typography>

          {absencePolicy && (
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Délai de dépôt: {absencePolicy.justification_deadline_days} jours
            </Typography>
          )}

          <Box display="flex" gap={1} alignItems="flex-start">
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<i className="ri-upload-2-line" />}
            >
              Choisir un fichier
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
            {justificationFile && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Chip
                  label={justificationFile.name}
                  size="small"
                  onDelete={() => setJustificationFile(null)}
                />
                <Typography variant="caption" color="text.secondary">
                  ({(justificationFile.size / 1024).toFixed(0)} Ko)
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Formats acceptés: PDF, JPG, PNG (max 5 Mo)
          </Typography>

          {justificationFile && (
            <Box mt={1}>
              <TextField
                fullWidth
                size="small"
                label="Commentaire sur le justificatif"
                value={justificationComment}
                onChange={(e) => setJustificationComment(e.target.value)}
                inputProps={{ maxLength: 500 }}
              />
              <Box mt={1} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  color="info"
                  onClick={handleUploadJustification}
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={16} /> : <i className="ri-upload-cloud-line" />}
                >
                  Envoyer le justificatif
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Replacement Evaluation Section */}
        {absencePolicy?.justified_allows_replacement && absenceType === 'justified' && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                <i className="ri-calendar-schedule-line" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Évaluation de remplacement
              </Typography>
              {!showReplacement && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowReplacement(true)}
                  startIcon={<i className="ri-add-line" />}
                >
                  Planifier
                </Button>
              )}
            </Box>

            {showReplacement && (
              <Box sx={{ pl: 1, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                <Box display="flex" gap={2} mb={1}>
                  <TextField
                    size="small"
                    type="datetime-local"
                    label="Date et heure"
                    value={replacementData.scheduled_at}
                    onChange={(e) => setReplacementData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Lieu"
                    value={replacementData.location}
                    onChange={(e) => setReplacementData(prev => ({ ...prev, location: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                </Box>

                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel>Type d&apos;évaluation</InputLabel>
                  <Select
                    value={replacementData.type}
                    label="Type d'évaluation"
                    onChange={(e) => setReplacementData(prev => ({ ...prev, type: e.target.value as 'same' | 'alternative' }))}
                  >
                    <MenuItem value="same">Même évaluation</MenuItem>
                    <MenuItem value="alternative">Évaluation alternative</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  fullWidth
                  label="Commentaire"
                  value={replacementData.comment}
                  onChange={(e) => setReplacementData(prev => ({ ...prev, comment: e.target.value }))}
                  sx={{ mb: 1 }}
                />

                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => setShowReplacement(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={handleScheduleReplacement}
                    startIcon={<i className="ri-calendar-check-line" />}
                  >
                    Planifier le remplacement
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
