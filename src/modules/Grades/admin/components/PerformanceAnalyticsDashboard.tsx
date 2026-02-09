'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
} from '@/libs/Recharts';

import { SemesterSelector } from './SemesterSelector';
import { useAnalytics } from '../hooks/useAnalytics';

import type { WeakModule, AtRiskStudent, CohortSegment } from '../../types/analytics.types';

const COHORT_COLORS: Record<string, string> = {
  excellent: '#4caf50',
  good: '#8bc34a',
  average: '#ff9800',
  weak: '#ff5722',
  failing: '#f44336',
};

const KPICard: React.FC<{
  title: string;
  value: string | number;
  trend?: number;
  color?: string;
  alert?: boolean;
}> = ({ title, value, trend, color, alert }) => (
  <Card sx={{ height: '100%', borderLeft: alert ? '4px solid #f44336' : undefined }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="h4" sx={{ color: color || 'text.primary', fontWeight: 'bold' }}>
          {value}
        </Typography>
        {trend !== undefined && trend !== 0 && (
          <Typography
            variant="body2"
            sx={{ color: trend > 0 ? '#4caf50' : '#f44336' }}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const getRiskColor = (score: number): string => {
  if (score >= 80) return '#f44336';
  if (score >= 60) return '#ff9800';

  return '#ff5722';
};

export const PerformanceAnalyticsDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  const {
    kpis,
    weakModules,
    cohortAnalysis,
    atRiskStudents,
    correlations,
    historicalData,
    loading,
    exporting,
    activeTab,
    setActiveTab,
    exportReport,
  } = useAnalytics(selectedSemesterId);

  const cohortChartData = cohortAnalysis
    ? Object.entries(cohortAnalysis).map(([key, segment]) => ({
        name: (segment as CohortSegment).label || key,
        count: (segment as CohortSegment).count,
        percentage: (segment as CohortSegment).percentage,
        color: COHORT_COLORS[key] || '#9e9e9e',
      }))
    : [];

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/admin" underline="hover" color="inherit">Admin</Link>
        <Link href="/admin/grades" underline="hover" color="inherit">Notes</Link>
        <Typography color="text.primary">Analyses de Performance</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Analyses de Performance
        </Typography>
        <ButtonGroup size="small">
          <Button
            variant="outlined"
            onClick={() => exportReport('excel')}
            disabled={!selectedSemesterId || exporting}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            onClick={() => exportReport('pdf')}
            disabled={!selectedSemesterId || exporting}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            onClick={() => exportReport('csv')}
            disabled={!selectedSemesterId || exporting}
          >
            CSV
          </Button>
        </ButtonGroup>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <SemesterSelector
                selectedSemesterId={selectedSemesterId}
                onSemesterChange={setSelectedSemesterId}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!selectedSemesterId && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Sélectionnez un semestre pour afficher les analyses
            </Typography>
          </CardContent>
        </Card>
      )}

      {selectedSemesterId && kpis && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Taux de Réussite"
                value={`${kpis.success_rate}%`}
                trend={kpis.success_rate_trend}
                color={kpis.success_rate >= 70 ? '#4caf50' : kpis.success_rate >= 50 ? '#ff9800' : '#f44336'}
                alert={kpis.success_rate < 60}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Moyenne Promotion"
                value={`${kpis.class_average}/20`}
                trend={kpis.class_average_trend}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Modules Critiques"
                value={kpis.critical_modules_count}
                color={kpis.critical_modules_count > 0 ? '#f44336' : '#4caf50'}
                alert={kpis.critical_modules_count > 0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Taux Abandon"
                value={`${kpis.dropout_rate}%`}
                color={kpis.dropout_rate > 10 ? '#f44336' : '#ff9800'}
              />
            </Grid>
          </Grid>

          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
            <Tab label="Vue d'ensemble" />
            <Tab label="Modules Faibles" />
            <Tab label="Cohortes" />
            <Tab label="Étudiants à Risque" />
            <Tab label="Historique" />
          </Tabs>

          {/* Tab 0: Overview */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Cohort Distribution */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Segmentation Étudiants
                    </Typography>
                    {cohortChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={cohortChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            dataKey="count"
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                          >
                            {cohortChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography color="text.secondary">Aucune donnée</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Résumé Rapide
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Effectif total</Typography>
                        <Typography fontWeight="bold">{kpis.total_students}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={kpis.success_rate}
                        sx={{ height: 10, borderRadius: 5 }}
                        color={kpis.success_rate >= 70 ? 'success' : kpis.success_rate >= 50 ? 'warning' : 'error'}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Taux d'absentéisme</Typography>
                        <Typography fontWeight="bold" color={kpis.absence_rate > 15 ? 'error.main' : 'text.primary'}>
                          {kpis.absence_rate}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Modules critiques</Typography>
                        <Chip
                          label={kpis.critical_modules_count}
                          size="small"
                          color={kpis.critical_modules_count > 0 ? 'error' : 'success'}
                        />
                      </Box>
                      {kpis.critical_modules_count > 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          {kpis.critical_modules_count} module(s) avec un taux d&apos;échec supérieur à 50%
                        </Alert>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Weak Modules */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Modules Critiques ({weakModules.length})
                </Typography>
                {weakModules.length === 0 ? (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Aucun module critique identifié. Tous les modules ont un taux d&apos;échec inférieur à 50%.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Module</TableCell>
                          <TableCell>Enseignant</TableCell>
                          <TableCell align="center">Taux Échec</TableCell>
                          <TableCell align="center">Moyenne</TableCell>
                          <TableCell align="center">Écart-type</TableCell>
                          <TableCell align="center">Effectif</TableCell>
                          <TableCell>Recommandation</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {weakModules.map((mod: WeakModule) => (
                          <TableRow key={mod.module_id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {mod.module_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {mod.module_code}
                              </Typography>
                            </TableCell>
                            <TableCell>{mod.teacher_name}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${mod.failure_rate}%`}
                                size="small"
                                color="error"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography color={mod.average < 10 ? 'error.main' : 'text.primary'}>
                                {mod.average}/20
                              </Typography>
                            </TableCell>
                            <TableCell align="center">{mod.std_dev}</TableCell>
                            <TableCell align="center">{mod.total_students}</TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {mod.recommendation}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab 2: Cohort Analysis */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Analyse par Cohortes
                    </Typography>
                    {cohortChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={cohortChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="count" name="Étudiants">
                            {cohortChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                        <Typography color="text.secondary">Aucune donnée disponible</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Cohort Detail Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Détail des Cohortes
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Segment</TableCell>
                          <TableCell>Plage de Moyennes</TableCell>
                          <TableCell align="center">Nombre</TableCell>
                          <TableCell align="center">Pourcentage</TableCell>
                          <TableCell>Répartition</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cohortChartData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography color="text.secondary" sx={{ py: 2 }}>Aucune donnée</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          cohortChartData.map((segment) => (
                            <TableRow key={segment.name}>
                              <TableCell>
                                <Chip
                                  label={segment.name}
                                  size="small"
                                  sx={{ backgroundColor: segment.color, color: '#fff' }}
                                />
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell align="center">{segment.count}</TableCell>
                              <TableCell align="center">{segment.percentage}%</TableCell>
                              <TableCell sx={{ width: '30%' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={segment.percentage}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: segment.color,
                                    },
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: At-Risk Students */}
          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Étudiants à Risque ({atRiskStudents.length})
                  </Typography>
                  {atRiskStudents.length > 0 && (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      {atRiskStudents.length} étudiant(s) identifié(s) avec un risque élevé d&apos;échec
                    </Alert>
                  )}
                </Box>
                {atRiskStudents.length === 0 ? (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Aucun étudiant à risque identifié (seuil: 70%)
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Étudiant</TableCell>
                          <TableCell>Matricule</TableCell>
                          <TableCell align="center">Score Risque</TableCell>
                          <TableCell align="center">Moy. CC</TableCell>
                          <TableCell align="center">Taux Absence</TableCell>
                          <TableCell align="center">Modules Échoués</TableCell>
                          <TableCell>Facteurs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {atRiskStudents.map((student: AtRiskStudent) => (
                          <TableRow key={student.student_id} hover>
                            <TableCell>
                              <Typography fontWeight="medium">{student.full_name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {student.matricule}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${student.risk_score}%`}
                                size="small"
                                sx={{
                                  backgroundColor: getRiskColor(student.risk_score),
                                  color: '#fff',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography color={student.cc_average !== null && student.cc_average < 10 ? 'error.main' : 'text.primary'}>
                                {student.cc_average !== null ? `${student.cc_average}/20` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography color={student.absence_rate > 20 ? 'error.main' : 'text.primary'}>
                                {student.absence_rate}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">{student.failing_modules_count}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {student.risk_factors.map((factor, i) => (
                                  <Chip key={i} label={factor} size="small" variant="outlined" color="warning" />
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab 4: Historical Comparison */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Évolution Historique
                    </Typography>
                    {historicalData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis yAxisId="left" domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 20]} />
                          <RechartsTooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="success_rate"
                            stroke="#4caf50"
                            name="Taux Réussite (%)"
                            strokeWidth={2}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="class_average"
                            stroke="#2196f3"
                            name="Moyenne (/20)"
                            strokeWidth={2}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="dropout_rate"
                            stroke="#f44336"
                            name="Taux Abandon (%)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                        <Typography color="text.secondary">Aucune donnée historique disponible</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Historical Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Données Historiques
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Année</TableCell>
                          <TableCell>Semestre</TableCell>
                          <TableCell align="center">Effectif</TableCell>
                          <TableCell align="center">Taux Réussite</TableCell>
                          <TableCell align="center">Moyenne</TableCell>
                          <TableCell align="center">Taux Abandon</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {historicalData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography color="text.secondary" sx={{ py: 2 }}>Aucune donnée</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          historicalData.map((row, index) => (
                            <TableRow key={index} hover>
                              <TableCell>{row.year}</TableCell>
                              <TableCell>{row.semester_name}</TableCell>
                              <TableCell align="center">{row.total_students}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${row.success_rate}%`}
                                  size="small"
                                  color={row.success_rate >= 70 ? 'success' : row.success_rate >= 50 ? 'warning' : 'error'}
                                />
                              </TableCell>
                              <TableCell align="center">{row.class_average}/20</TableCell>
                              <TableCell align="center">{row.dropout_rate}%</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};
