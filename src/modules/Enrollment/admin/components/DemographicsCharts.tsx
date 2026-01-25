/**
 * Demographics Charts Component
 * Displays demographic analysis charts (age, gender, geographic, bac origin)
 */

'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import Chart from '@/libs/ApexCharts';
import type { ApexOptions } from 'apexcharts';
import type { DemographicAnalysis } from '../../types/statistics.types';

interface DemographicsChartsProps {
  demographics: DemographicAnalysis | null;
  loading?: boolean;
}

const GENDER_COLORS: Record<string, { color: string; label: string; icon: string }> = {
  M: { color: '#1976d2', label: 'Hommes', icon: 'ri-men-line' },
  m: { color: '#1976d2', label: 'Hommes', icon: 'ri-men-line' },
  male: { color: '#1976d2', label: 'Hommes', icon: 'ri-men-line' },
  homme: { color: '#1976d2', label: 'Hommes', icon: 'ri-men-line' },
  masculin: { color: '#1976d2', label: 'Hommes', icon: 'ri-men-line' },
  '1': { color: '#1976d2', label: 'Hommes', icon: 'ri-men-line' },
  F: { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  f: { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  female: { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  femme: { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  feminin: { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  'féminin': { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  '2': { color: '#e91e63', label: 'Femmes', icon: 'ri-women-line' },
  O: { color: '#9e9e9e', label: 'Autre', icon: 'ri-user-line' },
  o: { color: '#9e9e9e', label: 'Autre', icon: 'ri-user-line' },
  other: { color: '#9e9e9e', label: 'Autre', icon: 'ri-user-line' },
  autre: { color: '#9e9e9e', label: 'Autre', icon: 'ri-user-line' },
};

const AGE_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

export const DemographicsCharts: React.FC<DemographicsChartsProps> = ({
  demographics,
  loading = false,
}) => {
  const theme = useTheme();

  // Gender distribution
  const genderData = useMemo(() => {
    if (!demographics?.gender_distribution) return [];
    const total = Object.values(demographics.gender_distribution).reduce((sum, val) => sum + val, 0);
    return Object.entries(demographics.gender_distribution).map(([key, value]) => ({
      key,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      ...GENDER_COLORS[key] || { color: '#9e9e9e', label: key, icon: 'ri-user-line' },
    }));
  }, [demographics?.gender_distribution]);

  // Age distribution
  const ageData = useMemo(() => {
    if (!demographics?.age_distribution) return [];
    const entries = Object.entries(demographics.age_distribution);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    return entries.map(([range, count], index) => ({
      range,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: AGE_COLORS[index % AGE_COLORS.length],
    }));
  }, [demographics?.age_distribution]);

  // Geographic distribution (top 10)
  const geoData = useMemo(() => {
    if (!demographics?.geographic_distribution) return [];
    const entries = Object.entries(demographics.geographic_distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    return entries.map(([location, count]) => ({
      location,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [demographics?.geographic_distribution]);

  // Bac origin distribution
  const bacData = useMemo(() => {
    if (!demographics?.origin_bac_distribution) return [];
    const entries = Object.entries(demographics.origin_bac_distribution)
      .sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    return entries.map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [demographics?.origin_bac_distribution]);

  // Filter out zero values for pie chart to avoid display issues
  const nonZeroGenderData = useMemo(() => genderData.filter((g) => g.value > 0), [genderData]);

  // Gender pie chart options - uses nonZeroGenderData for labels/colors
  const genderChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'pie',
      fontFamily: theme.typography.fontFamily,
    },
    labels: nonZeroGenderData.map((g) => g.label),
    colors: nonZeroGenderData.map((g) => g.color),
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: theme.palette.text.primary,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val != null ? `${val.toFixed(1)}%` : '0%',
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => val != null ? `${val.toLocaleString()} étudiants` : '0 étudiants',
      },
    },
  }), [nonZeroGenderData, theme]);

  const genderChartSeries = useMemo(() => nonZeroGenderData.map((g) => g.value), [nonZeroGenderData]);

  // Age bar chart options
  const ageChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
      },
    },
    colors: AGE_COLORS,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val != null ? val.toLocaleString() : '0',
      style: {
        fontSize: '11px',
      },
    },
    xaxis: {
      categories: ageData.map((a) => a.range),
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => val != null ? `${val.toLocaleString()} étudiants` : '0 étudiants',
      },
    },
    legend: { show: false },
  }), [ageData, theme]);

  const ageChartSeries = useMemo(() => [{
    name: 'Étudiants',
    data: ageData.map((a) => a.count),
  }], [ageData]);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!demographics) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary">Aucune donnée démographique disponible</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Gender Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Répartition par Genre
            </Typography>
            {nonZeroGenderData.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chart type="pie" height={250} options={genderChartOptions} series={genderChartSeries} />
              </Box>
            ) : (
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Age Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Répartition par Tranche d'Âge
            </Typography>
            {ageData.length > 0 ? (
              <Chart type="bar" height={250} options={ageChartOptions} series={ageChartSeries} />
            ) : (
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Geographic Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Origine Géographique (Top 10)
            </Typography>
            {geoData.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {geoData.map((geo, index) => (
                  <Box key={geo.location} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        {index + 1}. {geo.location || 'Non renseigné'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={geo.count.toLocaleString()} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          ({geo.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={geo.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: `hsl(${200 + index * 15}, 70%, 50%)`,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Bac Origin Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Type de Baccalauréat
            </Typography>
            {bacData.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {bacData.map((bac, index) => (
                  <Box key={bac.type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        {bac.type || 'Non renseigné'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={bac.count.toLocaleString()} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          ({bac.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={bac.percentage}
                      color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'inherit'}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
