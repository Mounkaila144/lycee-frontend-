'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';

import { CREDITS_CONSTRAINTS } from '../../types/coefficient.types';

/**
 * Props for CreditsEditDialog
 */
interface CreditsEditDialogProps {
  open: boolean;
  moduleId: number | null;
  moduleName: string;
  currentCredits: number;
  creditsLocked: boolean;
  onClose: () => void;
  onSave: (credits: number, reason?: string) => Promise<boolean>;
  saving: boolean;
  validateCredits: (value: number) => { valid: boolean; error?: string };
}

/**
 * Credits marks for slider
 */
const creditsMarks = [
  { value: 1, label: '1' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
];

/**
 * CreditsEditDialog Component
 * Dialog for editing module ECTS credits
 */
export const CreditsEditDialog: React.FC<CreditsEditDialogProps> = ({
  open,
  moduleId,
  moduleName,
  currentCredits,
  creditsLocked,
  onClose,
  onSave,
  saving,
  validateCredits,
}) => {
  const { t } = useTranslation('Grades');
  const [credits, setCredits] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open && moduleId) {
      setCredits(currentCredits);
      setReason('');
      setError(null);
    }
  }, [open, moduleId, currentCredits]);

  /**
   * Handle credits change
   */
  const handleCreditsChange = useCallback(
    (value: number) => {
      setCredits(value);

      const validation = validateCredits(value);

      if (!validation.valid) {
        setError(validation.error || t('creditsEditDialog.invalidCredits'));
      } else {
        setError(null);
      }
    },
    [validateCredits]
  );

  /**
   * Handle save
   */
  const handleSave = useCallback(async () => {
    const validation = validateCredits(credits);

    if (!validation.valid) {
      setError(validation.error || t('creditsEditDialog.invalidCredits'));

      return;
    }

    // Require reason if credits are locked
    if (creditsLocked && !reason.trim()) {
      setError(t('creditsEditDialog.justificationRequiredLocked'));

      return;
    }

    const success = await onSave(credits, reason.trim() || undefined);

    if (success) {
      onClose();
    }
  }, [credits, reason, creditsLocked, validateCredits, onSave, onClose]);

  /**
   * Check if credits have changed
   */
  const hasChanged = credits !== currentCredits;

  /**
   * Check if save is allowed
   */
  const canSave = hasChanged && !error && !saving;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-award-line" />
          {t('creditsEditDialog.title')}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Module info */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('creditsEditDialog.module')}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Typography variant="body1" fontWeight="medium">
              {moduleName}
            </Typography>
            {creditsLocked && (
              <Chip label={t('creditsEditDialog.locked')} size="small" color="warning" icon={<i className="ri-lock-line" />} />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current vs New credits */}
        <Box display="flex" gap={4} mb={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t('creditsEditDialog.currentCredits')}
            </Typography>
            <Typography variant="h4" color="text.secondary">
              {currentCredits} ECTS
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="primary">
              {t('creditsEditDialog.newCredits')}
            </Typography>
            <Typography variant="h4" color="primary">
              {credits} ECTS
            </Typography>
          </Box>
          {hasChanged && (
            <Box display="flex" alignItems="center">
              <Chip
                label={credits > currentCredits ? `+${credits - currentCredits}` : credits - currentCredits}
                color={credits > currentCredits ? 'success' : 'error'}
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Credits slider */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            {t('creditsEditDialog.adjustCredits')}
          </Typography>
          <Slider
            value={credits}
            onChange={(_, value) => handleCreditsChange(value as number)}
            min={CREDITS_CONSTRAINTS.MIN}
            max={CREDITS_CONSTRAINTS.MAX}
            step={1}
            marks={creditsMarks}
            valueLabelDisplay="on"
          />
        </Box>

        {/* Manual input */}
        <Box mb={3}>
          <TextField
            label={t('creditsEditDialog.manualInput')}
            type="number"
            inputProps={{
              min: CREDITS_CONSTRAINTS.MIN,
              max: CREDITS_CONSTRAINTS.MAX,
              step: 1,
            }}
            value={credits}
            onChange={(e) => handleCreditsChange(parseInt(e.target.value) || 1)}
            error={!!error}
            helperText={error || `Min: ${CREDITS_CONSTRAINTS.MIN}, Max: ${CREDITS_CONSTRAINTS.MAX}`}
            fullWidth
            size="small"
          />
        </Box>

        {/* Semester recommendation */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{t('creditsEditDialog.recommendation')}:</strong> {t('creditsEditDialog.semesterRecommendation', { credits: CREDITS_CONSTRAINTS.SEMESTER_RECOMMENDED })}
          </Typography>
        </Alert>

        {/* Reason (required if locked) */}
        {creditsLocked && (
          <Box mb={3}>
            <TextField
              label={t('creditsEditDialog.justificationLabel')}
              multiline
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              placeholder={t('creditsEditDialog.justificationPlaceholder')}
              helperText={t('creditsEditDialog.justificationHelperText')}
            />
          </Box>
        )}

        {/* Warning about recalculation */}
        {hasChanged && (
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>{t('common.warning')}:</strong> {t('creditsEditDialog.recalculationWarning')}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave}
          startIcon={saving ? <CircularProgress size={16} /> : <i className="ri-save-line" />}
        >
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
