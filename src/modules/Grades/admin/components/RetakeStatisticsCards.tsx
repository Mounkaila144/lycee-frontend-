'use client';

import React from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import type { RetakeStatistics } from '../../types/retake.types';

interface RetakeStatisticsCardsProps {
  statistics: RetakeStatistics | undefined;
  loading: boolean;
}

export const RetakeStatisticsCards: React.FC<RetakeStatisticsCardsProps> = ({ statistics, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={6} sm={3} key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!statistics) return null;

  const cards = [
    {
      label: 'Étudiants concernés',
      value: statistics.students_with_retakes,
      sub: `sur ${statistics.total_students} étudiants`,
      color: 'error.lighter',
      textColor: 'error.main',
    },
    {
      label: 'Taux de rattrapage',
      value: `${statistics.retake_rate.toFixed(1)}%`,
      sub: `${statistics.total_retakes} inscriptions`,
      color: 'warning.lighter',
      textColor: 'warning.main',
    },
    {
      label: 'Modules en rattrapage',
      value: statistics.most_failed_modules.length,
      sub: 'modules distincts',
      color: 'info.lighter',
      textColor: 'info.main',
    },
    {
      label: 'Module le plus raté',
      value: statistics.most_failed_modules[0]?.student_count ?? 0,
      sub: statistics.most_failed_modules[0]?.module_name ?? '-',
      color: 'primary.lighter',
      textColor: 'primary.main',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Box sx={{ p: 2, borderRadius: 1, backgroundColor: card.color, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h3" color={card.textColor}>
              {card.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {card.sub}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
