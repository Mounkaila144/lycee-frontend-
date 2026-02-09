'use client';

import React, { useState, useMemo } from 'react';

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
import LinearProgress from '@mui/material/LinearProgress';

import { SemesterSelector } from './SemesterSelector';
import { SemesterResultsTable } from './SemesterResultsTable';
import { BlockedByEliminatoryCard } from './BlockedByEliminatoryCard';
import { useSemesterResults } from '../hooks/useSemesterResults';

import type { SemesterResultFilters } from '../services/semesterResultService';

/**
 * SemesterResultsDashboard Component
 * Main page for viewing and managing semester results
 */
export const SemesterResultsDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<SemesterResultFilters['global_status'] | undefined>(undefined);

  const {
    results,
    statistics,
    total,
    filters,
    loading,
    statsLoading,
    recalculating,
    publishing,
    error,
    updateFilters,
    recalculate,
    publish,
    refresh,
  } = useSemesterResults(selectedSemesterId);

  // Blocked by eliminatory students
  const blockedStudents = useMemo(
    () => results.filter((r: any) => r.validation_blocked_by_eliminatory),
    [results]
  );

  // Filtered results by status
  const filteredResults = useMemo(() => {
    if (!statusFilter) return results;

    return results.filter((r: any) => r.global_status === statusFilter);
  }, [results, statusFilter]);

  const handleStatusFilter = (status: SemesterResultFilters['global_status']) => {
    setStatusFilter(prev => prev === status ? undefined : status);
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
          <Typography color="text.primary">Résultats semestriels</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Résultats semestriels
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consultez les moyennes semestrielles, les classements et la progression des étudiants.
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
              Sélectionnez un semestre pour voir les résultats.
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
          {/* Blocked by eliminatory */}
          <BlockedByEliminatoryCard
            blockedStudents={blockedStudents}
            loading={loading}
          />

          {/* Statistics cards */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Statistiques du semestre"
              action={
                <Box display="flex" gap={1}>
                  <Tooltip title="Recalculer les moyennes">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={recalculate}
                      disabled={recalculating}
                      startIcon={recalculating ? <CircularProgress size={16} /> : <i className="ri-calculator-line" />}
                    >
                      {recalculating ? 'Recalcul...' : 'Recalculer'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Publier les résultats">
                    <span>
                      <Button
                        variant="contained"
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
                  <Tooltip title="Rafraîchir">
                    <IconButton onClick={refresh}>
                      <i className="ri-refresh-line" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent>
              {statsLoading ? (
                <Skeleton variant="rectangular" height={120} />
              ) : statistics ? (
                <Grid container spacing={3}>
                  {/* Class average */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Moyenne générale
                      </Typography>
                      <Typography variant="h3" color="primary.main">
                        {statistics.average !== null ? statistics.average.toFixed(2) : '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">/20</Typography>
                    </Box>
                  </Grid>

                  {/* Validation rate */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Taux de validation
                      </Typography>
                      <Typography variant="h3" color="success.main">
                        {statistics.validation_rate?.toFixed(1) ?? 0}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {statistics.count} étudiants
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Min/Max */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Min / Max
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {statistics.min !== null ? statistics.min.toFixed(2) : '-'}
                        {' / '}
                        {statistics.max !== null ? statistics.max.toFixed(2) : '-'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Progression */}
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'warning.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Progression
                      </Typography>
                      <Typography variant="h3" color="warning.main">
                        {statistics.progression_stats?.can_progress ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        sur {statistics.progression_stats?.total ?? 0} étudiants
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Aucune donnée statistique disponible.</Alert>
              )}

              {/* Status distribution - clickable filter chips */}
              {statistics?.status_distribution && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Répartition par statut (cliquez pour filtrer)
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={`Validés: ${statistics.status_distribution.validated}`}
                      color="success"
                      size="small"
                      variant={statusFilter === 'validated' ? 'filled' : 'outlined'}
                      onClick={() => handleStatusFilter('validated')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label={`Partiellement validés: ${statistics.status_distribution.partially_validated}`}
                      color="warning"
                      size="small"
                      variant={statusFilter === 'partially_validated' ? 'filled' : 'outlined'}
                      onClick={() => handleStatusFilter('partially_validated')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label={`A repasser: ${statistics.status_distribution.to_retake}`}
                      color="error"
                      size="small"
                      variant={statusFilter === 'to_retake' ? 'filled' : 'outlined'}
                      onClick={() => handleStatusFilter('to_retake')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label={`Ajournés: ${statistics.status_distribution.deferred}`}
                      color="info"
                      size="small"
                      variant={statusFilter === 'deferred' ? 'filled' : 'outlined'}
                      onClick={() => handleStatusFilter('deferred')}
                      sx={{ cursor: 'pointer' }}
                    />
                    {statusFilter && (
                      <Chip
                        label="Tous"
                        size="small"
                        variant="outlined"
                        onDelete={() => setStatusFilter(undefined)}
                      />
                    )}
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
                    <Chip label={`${filteredResults.length}${statusFilter ? ` / ${total}` : ''} étudiants`} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <SemesterResultsTable
                results={filteredResults}
                loading={loading}
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
