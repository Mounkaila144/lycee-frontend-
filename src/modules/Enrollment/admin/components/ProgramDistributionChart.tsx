/**
 * Program Distribution Chart Component
 * Displays enrollment distribution by program using pie/donut chart
 */

'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  useTheme,
  Tooltip,
} from '@mui/material';
import Chart from '@/libs/ApexCharts';
import type { ApexOptions } from 'apexcharts';
import type { ProgramStats } from '../../types/statistics.types';

interface ProgramDistributionChartProps {
  programStats: ProgramStats[];
  loading?: boolean;
  showTable?: boolean;
  height?: number;
}

const CHART_COLORS = [
  '#1976d2', // primary blue
  '#2e7d32', // success green
  '#ed6c02', // warning orange
  '#9c27b0', // purple
  '#00bcd4', // cyan
  '#f44336', // error red
  '#ff9800', // amber
  '#607d8b', // blue grey
  '#8bc34a', // light green
  '#e91e63', // pink
];

export const ProgramDistributionChart: React.FC<ProgramDistributionChartProps> = ({
  programStats,
  loading = false,
  showTable = true,
  height = 350,
}) => {
  const theme = useTheme();

  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'donut',
      fontFamily: theme.typography.fontFamily,
    },
    labels: programStats.map((p) => p?.program?.name ?? 'N/A'),
    colors: CHART_COLORS.slice(0, programStats.length),
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: theme.palette.text.primary,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 700,
              formatter: (val: string) => parseInt(val).toLocaleString(),
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              color: theme.palette.text.secondary,
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => val != null ? `${val.toLocaleString()} étudiants` : '0 étudiants',
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 280,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  }), [programStats, theme]);

  const chartSeries = useMemo(() => programStats.map((p) => p?.total ?? 0), [programStats]);

  const totalEnrollments = useMemo(
    () => programStats.reduce((sum, p) => sum + p.total, 0),
    [programStats]
  );

  if (loading) {
    return (
      <Box>
        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mb: 2 }} />
        {showTable && (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        )}
      </Box>
    );
  }

  if (programStats.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  const getFillRateColor = (rate: number): 'success' | 'warning' | 'error' | 'default' => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    if (rate >= 50) return 'default';
    return 'error';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <i className="ri-arrow-up-line" style={{ color: '#4caf50' }} />;
    if (growth < 0) return <i className="ri-arrow-down-line" style={{ color: '#f44336' }} />;
    return <i className="ri-subtract-line" style={{ color: '#9e9e9e' }} />;
  };

  return (
    <Box>
      {/* Donut Chart */}
      <Chart type="donut" height={height} options={chartOptions} series={chartSeries} />

      {/* Programs Table */}
      {showTable && (
        <TableContainer sx={{ mt: 3, maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Programme</TableCell>
                <TableCell align="center">Effectif</TableCell>
                <TableCell align="center">H/F</TableCell>
                <TableCell align="center">Taux Remp.</TableCell>
                <TableCell align="center">Croissance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programStats.map((stat, index) => (
                <TableRow key={stat.program.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {stat.program.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.program.code}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {stat.total.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalEnrollments > 0
                        ? `${((stat.total / totalEnrollments) * 100).toFixed(1)}%`
                        : '0%'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`${stat.male} hommes / ${stat.female} femmes`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="info.main">
                          {stat.male}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">/</Typography>
                        <Typography variant="caption" color="secondary.main">
                          {stat.female}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {stat.capacity > 0 ? (
                      <Box sx={{ minWidth: 80 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">{stat.fill_rate.toFixed(0)}%</Typography>
                          <Chip
                            label={stat.total > stat.capacity ? 'Sureffectif' : stat.fill_rate < 80 ? 'Sous' : 'OK'}
                            size="small"
                            color={getFillRateColor(stat.fill_rate)}
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(stat.fill_rate, 100)}
                          color={getFillRateColor(stat.fill_rate)}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {getGrowthIcon(stat.growth_rate)}
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            stat.growth_rate > 0
                              ? 'success.main'
                              : stat.growth_rate < 0
                              ? 'error.main'
                              : 'text.secondary',
                        }}
                      >
                        {stat.growth_rate > 0 ? '+' : ''}{stat.growth_rate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
