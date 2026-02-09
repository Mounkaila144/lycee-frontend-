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
import Snackbar from '@mui/material/Snackbar';

import { SemesterSelector } from './SemesterSelector';
import { PublicationHistoryTable } from './PublicationHistoryTable';
import { PublishDialog } from './PublishDialog';
import { PublicationDetailDialog } from './PublicationDetailDialog';
import { usePublications, usePublicationManagement } from '../hooks/usePublication';

import type { PublicationRecord } from '../../types/publication.types';

/**
 * PublicationDashboard Component
 * Main page for managing results publication
 * Updated: field mapping to match backend response
 */
export const PublicationDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<PublicationRecord | null>(null);

  const {
    publications,
    status,
    canPublishData,
    loading,
    statusLoading,
    error: listError,
    fetchPublications,
    fetchStatus,
    dismissMessage: dismissListMessage,
  } = usePublications(selectedSemesterId);

  const {
    publishing,
    error: actionError,
    successMessage,
    publish,
    deletePublication,
    dismissMessage: dismissActionMessage,
  } = usePublicationManagement();

  const handlePublish = async (request: any) => {
    if (!selectedSemesterId) return null;

    const result = await publish(selectedSemesterId, request);

    if (result) {
      fetchPublications();
      fetchStatus();
    }

    return result;
  };

  const handleDelete = async (publicationId: number) => {
    const success = await deletePublication(publicationId);

    if (success) {
      fetchPublications();
      fetchStatus();
    }
  };

  const handleViewDetail = (publication: PublicationRecord) => {
    setSelectedPublication(publication);
    setDetailDialogOpen(true);
  };

  const error = listError || actionError;

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
          <Typography color="text.primary">Publications</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Publication des résultats
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Publiez les résultats semestriels et notifiez les étudiants.
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

      {/* No semester */}
      {!selectedSemesterId && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un semestre pour gérer les publications.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => { dismissListMessage(); dismissActionMessage(); }}>
          {error.message}
        </Alert>
      )}

      {selectedSemesterId && (
        <>
          {/* Status & Actions */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="État de la publication"
              action={
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => setPublishDialogOpen(true)}
                  startIcon={<i className="ri-send-plane-line" />}
                >
                  Publier
                </Button>
              }
            />
            <CardContent>
              {statusLoading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : status ? (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: status.is_fully_published ? 'success.lighter' : 'warning.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                      <Chip
                        label={status.is_fully_published ? 'Tout publié' : status.published_results > 0 ? 'Partiellement publié' : 'Non publié'}
                        color={status.is_fully_published ? 'success' : status.published_results > 0 ? 'info' : 'warning'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Résultats</Typography>
                      <Typography variant="h3" color="primary.main">{status.total_results}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {status.final_results} finaux
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'info.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Publiés / Non publiés</Typography>
                      <Typography variant="h4" color="info.main">
                        {status.published_results} / {status.unpublished_results}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'success.lighter', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Taux de publication</Typography>
                      <Typography variant="h3" color="success.main">
                        {status.publication_percentage !== undefined ? `${status.publication_percentage.toFixed(1)}%` : '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Aucune donnée de publication disponible.</Alert>
              )}
            </CardContent>
          </Card>

          {/* Publications history */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Historique des publications</Typography>
                  {publications.length > 0 && (
                    <Chip label={publications.length} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <PublicationHistoryTable
                publications={publications}
                loading={loading}
                onView={handleViewDetail}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {/* Publish dialog */}
          <PublishDialog
            open={publishDialogOpen}
            onClose={() => setPublishDialogOpen(false)}
            canPublishData={canPublishData}
            onPublish={handlePublish}
            publishing={publishing}
          />

          {/* Detail dialog */}
          <PublicationDetailDialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            publication={selectedPublication}
          />
        </>
      )}

      {/* Success snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={dismissActionMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={dismissActionMessage}>{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
};
