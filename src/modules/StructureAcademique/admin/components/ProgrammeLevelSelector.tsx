'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import type { ProgrammeType } from '../../types/programme.types';
import type { ProgrammeLevel } from '../../types/programmeLevel.types';
import { getLevelsForProgramType, getLevelLabel, getLevelBadgeColor } from '../../types/programmeLevel.types';

interface ProgrammeLevelSelectorProps {
  programmeType: ProgrammeType;
  selectedLevels: ProgrammeLevel[];
  onChange: (levels: ProgrammeLevel[]) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Component for selecting programme levels with validation
 * Shows only levels compatible with the programme type
 */
export const ProgrammeLevelSelector: React.FC<ProgrammeLevelSelectorProps> = ({
  programmeType,
  selectedLevels,
  onChange,
  disabled = false,
  error,
}) => {
  const [availableLevels, setAvailableLevels] = useState<ProgrammeLevel[]>([]);

  // Update available levels when programme type changes
  useEffect(() => {
    const levels = getLevelsForProgramType(programmeType);
    setAvailableLevels(levels);

    // Clear selected levels if they're not compatible with new type
    const validSelectedLevels = selectedLevels.filter(level => levels.includes(level));
    if (validSelectedLevels.length !== selectedLevels.length) {
      onChange(validSelectedLevels);
    }
  }, [programmeType, selectedLevels, onChange]);

  const handleLevelToggle = (level: ProgrammeLevel) => {
    if (disabled) return;

    const isSelected = selectedLevels.includes(level);
    const newLevels = isSelected
      ? selectedLevels.filter(l => l !== level)
      : [...selectedLevels, level];

    onChange(newLevels);
  };

  if (availableLevels.length === 0) {
    return (
      <Alert severity="info">
        Aucun niveau prédéfini pour le type {programmeType}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Niveaux disponibles pour {programmeType}
      </Typography>

      <FormGroup row>
        {availableLevels.map((level) => (
          <FormControlLabel
            key={level}
            control={
              <Checkbox
                checked={selectedLevels.includes(level)}
                onChange={() => handleLevelToggle(level)}
                disabled={disabled}
                color={getLevelBadgeColor(level)}
              />
            }
            label={
              <Chip
                label={getLevelLabel(level)}
                size="small"
                color={getLevelBadgeColor(level)}
                variant={selectedLevels.includes(level) ? 'filled' : 'outlined'}
              />
            }
          />
        ))}
      </FormGroup>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {selectedLevels.length === 0 && !error && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Au moins un niveau est requis pour activer le programme
        </Alert>
      )}
    </Box>
  );
};
