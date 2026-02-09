'use client';

import React from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';

import type { RetakeGradeStatistics } from '../../types/retake.types';

interface RetakeStatisticsPanelProps {
  statistics: RetakeGradeStatistics | undefined;
  loading: boolean;
}

export const RetakeStatisticsPanel: React.FC<RetakeStatisticsPanelProps> = ({ statistics, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={6} sm={3} key={i}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!statistics) return null;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Étudiants</Typography>
            <Typography variant="h5" color="info.main">{statistics.total_students}</Typography>
            <Typography variant="caption" color="text.secondary">
              {statistics.graded} notés / {statistics.pending_entry} en attente
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Améliorations</Typography>
            <Typography variant="h5" color="success.main">{statistics.improvement_rate.toFixed(1)}%</Typography>
            <Typography variant="caption" color="text.secondary">
              {statistics.improved} étudiants améliorés
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'warning.lighter', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Réussite après rattrapage</Typography>
            <Typography variant="h5" color="warning.main">{statistics.pass_rate.toFixed(1)}%</Typography>
            <Typography variant="caption" color="text.secondary">
              {statistics.passed_after_retake} sur {statistics.total_students}
              {statistics.new_passes > 0 && (
                <Chip label={`+${statistics.new_passes} nouveaux`} size="small" color="success" sx={{ ml: 0.5 }} />
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Moy. rattrapage</Typography>
            <Typography variant="h5" color="primary.main">
              {statistics.average_retake_score?.toFixed(2) ?? '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Min: {statistics.min_retake_score?.toFixed(2) ?? '-'} / Max: {statistics.max_retake_score?.toFixed(2) ?? '-'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
