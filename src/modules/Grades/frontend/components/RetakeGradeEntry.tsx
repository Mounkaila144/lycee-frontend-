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
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { RetakeGradeTable } from './RetakeGradeTable';
import { RetakeStatisticsPanel } from './RetakeStatisticsPanel';
import { useTeacherRetakeModules, useRetakeGradeEntry } from '../hooks/useRetakeGradeEntry';

export const RetakeGradeEntry: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  const { data: retakeModules, isLoading: modulesLoading } = useTeacherRetakeModules(
    { semester_id: selectedSemesterId }
  );

  const {
    entries,
    statistics,
    hasModified,
    loading,
    statsLoading,
    saving,
    submitting,
    autoSaveStatus,
    error,
    updateGrade,
    saveAll,
    submit,
    downloadTemplate,
    refresh,
  } = useRetakeGradeEntry(selectedModuleId, selectedSemesterId);

  const selectedModule = retakeModules?.find(m => m.id === selectedModuleId);

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
          <Typography color="text.primary">Saisie Notes Rattrapage</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Saisie des Notes de Rattrapage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Saisissez les notes de rattrapage. La nouvelle moyenne = MAX(moyenne initiale, note rattrapage).
        </Typography>
      </Box>

      {/* Module selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <i className="ri-book-open-line" style={{ marginRight: 8 }} />
            Sélection du module
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Module en rattrapage</InputLabel>
                <Select
                  value={selectedModuleId ?? ''}
                  onChange={(e) => setSelectedModuleId(e.target.value as number)}
                  label="Module en rattrapage"
                >
                  {modulesLoading && <MenuItem disabled>Chargement...</MenuItem>}
                  {retakeModules?.map(mod => (
                    <MenuItem key={mod.id} value={mod.id}>
                      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                        <span>{mod.code} - {mod.name}</span>
                        <Chip
                          label={`${mod.retake_student_count} étudiants`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                  {retakeModules?.length === 0 && (
                    <MenuItem disabled>Aucun module en rattrapage</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* No module selected */}
      {!selectedModuleId && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Sélectionnez un module pour commencer la saisie des notes de rattrapage.
            </Alert>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={refresh}>Réessayer</Button>}>
          {(error as Error).message}
        </Alert>
      )}

      {selectedModuleId && (
        <>
          {/* Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Statistiques - {selectedModule?.name}</Typography>
                  {autoSaveStatus === 'saving' && <Chip label="Sauvegarde..." size="small" color="info" />}
                  {autoSaveStatus === 'saved' && <Chip label="Sauvegardé" size="small" color="success" />}
                  {autoSaveStatus === 'error' && <Chip label="Erreur sauvegarde" size="small" color="error" />}
                </Box>
              }
              action={
                <Box display="flex" gap={1}>
                  <Tooltip title="Télécharger le template Excel">
                    <Button variant="outlined" size="small" onClick={downloadTemplate} startIcon={<i className="ri-file-excel-line" />}>
                      Template
                    </Button>
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
              <RetakeStatisticsPanel statistics={statistics} loading={statsLoading} />
            </CardContent>
          </Card>

          {/* Grade entry table */}
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">Saisie des notes</Typography>
                  {entries.length > 0 && (
                    <Chip label={`${entries.length} étudiants`} size="small" variant="outlined" />
                  )}
                  {hasModified && (
                    <Chip label="Modifications non sauvegardées" size="small" color="warning" />
                  )}
                </Box>
              }
              action={
                <Box display="flex" gap={1}>
                  {hasModified && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={saveAll}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={16} /> : <i className="ri-save-line" />}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={submit}
                    disabled={submitting || entries.length === 0}
                    startIcon={submitting ? <CircularProgress size={16} /> : <i className="ri-send-plane-line" />}
                  >
                    {submitting ? 'Soumission...' : 'Soumettre pour validation'}
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <RetakeGradeTable
                entries={entries}
                loading={loading}
                onUpdateGrade={updateGrade}
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
