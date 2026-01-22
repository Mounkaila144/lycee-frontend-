/**
 * Modules By Level Chart Component
 */

'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface ModulesByLevelChartProps {
  data: Record<string, number>;
}

export const ModulesByLevelChart: React.FC<ModulesByLevelChartProps> = ({ data }) => {
  const maxValue = Math.max(...Object.values(data));
  const levels = Object.keys(data).sort();

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 200, pt: 2 }}>
      {levels.map((level) => {
        const value = data[level];
        const heightPercent = (value / maxValue) * 100;

        return (
          <Box
            key={level}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" fontWeight="medium">
              {value}
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: `${heightPercent}%`,
                bgcolor: 'primary.main',
                borderRadius: 1,
                minHeight: 20,
              }}
            />
            <Typography variant="body2" fontWeight="medium">
              {level}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
