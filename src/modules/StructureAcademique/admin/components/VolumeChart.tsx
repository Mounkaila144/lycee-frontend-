/**
 * Volume Chart Component - Simple bar chart for CM/TD/TP
 */

'use client';

import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import type { VolumeDistribution } from '../../types/statistics.types';

interface VolumeChartProps {
  data: VolumeDistribution;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const items = [
    { label: 'CM (Cours Magistraux)', value: data.CM, color: '#1976d2' },
    { label: 'TD (Travaux Dirigés)', value: data.TD, color: '#2e7d32' },
    { label: 'TP (Travaux Pratiques)', value: data.TP, color: '#ed6c02' },
  ];

  return (
    <Box>
      {items.map((item) => (
        <Box key={item.label} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="body2" fontWeight="medium">
              {item.value.hours}h ({item.value.percentage.toFixed(1)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={item.value.percentage}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: item.color,
              },
            }}
          />
        </Box>
      ))}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight="medium">
            Total
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {data.total}h
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
