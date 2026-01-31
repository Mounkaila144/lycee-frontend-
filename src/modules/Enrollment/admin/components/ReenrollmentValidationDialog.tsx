'use client';

import { useTranslation } from '@/shared/i18n/use-translation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

import type { Reenrollment } from '../../types/reenrollment.types';

interface ReenrollmentValidationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reenrollment: Reenrollment | null;
}

/**
 * ReenrollmentValidationDialog Component
 * Dialog for confirming reenrollment validation
 */
export const ReenrollmentValidationDialog = ({
  open,
  onClose,
  onConfirm,
  reenrollment,
}: ReenrollmentValidationDialogProps) => {
  const { t } = useTranslation('Enrollment');
  if (!reenrollment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Validate Reenrollment')}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {t('You are about to validate the reenrollment of the following student:')}
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t('Student')}
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {reenrollment.student?.firstname} {reenrollment.student?.lastname}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {reenrollment.student?.matricule}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('Previous level')}
            </Typography>
            <Chip label={reenrollment.previous_level} size="small" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('Target level')}
            </Typography>
            <Chip
              label={reenrollment.target_level}
              size="small"
              color={reenrollment.is_redoing ? 'warning' : 'success'}
            />
          </Box>
        </Box>

        {reenrollment.is_redoing && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('This student is repeating their level.')}
          </Alert>
        )}

        {reenrollment.is_reorientation && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('This student is changing program (reorientation).')}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {t('This action will:')}
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>
              <Typography variant="body2">{t('Create a new pedagogical enrollment')}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t('Update the student level')}</Typography>
            </li>
            {reenrollment.personal_data_updates && Object.keys(reenrollment.personal_data_updates).length > 0 && (
              <li>
                <Typography variant="body2">{t('Apply personal information updates')}</Typography>
              </li>
            )}
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button variant="contained" color="success" onClick={onConfirm}>
          {t('Validate reenrollment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
