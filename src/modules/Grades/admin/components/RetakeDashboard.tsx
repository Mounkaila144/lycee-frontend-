'use client';

import React from 'react';

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
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { SemesterSelector } from './SemesterSelector';
import { RetakeStatisticsCards } from './RetakeStatisticsCards';
import { RetakeModulesTable } from './RetakeModulesTable';
import { RetakeStudentsTable } from './RetakeStudentsTable';
import { useRetakeManagement } from '../hooks/useRetakeManagement';

export const RetakeDashboard: React.FC = () => {
  const {
    semesterId,
    setSemesterId,
    selectedModuleId,
    view,
    setView,
    statistics,
    modules,
    students,
    moduleStudents,
    statsLoading,
    modulesLoading,
    studentsLoading,
    moduleStudentsLoading,
    error,
    identify,
    identifying,
    identifyResult,
    exportStudents,
    exporting,
    selectModule,
    backToList,
    refresh,
  } = useRetakeManagement();

  const [tabIndex, setTabIndex] = React.useState(0);

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
          <Typography color="text.primary">Rattrapages</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Gestion des Rattrapages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Identifiez les modules à rattraper, consultez les étudiants concernés et suivez les statistiques.
        </Typography>
      </Box>

      {/* Semester selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <i className="ri-filter-line" style={{ marginRight: 8 }} />
            Sélection du semestre
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <SemesterSelector
                selectedSemesterId={semesterId}
                onSemesterChange={setSemesterId}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={identify}
                  disabled={!semesterId || identifying}
                  startIcon={identifying ? <CircularProgress size={16} /> : <i className="ri-search-eye-line" />}
                >
                  {identifying ? 'Identification...' : 'Identifier les rattrapages'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => exportStudents()}
                  disabled={!semesterId || exporting}
                  startIcon={exporting ? <CircularProgress size={16} /> : <i className="ri-download-line" />}
                >
                  Exporter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Identification result */}
      {identifyResult && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => {}}>
          Identification terminée : {identifyResult.students_impacted} étudiants concernés, {identifyResult.total_retakes} inscriptions rattrapage créées.
        </Alert>
      )}

      {/* No semester selected */}
      {!semesterId && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un semestre pour voir les rattrapages.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={refresh}>Réessayer</Button>}>
          {(error as Error).message}
        </Alert>
      )}

      {semesterId && (
        <>
          {/* Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Statistiques rattrapage"
              action={
                <Tooltip title="Rafraîchir">
                  <IconButton onClick={refresh}>
                    <i className="ri-refresh-line" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <RetakeStatisticsCards statistics={statistics} loading={statsLoading} />

              {/* Distribution chips */}
              {statistics?.distribution && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Distribution par nombre de modules
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip label={`1 module: ${statistics.distribution['1_module']}`} size="small" color="success" variant="outlined" />
                    <Chip label={`2 modules: ${statistics.distribution['2_modules']}`} size="small" color="warning" variant="outlined" />
                    <Chip label={`3+ modules: ${statistics.distribution['3_plus_modules']}`} size="small" color="error" variant="outlined" />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Module detail view */}
          {view === 'module-detail' && selectedModuleId && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">Détail module</Typography>
                    {moduleStudents.length > 0 && (
                      <Chip label={`${moduleStudents.length} étudiants`} size="small" variant="outlined" />
                    )}
                  </Box>
                }
                action={
                  <Button variant="text" onClick={backToList} startIcon={<i className="ri-arrow-left-line" />}>
                    Retour
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                <RetakeStudentsTable
                  students={moduleStudents}
                  loading={moduleStudentsLoading}
                />
              </CardContent>
            </Card>
          )}

          {/* Tabs: Modules / Students */}
          {view !== 'module-detail' && (
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
                  <Tab label="Par module" />
                  <Tab label="Par étudiant" />
                </Tabs>
              </CardContent>
              <Divider />
              <CardContent>
                {tabIndex === 0 && (
                  <RetakeModulesTable
                    modules={modules}
                    loading={modulesLoading}
                    onSelectModule={selectModule}
                    onExportModule={(moduleId) => exportStudents(moduleId)}
                  />
                )}
                {tabIndex === 1 && (
                  <>
                    {studentsLoading ? (
                      <Typography>Chargement...</Typography>
                    ) : students?.data && students.data.length > 0 ? (
                      <Box>
                        {students.data.map((student: any) => (
                          <Box
                            key={student.student?.id ?? student.student?.matricule}
                            sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {student.student?.matricule} - {student.student?.firstname} {student.student?.lastname}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${student.retake_count} module${student.retake_count > 1 ? 's' : ''}`}
                                size="small"
                                color={student.retake_count > 2 ? 'error' : student.retake_count > 1 ? 'warning' : 'default'}
                              />
                            </Box>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {student.modules?.map((mod: any) => (
                                <Chip
                                  key={mod.module_id}
                                  label={`${mod.module_name} (${mod.original_average?.toFixed(2) ?? '-'})`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info">Aucun étudiant en rattrapage.</Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};
