'use client';

import React, { useEffect } from 'react';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { EXAM_SESSION_STATUS_LABELS, sessionLabel } from '../../types';
import type { ExamSession } from '../../types';
import { useExamSessions } from '../hooks';

interface ExamSessionPickerProps {
  value: number | null;
  onChange: (sessionId: number | null) => void;
  tenantId?: string;

  /** Exclure les sessions annulées (par défaut : oui) */
  hideCancelled?: boolean;

  /** Sélectionner automatiquement la première session de la liste */
  autoSelect?: boolean;
}

/**
 * Sélecteur de session d'examen (100 dernières sessions, plus récentes d'abord).
 */
export const ExamSessionPicker: React.FC<ExamSessionPickerProps> = ({
  value,
  onChange,
  tenantId,
  hideCancelled = true,
  autoSelect = true,
}) => {
  const { data, isLoading } = useExamSessions({ per_page: 100 }, tenantId);
  const sessions: ExamSession[] = (data?.data ?? []).filter(session => !hideCancelled || session.status !== 'cancelled');

  useEffect(() => {
    if (autoSelect && value === null && sessions.length > 0) {
      onChange(sessions[0].id);
    }
  }, [autoSelect, value, sessions, onChange]);

  return (
    <TextField
      select
      fullWidth
      size="small"
      label="Session d'examen"
      value={value ?? ''}
      disabled={isLoading}
      onChange={event => onChange(event.target.value ? Number(event.target.value) : null)}
      helperText={!isLoading && sessions.length === 0 ? 'Aucune session : créez-en une dans Planification.' : ' '}
    >
      {sessions.map(session => (
        <MenuItem key={session.id} value={session.id}>
          {sessionLabel(session)} ({EXAM_SESSION_STATUS_LABELS[session.status] ?? session.status})
        </MenuItem>
      ))}
    </TextField>
  );
};
