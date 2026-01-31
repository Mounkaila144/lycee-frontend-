/**
 * Statistics Dashboard - Structure Académique
 */

'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/use-translation';
import {
  useGlobalStats,
  useVolumeDistribution,
  useCreditsByLevel,
  useStatsActions,
} from '../hooks/useStatistics';
import { StatsCard } from './StatsCard';
import { VolumeChart } from './VolumeChart';
import { ModulesByLevelChart } from './ModulesByLevelChart';
import { CreditsByLevelChart } from './CreditsByLevelChart';
import { ProgramsByTypeChart } from './ProgramsByTypeChart';

export const StatsDashboard: React.FC = () => {
  const { t } = useTranslation('StructureAcademique');
  const { data: globalStats, loading: loadingGlobal, error: errorGlobal, refetch: refetchGlobal } = useGlobalStats();
  const { data: volumes, loading: loadingVolumes, error: errorVolumes } = useVolumeDistribution();
  const { data: credits, loading: loadingCredits, error: errorCredits } = useCreditsByLevel();
  const { exportStats, invalidateCache, isExporting, isInvalidating } = useStatsActions();

  const handleExport = async () => {
    const success = await exportStats();
    if (success) {
      // Optionally show success message
    }
  };

  const handleRefresh = async () => {
    const success = await invalidateCache();
    if (success) {
      refetchGlobal();
    }
  };

  const loading = loadingGlobal || loadingVolumes || loadingCredits;
  const error = errorGlobal || errorVolumes || errorCredits;

  if (loading && !globalStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !globalStats) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('Statistiques de la Structure Académique')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<i className="ri-refresh-line" />}
            onClick={handleRefresh}
            disabled={isInvalidating}
          >
            {isInvalidating ? t('Actualisation...') : t('Actualiser')}
          </Button>
          <Button
            variant="contained"
            startIcon={<i className="ri-file-excel-line" />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? t('Exportation...') : t('Exporter Excel')}
          </Button>
        </Box>
      </Box>

      {globalStats && (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Filières')}
                value={globalStats.programs.total}
                subtitle={`${globalStats.programs.active} ${t('actifs')}`}
                icon="ri-book-line"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Modules')}
                value={globalStats.modules.total}
                subtitle={`${globalStats.modules.total_credits} ${t('crédits ECTS')}`}
                icon="ri-file-list-line"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Enseignants')}
                value={globalStats.teachers.total_assigned}
                subtitle={`${Math.round(globalStats.teachers.average_workload)}${t('h moy.')}`}
                icon="ri-user-line"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Taux de Couverture')}
                value={`${Math.round(globalStats.coverage_rate)}%`}
                subtitle={t('Modules avec enseignant')}
                icon="ri-pie-chart-line"
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Charts Row 1 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('Programmes par Type')}
                  </Typography>
                  <ProgramsByTypeChart data={globalStats.programs.by_type} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('Répartition Volumes Horaires')}
                  </Typography>
                  {volumes && <VolumeChart data={volumes} />}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('Modules par Niveau')}
                  </Typography>
                  <ModulesByLevelChart data={globalStats.modules.by_level} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('Crédits ECTS par Niveau')}
                  </Typography>
                  {credits && <CreditsByLevelChart data={credits} />}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Détails Supplémentaires')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Modules Éliminatoires')}
                    </Typography>
                    <Typography variant="h6">
                      {globalStats.modules.eliminatory_count}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Crédits Moyens/Module')}
                    </Typography>
                    <Typography variant="h6">
                      {globalStats.modules.avg_credits.toFixed(1)} ECTS
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Affectations Enseignants')}
                    </Typography>
                    <Typography variant="h6">
                      {globalStats.teachers.total_assignments}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Statut Filières')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={`${globalStats.programs.active} ${t('Actifs')}`} size="small" color="success" />
                      <Chip label={`${globalStats.programs.draft} ${t('Brouillon')}`} size="small" color="warning" />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
