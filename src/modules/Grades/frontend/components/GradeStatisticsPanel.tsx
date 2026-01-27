'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import type { GradeStatistics, GradeDistribution } from '../../types/grade.types';

/**
 * Props for GradeStatisticsPanel
 */
interface GradeStatisticsPanelProps {
  statistics: GradeStatistics | null;
  completionStatus: {
    total: number;
    entered: number;
    missing: number;
    absent: number;
    percentage: number;
    isComplete: boolean;
  };
  loading?: boolean;
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'primary',
  subtitle,
}) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: `${color}.lighter`,
      textAlign: 'center',
    }}
  >
    {icon && (
      <Box sx={{ mb: 0.5, color: `${color}.main` }}>
        {icon}
      </Box>
    )}
    <Typography variant="h5" fontWeight="bold" color={`${color}.main`}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    {subtitle && (
      <Typography variant="caption" display="block" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

/**
 * Distribution Bar Component
 */
interface DistributionBarProps {
  distribution: GradeDistribution;
  total: number;
}

const DistributionBar: React.FC<DistributionBarProps> = ({ distribution, total }) => {
  const ranges: (keyof GradeDistribution)[] = ['0-5', '5-10', '10-15', '15-20'];
  const colors = ['#f44336', '#ff9800', '#4caf50', '#2196f3'];
  const labels = ['0-5', '5-10', '10-15', '15-20'];

  if (total === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Pas de données pour l'histogramme
      </Typography>
    );
  }

  return (
    <Box>
      {/* Histogram bars */}
      <Box display="flex" alignItems="flex-end" height={80} gap={0.5} mb={1}>
        {ranges.map((range, index) => {
          const count = distribution[range] ?? 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const height = percentage > 0 ? Math.max(percentage, 5) : 0;

          return (
            <Tooltip
              key={range}
              title={`${range}: ${count} étudiant(s) (${percentage.toFixed(1)}%)`}
            >
              <Box
                sx={{
                  flex: 1,
                  height: `${height}%`,
                  bgcolor: colors[index],
                  borderRadius: '4px 4px 0 0',
                  minHeight: count > 0 ? 4 : 0,
                  transition: 'height 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      {/* Labels */}
      <Box display="flex" gap={0.5}>
        {labels.map((label) => (
          <Box key={label} flex={1} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box display="flex" justifyContent="center" gap={2} mt={1}>
        {ranges.map((range, index) => (
          <Box key={range} display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: colors[index],
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption">
              {distribution[range]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/**
 * Loading skeleton
 */
const StatisticsSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width={120} height={24} />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Helper function to safely convert value to number
 */
const toNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
};

/**
 * Helper function to format number with fallback
 */
const formatNumber = (value: any, decimals: number = 2): string => {
  const num = toNumber(value);
  return num !== null ? num.toFixed(decimals) : '-';
};

/**
 * GradeStatisticsPanel Component
 * Displays grade statistics and distribution histogram
 */
export const GradeStatisticsPanel: React.FC<GradeStatisticsPanelProps> = ({
  statistics,
  completionStatus,
  loading = false,
}) => {
  if (loading) {
    return <StatisticsSkeleton />;
  }

  return (
    <Card>
      <CardContent>
        {/* Completion Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              Progression de la saisie
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {completionStatus.isComplete ? (
                <i className="ri-checkbox-circle-fill" style={{ color: '#4caf50' }} />
              ) : (
                <i className="ri-error-warning-fill" style={{ color: '#ff9800' }} />
              )}
              <Typography variant="body2" fontWeight="medium">
                {completionStatus.percentage}%
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionStatus.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: completionStatus.isComplete ? 'success.main' : 'warning.main',
              },
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={0.5}>
            <Typography variant="caption" color="text.secondary">
              {completionStatus.entered} saisies / {completionStatus.total} total
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completionStatus.missing} manquantes | {completionStatus.absent} absents
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Statistics */}
        {statistics ? (
          <>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Statistiques
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard
                  label="Moyenne"
                  value={formatNumber(statistics.average, 2)}
                  color={(toNumber(statistics.average) ?? 0) >= 10 ? 'success' : 'warning'}
                  icon={
                    (toNumber(statistics.average) ?? 0) >= 10 ? (
                      <i className="ri-arrow-up-line" />
                    ) : (
                      <i className="ri-arrow-down-line" />
                    )
                  }
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard
                  label="Médiane"
                  value={formatNumber(statistics.median, 2)}
                  color="info"
                  icon={<i className="ri-subtract-line" />}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard
                  label="Note Min"
                  value={formatNumber(statistics.min, 2)}
                  color="error"
                  icon={<i className="ri-arrow-down-line" />}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard
                  label="Note Max"
                  value={formatNumber(statistics.max, 2)}
                  color="success"
                  icon={<i className="ri-arrow-up-line" />}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard
                  label="Taux réussite"
                  value={formatNumber(statistics.pass_rate, 0) !== '-' ? `${formatNumber(statistics.pass_rate, 0)}%` : '-'}
                  color={(toNumber(statistics.pass_rate) ?? 0) >= 50 ? 'success' : 'error'}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <StatCard
                  label="Absents"
                  value={statistics.absent_count ?? 0}
                  color="warning"
                  icon={<i className="ri-user-unfollow-line" />}
                />
              </Grid>
            </Grid>

            {/* Distribution Histogram */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Distribution des notes
              </Typography>
              <DistributionBar
                distribution={statistics.distribution}
                total={statistics.count}
              />
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            Les statistiques seront disponibles après la saisie des notes.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
