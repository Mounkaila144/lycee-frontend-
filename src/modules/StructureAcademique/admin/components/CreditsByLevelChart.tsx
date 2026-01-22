/**
 * Credits By Level Chart Component
 */

'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { CreditsByLevel } from '../../types/statistics.types';

interface CreditsByLevelChartProps {
  data: CreditsByLevel;
}

export const CreditsByLevelChart: React.FC<CreditsByLevelChartProps> = ({ data }) => {
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
                bgcolor: 'success.main',
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
