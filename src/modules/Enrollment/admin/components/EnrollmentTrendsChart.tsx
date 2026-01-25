/**
 * Enrollment Trends Chart Component
 * Displays historical enrollment trends using ApexCharts
 */

'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Skeleton, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import Chart from '@/libs/ApexCharts';
import type { ApexOptions } from 'apexcharts';
import type { TrendDataPoint, MonthlyTrend } from '../../types/statistics.types';

interface EnrollmentTrendsChartProps {
  yearlyTrends?: TrendDataPoint[];
  monthlyTrends?: MonthlyTrend[];
  loading?: boolean;
  height?: number;
}

export const EnrollmentTrendsChart: React.FC<EnrollmentTrendsChartProps> = ({
  yearlyTrends = [],
  monthlyTrends = [],
  loading = false,
  height = 350,
}) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = React.useState<'yearly' | 'monthly'>('yearly');

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'yearly' | 'monthly' | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const yearlyChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: theme.typography.fontFamily,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: [theme.palette.primary.main],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val != null ? val.toLocaleString() : '0',
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: yearlyTrends.map((t) => t?.year?.toString() ?? ''),
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val != null ? val.toLocaleString() : '0',
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
        formatter: (val: number) => val != null ? `${val.toLocaleString()} inscriptions` : '0 inscriptions',
      },
    },
    markers: {
      size: 5,
      colors: [theme.palette.primary.main],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
  }), [yearlyTrends, theme]);

  const yearlySeries = useMemo(() => [{
    name: 'Inscriptions',
    data: yearlyTrends.map((t) => t?.count ?? 0),
  }], [yearlyTrends]);

  const monthlyChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: theme.typography.fontFamily,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    colors: [theme.palette.success.main],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: monthlyTrends.map((t) => t?.month ?? ''),
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val != null ? val.toLocaleString() : '0',
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
        formatter: (val: number) => val != null ? `${val.toLocaleString()} inscriptions` : '0 inscriptions',
      },
    },
  }), [monthlyTrends, theme]);

  const monthlySeries = useMemo(() => [{
    name: 'Inscriptions',
    data: monthlyTrends.map((t) => t?.count ?? 0),
  }], [monthlyTrends]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  const hasYearlyData = yearlyTrends.length > 0;
  const hasMonthlyData = monthlyTrends.length > 0;

  if (!hasYearlyData && !hasMonthlyData) {
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="yearly" disabled={!hasYearlyData}>
            Annuel
          </ToggleButton>
          <ToggleButton value="monthly" disabled={!hasMonthlyData}>
            Mensuel
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'yearly' && hasYearlyData && (
        <Chart
          type="area"
          height={height}
          options={yearlyChartOptions}
          series={yearlySeries}
        />
      )}

      {viewMode === 'monthly' && hasMonthlyData && (
        <Chart
          type="bar"
          height={height}
          options={monthlyChartOptions}
          series={monthlySeries}
        />
      )}
    </Box>
  );
};
