'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';

import type { Conflict, AlternativeSlot } from '../../types';

interface ConflictAlertProps {
  conflicts: Conflict[];
  alternatives?: AlternativeSlot[];
}

const CONFLICT_LABELS: Record<string, string> = {
  teacher: 'Conflit Enseignant',
  room: 'Conflit Salle',
  group: 'Conflit Groupe',
  student: 'Conflit Étudiant',
};

export const ConflictAlert: React.FC<ConflictAlertProps> = ({ conflicts, alternatives }) => {
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (conflicts.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {conflicts.map((conflict, idx) => (
        <Alert
          key={idx}
          severity={conflict.severity === 'error' ? 'error' : 'warning'}
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {CONFLICT_LABELS[conflict.type] || 'Conflit'}
            </Typography>
            <Typography variant="body2">{conflict.message}</Typography>
            {conflict.conflicting_slot && (
              <Chip
                size="small"
                label={`${conflict.conflicting_slot.day_of_week} ${conflict.conflicting_slot.start_time}-${conflict.conflicting_slot.end_time} • ${conflict.conflicting_slot.module?.name || ''}`}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Alert>
      ))}

      {alternatives && alternatives.length > 0 && (
        <>
          <Button
            size="small"
            onClick={() => setShowAlternatives(!showAlternatives)}
            sx={{ mt: 1 }}
          >
            {showAlternatives ? 'Masquer' : 'Voir'} suggestions alternatives ({alternatives.length})
          </Button>
          <Collapse in={showAlternatives}>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {alternatives.map((alt, idx) => (
                <Chip
                  key={idx}
                  label={`${alt.day} ${alt.start}-${alt.end}`}
                  variant="outlined"
                  color="success"
                  clickable
                />
              ))}
            </Box>
          </Collapse>
        </>
      )}
    </Box>
  );
};
