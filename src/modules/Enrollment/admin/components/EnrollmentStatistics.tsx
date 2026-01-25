/**
 * Enrollment Statistics Dashboard Component
 * Main dashboard for viewing enrollment statistics and generating reports
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Alert,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useEnrollmentStatistics, useEnrollmentAlerts } from '../hooks/useEnrollmentStatistics';
import { EnrollmentStatisticsKPIs } from './EnrollmentStatisticsKPIs';
import { EnrollmentTrendsChart } from './EnrollmentTrendsChart';
import { ProgramDistributionChart } from './ProgramDistributionChart';
import { DemographicsCharts } from './DemographicsCharts';
import { EnrollmentReportsDialog } from './EnrollmentReportsDialog';
import type { EnrollmentAlert } from '../../types/statistics.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const AlertSeverityIcon: Record<EnrollmentAlert['type'], string> = {
  warning: 'ri-alert-line',
  error: 'ri-error-warning-line',
  info: 'ri-information-line',
};

export const EnrollmentStatistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);

  const {
    kpis,
    programStats,
    trends,
    monthlyTrends,
    demographics,
    loading,
    kpisLoading,
    programStatsLoading,
    trendsLoading,
    monthlyTrendsLoading,
    demographicsLoading,
    refreshAll,
    generating,
    exporting,
    error,
    generateExecutiveSummary,
    generateDashboard,
    exportToExcel,
    clearCache,
  } = useEnrollmentStatistics();

  const { alerts, loading: alertsLoading } = useEnrollmentAlerts();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = async () => {
    await clearCache();
    refreshAll();
  };

  const criticalAlerts = alerts.filter((a) => a.type === 'error');
  const warningAlerts = alerts.filter((a) => a.type === 'warning');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Statistiques des Inscriptions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tableau de bord et analyses des inscriptions académiques
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {loading && <CircularProgress size={24} />}
          <Tooltip title="Actualiser les données">
            <span>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <i className="ri-refresh-line" />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<i className="ri-download-line" />}
            onClick={() => setReportsDialogOpen(true)}
          >
            Exporter
          </Button>
        </Box>
      </Box>

      {/* Alerts Section */}
      {!alertsLoading && alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <i className="ri-notification-line" style={{ fontSize: 20 }} />
            <Typography variant="subtitle2">
              Alertes ({alerts.length})
            </Typography>
            {criticalAlerts.length > 0 && (
              <Chip label={`${criticalAlerts.length} critique(s)`} size="small" color="error" />
            )}
            {warningAlerts.length > 0 && (
              <Chip label={`${warningAlerts.length} attention`} size="small" color="warning" />
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {alerts.slice(0, 3).map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                icon={<i className={AlertSeverityIcon[alert.type]} />}
                sx={{ py: 0.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{alert.message}</Typography>
                  {alert.program_name && (
                    <Chip label={alert.program_name} size="small" variant="outlined" />
                  )}
                </Box>
              </Alert>
            ))}
            {alerts.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                + {alerts.length - 3} autre(s) alerte(s)
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* KPIs Section */}
      <Box sx={{ mb: 4 }}>
        <EnrollmentStatisticsKPIs kpis={kpis} loading={kpisLoading} />
      </Box>

      {/* Tabs Navigation */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="statistics tabs">
            <Tab
              label="Vue d'ensemble"
              icon={<i className="ri-dashboard-line" style={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="Par Programme"
              icon={<i className="ri-book-open-line" style={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="Démographie"
              icon={<i className="ri-user-line" style={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label="Tendances"
              icon={<i className="ri-line-chart-line" style={{ fontSize: 18 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Trends Chart */}
              <Grid item xs={12} lg={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Évolution des Inscriptions
                    </Typography>
                    <EnrollmentTrendsChart
                      yearlyTrends={trends}
                      monthlyTrends={monthlyTrends}
                      loading={trendsLoading || monthlyTrendsLoading}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} lg={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Répartition par Genre
                    </Typography>
                    {demographics?.gender_distribution ? (
                      <Box sx={{ mt: 2 }}>
                        {Object.entries(demographics.gender_distribution).map(([gender, count]) => {
                          const total = Object.values(demographics.gender_distribution).reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          // Handle various possible gender key formats from API
                          const genderLower = gender.toLowerCase();
                          const isMale = genderLower === 'm' || genderLower === 'male' || genderLower === 'homme' || genderLower === 'masculin' || gender === '1';
                          const isFemale = genderLower === 'f' || genderLower === 'female' || genderLower === 'femme' || genderLower === 'feminin' || genderLower === 'féminin' || gender === '2';
                          const isOther = genderLower === 'o' || genderLower === 'other' || genderLower === 'autre';
                          const label = isMale ? 'Hommes' : isFemale ? 'Femmes' : isOther ? 'Autre' : (gender || 'Autre');
                          const color = isMale ? 'info' : isFemale ? 'secondary' : 'default';

                          return (
                            <Box key={gender} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">{label}</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {count.toLocaleString()} ({percentage.toFixed(1)}%)
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  height: 8,
                                  bgcolor: 'grey.200',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    bgcolor: `${color}.main`,
                                    transition: 'width 0.3s',
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : demographicsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={32} />
                      </Box>
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        Aucune donnée disponible
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Programs Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Statistiques par Programme
            </Typography>
            <ProgramDistributionChart
              programStats={programStats}
              loading={programStatsLoading}
              showTable
            />
          </TabPanel>

          {/* Demographics Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Analyses Démographiques
            </Typography>
            <DemographicsCharts demographics={demographics} loading={demographicsLoading} />
          </TabPanel>

          {/* Trends Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tendances Annuelles (5 dernières années)
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <EnrollmentTrendsChart
                      yearlyTrends={trends}
                      loading={trendsLoading}
                      height={400}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Évolution Mensuelle (Année en cours)
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <EnrollmentTrendsChart
                      monthlyTrends={monthlyTrends}
                      loading={monthlyTrendsLoading}
                      height={350}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Reports Dialog */}
      <EnrollmentReportsDialog
        open={reportsDialogOpen}
        onClose={() => setReportsDialogOpen(false)}
        onGenerateExecutiveSummary={generateExecutiveSummary}
        onGenerateDashboard={generateDashboard}
        onExportExcel={exportToExcel}
        generating={generating}
        exporting={exporting}
        error={error}
      />
    </Box>
  );
};
