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
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';

import { SemesterSelector } from './SemesterSelector';
import { FinalResultsTable } from './FinalResultsTable';
import { PublishFinalResultsDialog } from './PublishFinalResultsDialog';
import { LockYearDialog } from './LockYearDialog';
import { useFinalResults } from '../hooks/useFinalResults';
import { FINAL_STATUS_LABELS, FINAL_STATUS_COLORS } from '../../types/finalResult.types';
import type { FinalStatus } from '../../types/finalResult.types';

export const FinalResultsDashboard: React.FC = () => {
  const {
    semesterId,
    setSemesterId,
    statusFilter,
    setStatusFilter,
    publishDialogOpen,
    setPublishDialogOpen,
    lockDialogOpen,
    setLockDialogOpen,
    statistics,
    results,
    statsLoading,
    resultsLoading,
    error,
    publishResults,
    publishing,
    publishResult,
    lockYear,
    locking,
    lockResult,
    exportResults,
    exporting,
    refresh,
  } = useFinalResults();

  const handleStatusFilter = (status: string) => {
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
          <Typography color="text.primary">Résultats Finaux</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Résultats Finaux après Rattrapage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Publiez les résultats définitifs et déterminez les admissions, ajournements et redoublements.
        </Typography>
      </Box>

      {/* Semester selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <SemesterSelector
                selectedSemesterId={semesterId}
                onSemesterChange={setSemesterId}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setPublishDialogOpen(true)}
                  disabled={!semesterId || publishing}
                  startIcon={<i className="ri-send-plane-line" />}
                >
                  Publier résultats finaux
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setLockDialogOpen(true)}
                  disabled={!semesterId || locking}
                  startIcon={<i className="ri-lock-line" />}
                >
                  Verrouiller année
                </Button>
                <Button
                  variant="outlined"
                  onClick={exportResults}
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

      {/* Publish result */}
      {publishResult && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Résultats publiés : {publishResult.stats.admitted} admis, {publishResult.stats.admitted_with_debts} admis avec dettes,
          {publishResult.stats.deferred_final} ajournés, {publishResult.stats.repeating} redoublants.
        </Alert>
      )}

      {/* Lock result */}
      {lockResult && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Année verrouillée le {new Date(lockResult.locked_at).toLocaleDateString('fr-FR')}.
        </Alert>
      )}

      {/* No semester */}
      {!semesterId && (
        <Card>
          <CardContent>
            <Alert severity="info">Sélectionnez un semestre pour voir les résultats finaux.</Alert>
          </CardContent>
        </Card>
      )}

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
              title="Statistiques finales"
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
                <Skeleton variant="rectangular" height={120} />
              ) : statistics ? (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Taux de réussite</Typography>
                        <Typography variant="h3" color="success.main">{statistics.pass_rate?.toFixed(1)}%</Typography>
                        <Typography variant="caption" color="text.secondary">{statistics.total_students} étudiants</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Impact rattrapage</Typography>
                        <Typography variant="h3" color="info.main">+{statistics.retake_impact?.toFixed(1)}%</Typography>
                        <Typography variant="caption" color="text.secondary">admis grâce au rattrapage</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Moy. crédits ECTS</Typography>
                        <Typography variant="h3" color="primary.main">{statistics.average_credits?.toFixed(1)}</Typography>
                        <Typography variant="caption" color="text.secondary">par étudiant</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'error.lighter', textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Ajournés</Typography>
                        <Typography variant="h3" color="error.main">{statistics.deferred_final + statistics.repeating}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {statistics.deferred_final} ajournés + {statistics.repeating} redoublants
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Status distribution chips */}
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Répartition par statut (cliquez pour filtrer)
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {(['admitted', 'admitted_with_debts', 'deferred_final', 'repeating'] as FinalStatus[]).map(status => (
                        <Chip
                          key={status}
                          label={`${FINAL_STATUS_LABELS[status]}: ${statistics[status] ?? 0}`}
                          color={FINAL_STATUS_COLORS[status]}
                          size="small"
                          variant={statusFilter === status ? 'filled' : 'outlined'}
                          onClick={() => handleStatusFilter(status)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                      {statusFilter && (
                        <Chip label="Tous" size="small" variant="outlined" onDelete={() => setStatusFilter(undefined)} />
                      )}
                    </Box>
                  </Box>
                </>
              ) : (
                <Alert severity="info">Aucune donnée statistique disponible.</Alert>
              )}
            </CardContent>
          </Card>

          {/* Results table */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Résultats par étudiant</Typography>
                  {results?.total !== undefined && (
                    <Chip label={`${results.total} étudiants`} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <FinalResultsTable results={results?.data ?? []} loading={resultsLoading} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialogs */}
      <PublishFinalResultsDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={(data) => {
          publishResults(data);
          setPublishDialogOpen(false);
        }}
        statistics={statistics}
        publishing={publishing}
      />
      <LockYearDialog
        open={lockDialogOpen}
        onClose={() => setLockDialogOpen(false)}
        onConfirm={() => {
          lockYear();
          setLockDialogOpen(false);
        }}
        locking={locking}
      />
    </Box>
  );
};
