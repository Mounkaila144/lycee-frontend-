'use client';

import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';

import { SemesterSelector } from './SemesterSelector';
import { EctsCreditsTable } from './EctsCreditsTable';
import { useEctsManagement } from '../hooks/useEctsManagement';

/**
 * EctsDashboard Component
 * Main page for ECTS credits tracking and management
 */
export const EctsDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');

  const {
    results,
    ectsStatistics,
    studentSummary,
    studentAllocations,
    loading,
    statsLoading,
    studentLoading,
    error,
    fetchStudentSummary,
    clearStudentDetail,
    refresh,
  } = useEctsManagement(selectedSemesterId);

  const handleViewStudent = useCallback(
    (studentId: number) => {
      const student = results.find((r: any) => r.student_id === studentId);
      const name = student?.student?.full_name || `${student?.student?.firstname || ''} ${student?.student?.lastname || ''}`.trim() || 'Étudiant';

      setSelectedStudentName(name);
      setStudentDetailOpen(true);
      fetchStudentSummary(studentId);
    },
    [results, fetchStudentSummary]
  );

  const handleCloseDetail = useCallback(() => {
    setStudentDetailOpen(false);
    clearStudentDetail();
  }, [clearStudentDetail]);

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/admin" underline="hover" color="inherit">
            Administration
          </Link>
          <Link href="/admin/grades" underline="hover" color="inherit">
            Notes & Évaluations
          </Link>
          <Typography color="text.primary">Crédits ECTS</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Crédits ECTS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Suivez l'acquisition des crédits ECTS par étudiant et par semestre.
        </Typography>
      </Box>

      {/* Semester selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <i className="ri-filter-line" style={{ marginRight: 8 }} />
            Sélection du semestre
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SemesterSelector
                selectedSemesterId={selectedSemesterId}
                onSemesterChange={setSelectedSemesterId}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* No semester selected */}
      {!selectedSemesterId && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un semestre pour voir les crédits ECTS.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={refresh}>Réessayer</Button>}>
          {error.message}
        </Alert>
      )}

      {selectedSemesterId && (
        <>
          {/* ECTS Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Statistiques ECTS"
              action={
                <Tooltip title="Rafraîchir">
                  <IconButton onClick={refresh}>
                    <i className="ri-refresh-line" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {statsLoading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : ectsStatistics ? (
                <Grid container spacing={3}>
                  {/* Total students */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Étudiants
                      </Typography>
                      <Typography variant="h3" color="primary.main">
                        {ectsStatistics.total_students}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Avg credits acquired */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Moy. crédits acquis
                      </Typography>
                      <Typography variant="h3" color="success.main">
                        {ectsStatistics.avg_credits_acquired?.toFixed(1) ?? 0}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Avg success rate */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Taux de réussite moyen
                      </Typography>
                      <Typography variant="h3" color="info.main">
                        {ectsStatistics.avg_success_rate?.toFixed(1) ?? 0}%
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Credit distribution summary */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'warning.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Distribution
                      </Typography>
                      {ectsStatistics.distribution ? (
                        <Box mt={1}>
                          {Object.entries(ectsStatistics.distribution).slice(0, 3).map(([range, count]) => (
                            <Typography key={range} variant="caption" display="block">
                              {range}: {count}
                            </Typography>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="h4" color="warning.main">-</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Aucune statistique ECTS disponible.</Alert>
              )}
            </CardContent>
          </Card>

          {/* Credits per student table */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Crédits par étudiant</Typography>
                  {results.length > 0 && (
                    <Chip label={`${results.length} étudiants`} size="small" variant="outlined" />
                  )}
                </Box>
              }
              subheader="Détail des crédits ECTS acquis, compensés et manquants"
            />
            <Divider />
            <CardContent>
              <EctsCreditsTable
                results={results}
                loading={loading}
                onViewStudent={handleViewStudent}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Student detail dialog */}
      <Dialog open={studentDetailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          Détail ECTS - {selectedStudentName}
        </DialogTitle>
        <DialogContent>
          {studentLoading ? (
            <Box py={3}>
              <Skeleton variant="rectangular" height={200} />
            </Box>
          ) : studentSummary ? (
            <Box sx={{ pt: 1 }}>
              {/* Total credits */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Total crédits: <strong>{studentSummary.total_credits}</strong>
                </Typography>
              </Box>

              {/* Credits by semester */}
              {studentSummary.semesters?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Crédits par semestre
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Semestre</TableCell>
                          <TableCell align="center">Crédits acquis</TableCell>
                          <TableCell align="center">Validés</TableCell>
                          <TableCell align="center">Compensés</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(studentSummary.semesters ?? []).map((sem) => (
                          <TableRow key={sem.semester_id}>
                            <TableCell>{sem.semester_name}</TableCell>
                            <TableCell align="center">
                              <Typography fontWeight={600} color="primary.main">
                                {sem.credits_acquired}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={sem.validated_count} size="small" color="success" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">
                              {sem.compensated_count > 0 ? (
                                <Chip label={sem.compensated_count} size="small" color="warning" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.disabled">0</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Equivalences */}
              {studentSummary.equivalences?.credits > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Équivalences ({studentSummary.equivalences.credits} crédits)
                  </Typography>
                  {(studentSummary.equivalences?.modules ?? []).map((mod) => (
                    <Chip
                      key={mod.module_id}
                      label={`${mod.module_name}: ${mod.credits} ECTS`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}

              {/* Progression by level */}
              {studentSummary.progression && Object.keys(studentSummary.progression).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Progression par niveau
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(studentSummary.progression).map(([level, data]) => (
                      <Grid item xs={6} sm={4} key={level}>
                        <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle2" textAlign="center">
                            {level}
                          </Typography>
                          <Typography variant="h5" textAlign="center" color="primary.main">
                            {data.acquired}/{data.total}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(data.percentage, 100)}
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                            color={data.percentage >= 100 ? 'success' : data.percentage >= 70 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" textAlign="center" display="block" mt={0.5}>
                            {data.percentage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Semester allocations detail */}
              {studentAllocations.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Détail des allocations (semestre sélectionné)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Module</TableCell>
                          <TableCell align="center">Crédits</TableCell>
                          <TableCell align="center">Type</TableCell>
                          <TableCell>Note</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentAllocations.map((alloc) => (
                          <TableRow key={alloc.id}>
                            <TableCell>
                              {alloc.module ? `${alloc.module.code} - ${alloc.module.name}` : `Module #${alloc.module_id}`}
                            </TableCell>
                            <TableCell align="center">
                              <Typography fontWeight={600}>{alloc.credits_allocated}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={alloc.allocation_type_label || alloc.allocation_type}
                                size="small"
                                color={
                                  alloc.allocation_type === 'validated' ? 'success' :
                                  alloc.allocation_type === 'compensated' ? 'warning' : 'info'
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {alloc.note || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">Aucune donnée disponible.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
