'use client';

import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import type { ProgrammeLevel } from '../../types/programmeLevel.types';
import { getLevelLabel, getLevelBadgeColor } from '../../types/programmeLevel.types';

interface ProgrammeLevelBadgesProps {
  levels: ProgrammeLevel[];
  size?: 'small' | 'medium';
  max?: number; // Maximum number of badges to show before "+X more"
}

/**
 * Component for displaying programme levels as colored badges
 * Licence levels: Blue, Master levels: Purple
 */
export const ProgrammeLevelBadges: React.FC<ProgrammeLevelBadgesProps> = ({
  levels,
  size = 'small',
  max,
}) => {
  if (levels.length === 0) {
    return (
      <Chip
        label="Aucun niveau"
        size={size}
        variant="outlined"
        color="default"
      />
    );
  }

  const visibleLevels = max ? levels.slice(0, max) : levels;
  const remainingCount = max && levels.length > max ? levels.length - max : 0;

  return (
    <Box display="flex" gap={0.5} flexWrap="wrap" alignItems="center">
      {visibleLevels.map((level) => (
        <Tooltip key={level} title={getLevelLabel(level)}>
          <Chip
            label={level}
            size={size}
            color={getLevelBadgeColor(level)}
            variant="filled"
          />
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <Tooltip title={levels.slice(max).map(getLevelLabel).join(', ')}>
          <Chip
            label={`+${remainingCount}`}
            size={size}
            variant="outlined"
            color="default"
          />
        </Tooltip>
      )}
    </Box>
  );
};
