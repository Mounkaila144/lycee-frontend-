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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

import { SemesterSelector } from './SemesterSelector';
import { ModuleSelector } from './ModuleSelector';
import { ModuleResultsTable } from './ModuleResultsTable';
import { useModuleResults } from '../hooks/useModuleResults';

/**
 * ModuleResultsDashboard Component
 * Main page for generating and managing module results
 */
export const ModuleResultsDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const {
    results,
    statistics,
    total,
    loading,
    generating,
    publishing,
    error,
    successMessage,
    generate,
    publish,
    exportResults,
    dismissMessage,
    refresh,
  } = useModuleResults(selectedModuleId, selectedSemesterId);

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
          <Typography color="text.primary">Résultats par module</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Résultats par module
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Générez, consultez et publiez les résultats de chaque module par semestre.
        </Typography>
      </Box>

      {/* Selectors */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <i className="ri-filter-line" style={{ marginRight: 8 }} />
            Sélection
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SemesterSelector
                selectedSemesterId={selectedSemesterId}
                onSemesterChange={(id) => {
                  setSelectedSemesterId(id);
                  setSelectedModuleId(null);
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ModuleSelector
                selectedModuleId={selectedModuleId}
                onModuleChange={setSelectedModuleId}
                semesterId={selectedSemesterId}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* No selection */}
      {(!selectedSemesterId || !selectedModuleId) && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un semestre et un module pour voir les résultats.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={dismissMessage} action={<Button onClick={refresh}>Réessayer</Button>}>
          {error.message}
        </Alert>
      )}

      {selectedSemesterId && selectedModuleId && (
        <>
          {/* Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Statistiques du module"
              action={
                <Box display="flex" gap={1}>
                  <Tooltip title="Générer les résultats">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={generate}
                      disabled={generating}
                      startIcon={generating ? <CircularProgress size={16} /> : <i className="ri-calculator-line" />}
                    >
                      {generating ? 'Génération...' : 'Générer'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Publier les résultats">
                    <span>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        onClick={publish}
                        disabled={publishing || results.length === 0}
                        startIcon={publishing ? <CircularProgress size={16} /> : <i className="ri-send-plane-line" />}
                      >
                        {publishing ? 'Publication...' : 'Publier'}
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Exporter (Excel)">
                    <span>
                      <IconButton onClick={() => exportResults('xlsx')} disabled={results.length === 0}>
                        <i className="ri-file-excel-line" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Rafraîchir">
                    <IconButton onClick={refresh}>
                      <i className="ri-refresh-line" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent>
              {loading && !statistics ? (
                <Skeleton variant="rectangular" height={120} />
              ) : statistics ? (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Moyenne classe</Typography>
                      <Typography variant="h3" color="primary.main">
                        {statistics.class_average !== null ? statistics.class_average.toFixed(2) : '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">/20</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Taux de réussite</Typography>
                      <Typography variant="h3" color="success.main">
                        {statistics.pass_rate !== null ? statistics.pass_rate.toFixed(1) : 0}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {statistics.total_students} étudiants
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Min / Max</Typography>
                      <Typography variant="h4" color="info.main">
                        {statistics.min_average !== null ? statistics.min_average.toFixed(2) : '-'}
                        {' / '}
                        {statistics.max_average !== null ? statistics.max_average.toFixed(2) : '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'warning.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Publiés</Typography>
                      <Typography variant="h3" color="warning.main">
                        {statistics.published_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        sur {statistics.total_students}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Aucune donnée. Cliquez sur &quot;Générer&quot; pour calculer les résultats.</Alert>
              )}

              {statistics?.status_distribution && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>Répartition par statut</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip label={`Validés: ${statistics.status_distribution.validated}`} color="success" size="small" />
                    <Chip label={`Compensés: ${statistics.status_distribution.compensated}`} color="warning" size="small" />
                    <Chip label={`Non validés: ${statistics.status_distribution.failed}`} color="error" size="small" />
                    <Chip label={`Absents: ${statistics.status_distribution.absent}`} color="info" size="small" />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Results table */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Résultats par étudiant</Typography>
                  {total > 0 && (
                    <Chip label={`${total} étudiants`} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <ModuleResultsTable results={results} loading={loading} />
            </CardContent>
          </Card>
        </>
      )}

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
