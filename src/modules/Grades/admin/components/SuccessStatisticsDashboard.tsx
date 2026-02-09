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
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from '@/libs/Recharts';

import { SemesterSelector } from './SemesterSelector';
import { useStatistics } from '../hooks/useStatistics';

import type { ModuleStatistic } from '../../types/statistics.types';

const DISTRIBUTION_COLORS = ['#ef5350', '#ff9800', '#66bb6a', '#42a5f5', '#7e57c2', '#26c6da'];
const PIE_COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336'];

const getSuccessColor = (rate: number): 'error' | 'warning' | 'success' => {
  if (rate < 50) return 'error';
  if (rate < 70) return 'warning';

  return 'success';
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}> = ({ title, value, subtitle, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: color || 'text.primary', fontWeight: 'bold' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const SuccessStatisticsDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  const {
    globalStats,
    moduleStats,
    programComparison,
    distribution,
    evolution,
    loading,
    exporting,
    exportExcel,
  } = useStatistics(selectedSemesterId);

  const distributionData = distribution
    ? Object.entries(distribution).map(([range, count]) => ({ range, count }))
    : [];

  const programChartData = programComparison.map(p => ({
    name: p.program_name.length > 15 ? p.program_name.substring(0, 15) + '...' : p.program_name,
    fullName: p.program_name,
    success_rate: p.success_rate,
    average: p.average,
  }));

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/admin" underline="hover" color="inherit">Admin</Link>
        <Link href="/admin/grades" underline="hover" color="inherit">Notes</Link>
        <Typography color="text.primary">Statistiques de Réussite</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Statistiques de Réussite
        </Typography>
        <ButtonGroup size="small">
          <Button
            variant="outlined"
            onClick={exportExcel}
            disabled={!selectedSemesterId || exporting}
          >
            {exporting ? 'Export...' : 'Export Excel'}
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
              Sélectionnez un semestre pour afficher les statistiques
            </Typography>
          </CardContent>
        </Card>
      )}

      {selectedSemesterId && globalStats && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Taux de Réussite"
                value={`${globalStats.success_rate}%`}
                subtitle={`${globalStats.total_students} étudiants`}
                color={globalStats.success_rate >= 70 ? '#4caf50' : globalStats.success_rate >= 50 ? '#ff9800' : '#f44336'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Taux Compensation"
                value={`${globalStats.compensation_rate}%`}
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Taux Rattrapage"
                value={`${globalStats.retake_rate}%`}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Moyenne Classe"
                value={`${globalStats.class_average}/20`}
                subtitle={`ECTS moyen: ${globalStats.average_ects}`}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Module Statistics Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiques par Module
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Module</TableCell>
                          <TableCell>Enseignant</TableCell>
                          <TableCell align="center">Effectif</TableCell>
                          <TableCell align="center">Moyenne Classe</TableCell>
                          <TableCell align="center">Taux Réussite</TableCell>
                          <TableCell align="center">Taux Échec</TableCell>
                          <TableCell align="center">Min / Max</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 7 }).map((_, j) => (
                                <TableCell key={j}><Skeleton /></TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : moduleStats.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography color="text.secondary" sx={{ py: 3 }}>
                                Aucune donnée disponible
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          moduleStats.map((mod: ModuleStatistic) => (
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
                              <TableCell align="center">{mod.total_students}</TableCell>
                              <TableCell align="center">
                                <Typography fontWeight="medium">
                                  {mod.class_average}/20
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${mod.success_rate}%`}
                                  size="small"
                                  color={getSuccessColor(mod.success_rate)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography color="error.main">
                                  {mod.failure_rate}%
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {mod.min_grade ?? '-'} / {mod.max_grade ?? '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Grade Distribution */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribution des Notes
                  </Typography>
                  {distributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={distributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" name="Étudiants">
                          {distributionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <Typography color="text.secondary">Aucune donnée</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Program Comparison */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comparaison par Filière
                  </Typography>
                  {programChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={programChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <RechartsTooltip
                          formatter={(value: number) => [`${value}%`, 'Taux Réussite']}
                        />
                        <Bar dataKey="success_rate" fill="#4caf50" name="Taux Réussite" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <Typography color="text.secondary">Aucune donnée</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Semester Evolution */}
            {evolution.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Évolution par Semestre
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={evolution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester_name" />
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
                          name="Moyenne Classe (/20)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Summary Stats */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Répartition Globale
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Admis', value: globalStats.success_rate },
                          { name: 'Rattrapage', value: globalStats.retake_rate },
                          { name: 'Compensé', value: globalStats.compensation_rate },
                          { name: 'Ajourné', value: globalStats.failure_rate },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {PIE_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Program Comparison Table */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Détail par Filière
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Filière</TableCell>
                          <TableCell align="center">Effectif</TableCell>
                          <TableCell align="center">Moyenne</TableCell>
                          <TableCell align="center">Taux Réussite</TableCell>
                          <TableCell align="center">ECTS Moyen</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {programComparison.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography color="text.secondary" sx={{ py: 2 }}>
                                Aucune donnée
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          programComparison.map((prog) => (
                            <TableRow key={prog.program_id} hover>
                              <TableCell>{prog.program_name}</TableCell>
                              <TableCell align="center">{prog.total_students}</TableCell>
                              <TableCell align="center">{prog.average}/20</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${prog.success_rate}%`}
                                  size="small"
                                  color={getSuccessColor(prog.success_rate)}
                                />
                              </TableCell>
                              <TableCell align="center">{prog.avg_credits}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
