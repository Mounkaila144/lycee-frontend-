/**
 * Programs By Type Chart Component - Simple pie chart representation
 */

'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface ProgramsByTypeChartProps {
  data: Record<string, number>;
}

const COLORS: Record<string, string> = {
  Licence: '#1976d2',
  Master: '#2e7d32',
  Doctorat: '#ed6c02',
};

export const ProgramsByTypeChart: React.FC<ProgramsByTypeChartProps> = ({ data }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const types = Object.keys(data).sort();

  return (
    <Box>
      {/* Simple list representation */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {types.map((type) => {
          const value = data[type];
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = COLORS[type] || '#757575';

          return (
            <Box key={type}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: color,
                    }}
                  />
                  <Typography variant="body2">{type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={value} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${percentage}%`,
                    height: '100%',
                    bgcolor: color,
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight="medium">
            Total
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {total} filières
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
