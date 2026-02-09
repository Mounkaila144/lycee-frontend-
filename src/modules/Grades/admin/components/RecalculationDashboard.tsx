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

import { SemesterSelector } from './SemesterSelector';
import { RecalculationLogsTable } from './RecalculationLogsTable';
import { useRetakeRecalculation } from '../hooks/useRetakeRecalculation';

export const RecalculationDashboard: React.FC = () => {
  const {
    semesterId,
    setSemesterId,
    logs,
    logsLoading,
    logsError,
    recalculateAll,
    recalculatingAll,
    recalculateAllResult,
    refresh,
  } = useRetakeRecalculation();

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
          <Typography color="text.primary">Recalcul après rattrapage</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Recalcul après Rattrapage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Recalculez les moyennes, statuts et crédits ECTS après publication des notes de rattrapage.
        </Typography>
      </Box>

      {/* Semester selector + action */}
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
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={recalculateAll}
                  disabled={!semesterId || recalculatingAll}
                  startIcon={recalculatingAll ? <CircularProgress size={16} /> : <i className="ri-calculator-line" />}
                >
                  {recalculatingAll ? 'Recalcul en cours...' : 'Recalculer tous les étudiants'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Result alert */}
      {recalculateAllResult && (
        <Alert severity={recalculateAllResult.status === 'queued' ? 'info' : 'success'} sx={{ mb: 3 }}>
          {recalculateAllResult.message} ({recalculateAllResult.count} étudiants traités)
          {recalculateAllResult.status === 'queued' && (
            <Typography variant="caption" display="block">
              Le recalcul est en cours en arrière-plan. Les logs seront mis à jour automatiquement.
            </Typography>
          )}
        </Alert>
      )}

      {/* No semester */}
      {!semesterId && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un semestre pour voir les logs de recalcul.
            </Alert>
          </CardContent>
        </Card>
      )}

      {logsError && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={refresh}>Réessayer</Button>}>
          {(logsError as Error).message}
        </Alert>
      )}

      {/* Logs */}
      {semesterId && (
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">Historique des recalculs</Typography>
                {logs.length > 0 && (
                  <Chip label={`${logs.length} entrées`} size="small" variant="outlined" />
                )}
              </Box>
            }
            action={
              <Tooltip title="Rafraîchir">
                <IconButton onClick={refresh}>
                  <i className="ri-refresh-line" />
                </IconButton>
              </Tooltip>
            }
          />
          <Divider />
          <CardContent>
            <RecalculationLogsTable logs={logs} loading={logsLoading} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
