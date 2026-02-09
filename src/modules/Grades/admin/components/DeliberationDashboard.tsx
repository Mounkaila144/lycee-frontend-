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
import Snackbar from '@mui/material/Snackbar';

import { SemesterSelector } from './SemesterSelector';
import { DeliberationSessionsTable } from './DeliberationSessionsTable';
import { CreateDeliberationDialog } from './CreateDeliberationDialog';
import { DeliberationSessionView } from './DeliberationSessionView';
import { useDeliberationSessions } from '../hooks/useDeliberation';

/**
 * DeliberationDashboard Component
 * Main page for managing jury deliberation sessions
 */
export const DeliberationDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    sessions,
    loading,
    error,
    successMessage,
    createSession,
    dismissMessage,
  } = useDeliberationSessions(selectedSemesterId);

  // If viewing a specific session, show session view
  if (selectedSessionId) {
    return (
      <DeliberationSessionView
        sessionId={selectedSessionId}
        onBack={() => setSelectedSessionId(null)}
      />
    );
  }

  // Session stats
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const inProgressCount = sessions.filter(s => s.status === 'in_progress').length;
  const plannedCount = sessions.filter(s => s.status === 'planned').length;

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
          <Typography color="text.primary">Délibérations</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Délibérations du jury
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Créez et gérez les sessions de délibération, prenez les décisions du jury pour chaque étudiant.
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
              Sélectionnez un semestre pour gérer les délibérations.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={dismissMessage}>
          {error.message}
        </Alert>
      )}

      {selectedSemesterId && (
        <>
          {/* Stats */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Sessions de délibération"
              action={
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setCreateDialogOpen(true)}
                  startIcon={<i className="ri-add-line" />}
                >
                  Nouvelle session
                </Button>
              }
            />
            <CardContent>
              <Box display="flex" gap={2} mb={2}>
                <Chip label={`${sessions.length} total`} variant="outlined" />
                {plannedCount > 0 && <Chip label={`${plannedCount} planifiées`} color="default" size="small" />}
                {inProgressCount > 0 && <Chip label={`${inProgressCount} en cours`} color="info" size="small" />}
                {completedCount > 0 && <Chip label={`${completedCount} terminées`} color="success" size="small" />}
              </Box>
            </CardContent>
          </Card>

          {/* Sessions table */}
          <Card>
            <CardHeader title="Liste des sessions" />
            <Divider />
            <CardContent>
              <DeliberationSessionsTable
                sessions={sessions}
                loading={loading}
                onSelectSession={setSelectedSessionId}
              />
            </CardContent>
          </Card>

          {/* Create dialog */}
          <CreateDeliberationDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            semesterId={selectedSemesterId}
            onSubmit={createSession}
          />
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
