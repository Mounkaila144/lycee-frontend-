/**
 * Stats Card Component
 */

'use client';

import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import type { ThemeColor } from '@core/types';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: ThemeColor;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.main`,
              color: 'white',
            }}
          >
            <i className={icon} style={{ fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
