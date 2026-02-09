'use client';

import React, { useState } from 'react';

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
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

import { SemesterSelector } from './SemesterSelector';
import { CompensationRulesForm } from './CompensationRulesForm';
import { CompensationSimulationTable } from './CompensationSimulationTable';
import { StudentCompensationDialog } from './StudentCompensationDialog';
import { useCompensation } from '../hooks/useCompensation';

/**
 * CompensationDashboard Component
 * Main page for compensation rules, simulation and application
 */
export const CompensationDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');

  const {
    rules,
    simulation,
    statistics,
    rulesLoading,
    simulating,
    applying,
    statsLoading,
    error,
    successMessage,
    updateRules,
    simulate,
    applyBulk,
    applyForStudent,
    removeCompensation,
    getCompensableModules,
    dismissMessage,
  } = useCompensation(selectedSemesterId);

  const handleViewDetails = (studentId: number) => {
    const student = simulation?.students.find(s => s.student_id === studentId);

    setSelectedStudentId(studentId);
    setSelectedStudentName(student?.student_name || '');
    setDialogOpen(true);
  };

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
          <Typography color="text.primary">Compensation</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Règles de compensation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configurez les règles de compensation, simulez et appliquez la compensation par semestre.
        </Typography>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={dismissMessage}>
          {error.message}
        </Alert>
      )}

      {/* Rules card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Configuration des règles" />
        <Divider />
        <CardContent>
          <CompensationRulesForm
            rules={rules}
            loading={rulesLoading}
            onSave={updateRules}
          />
        </CardContent>
      </Card>

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

      {!selectedSemesterId && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un semestre pour simuler et appliquer la compensation.
            </Alert>
          </CardContent>
        </Card>
      )}

      {selectedSemesterId && (
        <>
          {/* Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Statistiques de compensation"
              action={
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={simulate}
                    disabled={simulating || !rules?.enabled}
                    startIcon={simulating ? <CircularProgress size={16} /> : <i className="ri-test-tube-line" />}
                  >
                    {simulating ? 'Simulation...' : 'Simuler'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    onClick={applyBulk}
                    disabled={applying || !simulation || simulation.eligible_students === 0}
                    startIcon={applying ? <CircularProgress size={16} /> : <i className="ri-check-double-line" />}
                  >
                    {applying ? 'Application...' : 'Appliquer tout'}
                  </Button>
                </Box>
              }
            />
            <CardContent>
              {!rules?.enabled && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  La compensation est désactivée. Activez-la dans les règles ci-dessus.
                </Alert>
              )}

              {statsLoading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : statistics ? (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Total étudiants</Typography>
                      <Typography variant="h3" color="primary.main">{statistics.total_students}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Avec compensation</Typography>
                      <Typography variant="h3" color="success.main">{statistics.students_with_compensation}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'warning.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Modules compensés</Typography>
                      <Typography variant="h3" color="warning.main">{statistics.total_compensated_modules}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Taux de compensation</Typography>
                      <Typography variant="h3" color="info.main">{statistics.compensation_rate.toFixed(1)}%</Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Aucune statistique disponible.</Alert>
              )}
            </CardContent>
          </Card>

          {/* Simulation results */}
          {simulation && (
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">Résultats de simulation</Typography>
                    <Chip label={`${simulation.eligible_students} éligibles`} size="small" color="warning" />
                    <Chip label={`${simulation.total_compensable_modules} modules`} size="small" variant="outlined" />
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <CompensationSimulationTable
                  students={simulation.students}
                  loading={false}
                  onApplyForStudent={applyForStudent}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Student detail dialog */}
      <StudentCompensationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        onLoadModules={getCompensableModules}
        onApply={applyForStudent}
        onRemove={removeCompensation}
      />

      {/* Success snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={dismissMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={dismissMessage}>{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
};
