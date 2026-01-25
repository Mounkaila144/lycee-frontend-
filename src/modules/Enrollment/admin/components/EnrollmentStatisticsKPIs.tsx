/**
 * Enrollment Statistics KPIs Component
 * Displays key performance indicators for enrollment statistics
 */

'use client';

import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Skeleton, Tooltip } from '@mui/material';
import type { ThemeColor } from '@core/types';
import type { EnrollmentKPIs } from '../../types/statistics.types';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: ThemeColor;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  tooltip?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  tooltip,
}) => {
  const content = (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 0.5, fontWeight: 600 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <i
                  className={trend.isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}
                  style={{
                    color: trend.isPositive ? '#4caf50' : '#f44336',
                    marginRight: 4,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: trend.isPositive ? 'success.main' : 'error.main' }}
                >
                  {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            <i className={icon} style={{ fontSize: 28 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        {content}
      </Tooltip>
    );
  }

  return content;
};

interface EnrollmentStatisticsKPIsProps {
  kpis: EnrollmentKPIs | null;
  loading?: boolean;
}

export const EnrollmentStatisticsKPIs: React.FC<EnrollmentStatisticsKPIsProps> = ({
  kpis,
  loading = false,
}) => {
  if (loading || !kpis) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="80%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const conversionRate = kpis.rates?.conversion ?? 0;

  const kpiCards: KPICardProps[] = [
    {
      title: 'Total Étudiants',
      value: (kpis.total_students ?? 0).toLocaleString(),
      subtitle: 'Inscriptions administratives',
      icon: 'ri-user-add-line',
      color: 'primary',
      tooltip: 'Nombre total d\'étudiants inscrits',
    },
    {
      title: 'Étudiants Actifs',
      value: (kpis.active_students ?? 0).toLocaleString(),
      subtitle: 'Actuellement actifs',
      icon: 'ri-user-follow-line',
      color: 'success',
      tooltip: 'Étudiants avec inscription active',
    },
    {
      title: 'Nouveaux Étudiants',
      value: (kpis.new_students ?? 0).toLocaleString(),
      subtitle: 'Premières inscriptions',
      icon: 'ri-user-star-line',
      color: 'info',
      tooltip: 'Étudiants inscrits pour la première fois',
    },
    {
      title: 'Réinscriptions',
      value: (kpis.reenrollments ?? 0).toLocaleString(),
      subtitle: 'Étudiants existants',
      icon: 'ri-refresh-line',
      color: 'secondary',
      tooltip: 'Étudiants déjà inscrits les années précédentes',
    },
    {
      title: 'Inscriptions Péda.',
      value: (kpis.pedagogical?.validated ?? 0).toLocaleString(),
      subtitle: `${kpis.pedagogical?.pending ?? 0} en attente`,
      icon: 'ri-book-open-line',
      color: 'warning',
      tooltip: `Validées: ${kpis.pedagogical?.validated ?? 0} / Total: ${kpis.pedagogical?.total ?? 0}`,
    },
    {
      title: 'Taux de Conversion',
      value: `${conversionRate.toFixed(1)}%`,
      subtitle: 'Admin → Péda',
      icon: 'ri-percent-line',
      color: conversionRate >= 90 ? 'success' : conversionRate >= 70 ? 'warning' : 'error',
      tooltip: 'Pourcentage d\'étudiants ayant complété leur inscription pédagogique',
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpiCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <KPICard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};
