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

import { SemesterSelector } from './SemesterSelector';
import { EliminatoryModulesTable } from './EliminatoryModulesTable';
import { BlockedStudentsList } from './BlockedStudentsList';
import { ThresholdEditDialog } from './ThresholdEditDialog';

import { useEliminatoryManagement } from '../hooks/useEliminatoryManagement';

import type { EliminatoryModule } from '../../types/eliminatory.types';

/**
 * EliminatoryConfigPage Component
 * Main page for managing eliminatory modules and thresholds
 */
export const EliminatoryConfigPage: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  const {
    eliminatoryModules,
    blockedStudents,
    blockedCount,
    statistics,
    loading,
    statsLoading,
    blockedLoading,
    saving,
    error,
    updateThreshold,
    validateThreshold,
    refresh,
  } = useEliminatoryManagement(selectedSemesterId);

  // Dialog state
  const [thresholdDialog, setThresholdDialog] = useState<{
    open: boolean;
    module: EliminatoryModule | null;
  }>({ open: false, module: null });

  const handleEditThreshold = useCallback((module: EliminatoryModule) => {
    setThresholdDialog({ open: true, module });
  }, []);

  const handleCloseThreshold = useCallback(() => {
    setThresholdDialog({ open: false, module: null });
  }, []);

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
          <Typography color="text.primary">Modules éliminatoires</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Modules éliminatoires
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configurez les modules éliminatoires et leurs seuils. Les étudiants en dessous du seuil devront repasser le module.
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
              Sélectionnez un semestre pour voir les modules éliminatoires.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={refresh}>Réessayer</Button>}>
          {error.message}
        </Alert>
      )}

      {selectedSemesterId && (
        <>
          {/* Statistics cards */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Vue d'ensemble"
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
              ) : statistics ? (
                <Grid container spacing={3}>
                  {/* Eliminatory modules count */}
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: 'error.lighter',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Modules éliminatoires
                      </Typography>
                      <Typography variant="h3" color="error.main">
                        {statistics.eliminatory_modules_count}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Blocked students */}
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: 'warning.lighter',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Étudiants bloqués
                      </Typography>
                      <Typography variant="h3" color="warning.main">
                        {statistics.blocked_students_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        sur {statistics.total_students} étudiants
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Blocked percentage */}
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: statistics.blocked_percentage > 30 ? 'error.lighter' : 'success.lighter',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Taux de blocage
                      </Typography>
                      <Typography
                        variant="h3"
                        color={statistics.blocked_percentage > 30 ? 'error.main' : 'success.main'}
                      >
                        {statistics.blocked_percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Aucune donnée disponible.</Alert>
              )}
            </CardContent>
          </Card>

          {/* Eliminatory modules table */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Modules éliminatoires"
              subheader="Liste des modules avec seuils éliminatoires configurés"
            />
            <Divider />
            <CardContent>
              <EliminatoryModulesTable
                modules={eliminatoryModules}
                loading={loading}
                onEditThreshold={handleEditThreshold}
              />
            </CardContent>
          </Card>

          {/* Blocked students */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Étudiants bloqués</Typography>
                  {blockedCount > 0 && (
                    <Chip label={blockedCount} size="small" color="error" />
                  )}
                </Box>
              }
              subheader="Étudiants dont la validation est bloquée par des modules éliminatoires"
            />
            <Divider />
            <CardContent>
              <BlockedStudentsList
                students={blockedStudents}
                loading={blockedLoading}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Threshold edit dialog */}
      <ThresholdEditDialog
        open={thresholdDialog.open}
        module={thresholdDialog.module}
        onClose={handleCloseThreshold}
        onSave={updateThreshold}
        saving={saving}
        validateThreshold={validateThreshold}
      />
    </Box>
  );
};
