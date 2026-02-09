'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import type {
  PdfExportType,
  PdfOrientation,
  PdfExportJob,
  PdfExportHistory,
} from '../../types';

// ──── Demo Data ────

const DEMO_GROUPS = [
  { id: 1, name: 'L3 Informatique - G1' },
  { id: 2, name: 'L3 Informatique - G2' },
  { id: 3, name: 'M1 Reseaux - G1' },
  { id: 4, name: 'M1 Reseaux - G2' },
  { id: 5, name: 'M2 Intelligence Artificielle' },
];

const DEMO_TEACHERS = [
  { id: 1, name: 'Dr. Dupont' },
  { id: 2, name: 'Prof. Martin' },
  { id: 3, name: 'Dr. Bernard' },
  { id: 4, name: 'Prof. Moreau' },
  { id: 5, name: 'Dr. Leroy' },
];

const DEMO_ROOMS = [
  { id: 1, name: 'Amphi A' },
  { id: 2, name: 'Salle TD-101' },
  { id: 3, name: 'Labo Info-1' },
  { id: 4, name: 'Salle TD-201' },
  { id: 5, name: 'Amphi B' },
];

const DEMO_LEVELS = [
  { id: 1, name: 'Licence 3' },
  { id: 2, name: 'Master 1' },
  { id: 3, name: 'Master 2' },
];

const DEMO_SEMESTERS = [
  { id: 1, name: 'S1 2024-2025' },
  { id: 2, name: 'S2 2024-2025' },
];

const DEMO_HISTORY: PdfExportHistory[] = [
  {
    id: 1,
    type: 'group',
    entity_name: 'L3 Informatique - G1',
    period: 'Semaine 6 (03-07 Fev 2025)',
    file_name: 'EDT_L3_Info_G1_S6_2025.pdf',
    file_size: '245 Ko',
    generated_at: '2025-02-07 14:32',
    downloaded_at: '2025-02-07 14:35',
  },
  {
    id: 2,
    type: 'teacher',
    entity_name: 'Dr. Dupont',
    period: 'Semaine 5-6 (27 Jan - 07 Fev)',
    file_name: 'EDT_Dupont_S5-S6_2025.pdf',
    file_size: '312 Ko',
    generated_at: '2025-02-06 09:15',
    downloaded_at: '2025-02-06 09:20',
  },
  {
    id: 3,
    type: 'room',
    entity_name: 'Amphi A',
    period: 'Fevrier 2025',
    file_name: 'Occupation_AmphiA_Fev2025.pdf',
    file_size: '189 Ko',
    generated_at: '2025-02-05 16:45',
  },
  {
    id: 4,
    type: 'level',
    entity_name: 'Master 1',
    period: 'Semestre 1 complet',
    file_name: 'EDT_M1_Semestre1_2024-2025.pdf',
    file_size: '1.2 Mo',
    generated_at: '2025-02-03 11:00',
    downloaded_at: '2025-02-03 11:05',
  },
  {
    id: 5,
    type: 'semester',
    entity_name: 'S2 2024-2025',
    period: 'Semestre complet',
    file_name: 'Planning_S2_2024-2025_complet.pdf',
    file_size: '3.8 Mo',
    generated_at: '2025-02-01 08:30',
    downloaded_at: '2025-02-01 10:12',
  },
  {
    id: 6,
    type: 'group',
    entity_name: 'M2 Intelligence Artificielle',
    period: 'Semaine 5 (27-31 Jan 2025)',
    file_name: 'EDT_M2_IA_S5_2025.pdf',
    file_size: '198 Ko',
    generated_at: '2025-01-27 07:55',
  },
];

const EXPORT_TYPE_LABELS: Record<PdfExportType, string> = {
  group: 'Groupe',
  teacher: 'Enseignant',
  room: 'Salle',
  level: 'Niveau',
  semester: 'Semestre',
};

const EXPORT_TYPE_COLORS: Record<PdfExportType, string> = {
  group: '#1976d2',
  teacher: '#7b1fa2',
  room: '#388e3c',
  level: '#f57c00',
  semester: '#c62828',
};

// ──── Main Component ────

export const PdfExportDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  // Export configuration state
  const [exportType, setExportType] = useState<PdfExportType>('group');
  const [entityId, setEntityId] = useState<number>(0);
  const [semesterId, setSemesterId] = useState<number>(1);
  const [weekStart, setWeekStart] = useState<string>('2025-02-03');
  const [weekEnd, setWeekEnd] = useState<string>('2025-02-07');
  const [includeExceptions, setIncludeExceptions] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(false);
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<PdfOrientation>('landscape');

  // Generation state
  const [currentJob, setCurrentJob] = useState<PdfExportJob | null>(null);
  const [history, setHistory] = useState<PdfExportHistory[]>(DEMO_HISTORY);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getEntityOptions = (): { id: number; name: string }[] => {
    switch (exportType) {
      case 'group':
        return DEMO_GROUPS;
      case 'teacher':
        return DEMO_TEACHERS;
      case 'room':
        return DEMO_ROOMS;
      case 'level':
        return DEMO_LEVELS;
      case 'semester':
        return DEMO_SEMESTERS;
      default:
        return [];
    }
  };

  const getEntityLabel = (): string => {
    switch (exportType) {
      case 'group':
        return 'Groupe';
      case 'teacher':
        return 'Enseignant';
      case 'room':
        return 'Salle';
      case 'level':
        return 'Niveau';
      case 'semester':
        return 'Semestre';
      default:
        return 'Entite';
    }
  };

  const simulateGeneration = useCallback(
    (jobLabel: string) => {
      setErrorMessage('');
      setSuccessMessage('');

      const jobId = `job_${Date.now()}`;

      const newJob: PdfExportJob = {
        id: jobId,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString(),
      };

      setCurrentJob(newJob);

      // Simulate progress
      let progress = 0;

      progressIntervalRef.current = setInterval(() => {
        progress += Math.random() * 15 + 5;

        if (progress >= 100) {
          progress = 100;

          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }

          const completedJob: PdfExportJob = {
            id: jobId,
            status: 'completed',
            progress: 100,
            file_url: '#',
            file_name: `${jobLabel}.pdf`,
            created_at: newJob.created_at,
          };

          setCurrentJob(completedJob);

          // Add to history
          const entityOptions = getEntityOptions();
          const selectedEntity = entityOptions.find((e) => e.id === entityId);

          const newHistoryEntry: PdfExportHistory = {
            id: Date.now(),
            type: exportType,
            entity_name: selectedEntity?.name || jobLabel,
            period: `${weekStart} - ${weekEnd}`,
            file_name: `${jobLabel}.pdf`,
            file_size: `${Math.floor(Math.random() * 400 + 100)} Ko`,
            generated_at: new Date().toLocaleString('fr-FR'),
          };

          setHistory((prev) => [newHistoryEntry, ...prev]);
          setSuccessMessage(`PDF "${jobLabel}.pdf" genere avec succes !`);

          // Clear job after delay
          setTimeout(() => {
            setCurrentJob(null);
          }, 3000);
        } else {
          setCurrentJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'processing',
                  progress: Math.round(progress),
                }
              : null
          );
        }
      }, 500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exportType, entityId, weekStart, weekEnd]
  );

  const handleGenerate = () => {
    if (!entityId && exportType !== 'semester') {
      setErrorMessage(`Veuillez selectionner un(e) ${getEntityLabel().toLowerCase()}.`);

      return;
    }

    const entityOptions = getEntityOptions();
    const selectedEntity = entityOptions.find((e) => e.id === entityId);
    const label = selectedEntity
      ? `EDT_${selectedEntity.name.replace(/\s+/g, '_')}`
      : `EDT_Export_${exportType}`;

    simulateGeneration(label);
  };

  const handleCancelGeneration = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setCurrentJob(null);
    setErrorMessage('Generation annulee.');
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleQuickExport = (label: string, type: PdfExportType) => {
    setExportType(type);
    simulateGeneration(label);
  };

  const handleDownload = (entry: PdfExportHistory) => {
    setHistory((prev) =>
      prev.map((h) =>
        h.id === entry.id ? { ...h, downloaded_at: new Date().toLocaleString('fr-FR') } : h
      )
    );

    setSuccessMessage(`Telechargement de "${entry.file_name}" lance.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteHistory = (entryId: number) => {
    setHistory((prev) => prev.filter((h) => h.id !== entryId));
    setSuccessMessage('Export supprime de l\'historique.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStatusLabel = (status: PdfExportJob['status']): string => {
    const labels: Record<PdfExportJob['status'], string> = {
      pending: 'En attente...',
      processing: 'Generation en cours...',
      completed: 'Termine !',
      failed: 'Erreur',
    };

    return labels[status];
  };

  const getStatusColor = (
    status: PdfExportJob['status']
  ): 'info' | 'warning' | 'success' | 'error' => {
    const colors: Record<PdfExportJob['status'], 'info' | 'warning' | 'success' | 'error'> = {
      pending: 'info',
      processing: 'warning',
      completed: 'success',
      failed: 'error',
    };

    return colors[status];
  };

  const isGenerating = currentJob !== null && currentJob.status !== 'completed';

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Accueil
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Emplois du Temps
        </Link>
        <Typography color="text.primary">Export PDF</Typography>
      </Breadcrumbs>

      {/* Title + Nav */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Export PDF Emplois du Temps
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<span>&#128197;</span>}
            onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}
          >
            Planification
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<span>&#128202;</span>}
            onClick={() => router.push(`/${lang}/admin/timetable/statistics`)}
          >
            Statistiques
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<span>&#128276;</span>}
            onClick={() => router.push(`/${lang}/admin/timetable/notifications`)}
          >
            Notifications
          </Button>
        </Box>
      </Box>

      {/* Success / Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ──── LEFT COLUMN: Export Configuration ──── */}
        <Grid item xs={12} md={7}>
          {/* Export Configuration Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Configuration de l'export
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Export Type Selector */}
              <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                  Type d'export
                </FormLabel>
                <RadioGroup
                  row
                  value={exportType}
                  onChange={(e) => {
                    setExportType(e.target.value as PdfExportType);
                    setEntityId(0);
                  }}
                >
                  {(Object.keys(EXPORT_TYPE_LABELS) as PdfExportType[]).map((type) => (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio size="small" />}
                      label={
                        <Chip
                          label={EXPORT_TYPE_LABELS[type]}
                          size="small"
                          variant={exportType === type ? 'filled' : 'outlined'}
                          sx={{
                            bgcolor:
                              exportType === type ? EXPORT_TYPE_COLORS[type] : 'transparent',
                            color: exportType === type ? '#fff' : 'text.primary',
                            borderColor: EXPORT_TYPE_COLORS[type],
                            cursor: 'pointer',
                          }}
                        />
                      }
                      sx={{ mr: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Entity Selector */}
              {exportType !== 'semester' && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>{getEntityLabel()}</InputLabel>
                  <Select
                    value={entityId}
                    label={getEntityLabel()}
                    onChange={(e) => setEntityId(e.target.value as number)}
                  >
                    <MenuItem value={0} disabled>
                      Selectionner un(e) {getEntityLabel().toLowerCase()}
                    </MenuItem>
                    {getEntityOptions().map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Semester Selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Semestre</InputLabel>
                <Select
                  value={semesterId}
                  label="Semestre"
                  onChange={(e) => setSemesterId(e.target.value as number)}
                >
                  {DEMO_SEMESTERS.map((sem) => (
                    <MenuItem key={sem.id} value={sem.id}>
                      {sem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Week Range */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Periode (plage de semaines)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  label="Debut"
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Fin"
                  type="date"
                  value={weekEnd}
                  onChange={(e) => setWeekEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Options Toggles */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Options d'export
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Inclure les exceptions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Affiche les annulations, remplacements et changements de salle
                    </Typography>
                  </Box>
                  <Switch
                    checked={includeExceptions}
                    onChange={() => setIncludeExceptions(!includeExceptions)}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Inclure les notes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ajoute les annotations et remarques sur les seances
                    </Typography>
                  </Box>
                  <Switch
                    checked={includeNotes}
                    onChange={() => setIncludeNotes(!includeNotes)}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Mode compact
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reduit l'espacement pour tenir sur moins de pages
                    </Typography>
                  </Box>
                  <Switch
                    checked={compactMode}
                    onChange={() => setCompactMode(!compactMode)}
                    size="small"
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Orientation Selector */}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                  Orientation de la page
                </FormLabel>
                <RadioGroup
                  row
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as PdfOrientation)}
                >
                  <FormControlLabel
                    value="portrait"
                    control={<Radio size="small" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 22,
                            border: '2px solid',
                            borderColor:
                              orientation === 'portrait' ? 'primary.main' : 'text.secondary',
                            borderRadius: 0.5,
                          }}
                        />
                        <Typography variant="body2">Portrait</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="landscape"
                    control={<Radio size="small" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 22,
                            height: 16,
                            border: '2px solid',
                            borderColor:
                              orientation === 'landscape' ? 'primary.main' : 'text.secondary',
                            borderRadius: 0.5,
                          }}
                        />
                        <Typography variant="body2">Paysage</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {/* Generate Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGenerate}
                disabled={isGenerating}
                sx={{ fontWeight: 'bold', py: 1.5 }}
              >
                {isGenerating ? 'Generation en cours...' : 'Generer le PDF'}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Card */}
          {currentJob && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Progression de la generation
                  </Typography>
                  <Chip
                    label={getStatusLabel(currentJob.status)}
                    size="small"
                    color={getStatusColor(currentJob.status)}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {currentJob.status === 'pending' && 'Initialisation...'}
                      {currentJob.status === 'processing' &&
                        `Traitement des donnees (${currentJob.progress}%)`}
                      {currentJob.status === 'completed' && 'PDF pret au telechargement !'}
                      {currentJob.status === 'failed' && (currentJob.error || 'Erreur inconnue')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {currentJob.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={currentJob.progress}
                    color={getStatusColor(currentJob.status)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {currentJob.status === 'completed' && currentJob.file_name && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Le fichier "{currentJob.file_name}" est pret.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {isGenerating && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleCancelGeneration}
                    >
                      Annuler
                    </Button>
                  )}
                  {currentJob.status === 'completed' && (
                    <Button variant="contained" size="small" color="success">
                      Telecharger le PDF
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* ──── RIGHT COLUMN: Quick Export + Summary ──── */}
        <Grid item xs={12} md={5}>
          {/* Quick Export Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Exports rapides
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generez rapidement un PDF avec des parametres pre-configures.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={isGenerating}
                  onClick={() => handleQuickExport('EDT_Semaine_Courante', 'group')}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.2,
                    borderColor: '#1976d2',
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600}>
                      EDT Semaine courante
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tous les groupes - semaine en cours - paysage
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  disabled={isGenerating}
                  onClick={() => handleQuickExport('EDT_Mois_Courant', 'group')}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.2,
                    borderColor: '#7b1fa2',
                    '&:hover': { bgcolor: '#f3e5f5' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600}>
                      EDT Mois courant
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tous les groupes - mois en cours - compact - paysage
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  disabled={isGenerating}
                  onClick={() => handleQuickExport('Planning_Semestre_Complet', 'semester')}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.2,
                    borderColor: '#c62828',
                    '&:hover': { bgcolor: '#ffebee' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600}>
                      Planning Semestre complet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Semestre selectionne - toutes les semaines - compact
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  disabled={isGenerating}
                  onClick={() => handleQuickExport('Occupation_Salles_Semaine', 'room')}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.2,
                    borderColor: '#388e3c',
                    '&:hover': { bgcolor: '#e8f5e9' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600}>
                      Occupation salles - Semaine
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toutes les salles - semaine courante - portrait
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  disabled={isGenerating}
                  onClick={() => handleQuickExport('EDT_Enseignants_Semaine', 'teacher')}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.2,
                    borderColor: '#f57c00',
                    '&:hover': { bgcolor: '#fff3e0' },
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600}>
                      EDT Enseignants - Semaine
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tous les enseignants - semaine courante - paysage
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Export Summary Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Resume de la configuration
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Type:
                    </Typography>
                    <Chip
                      label={EXPORT_TYPE_LABELS[exportType]}
                      size="small"
                      sx={{
                        bgcolor: EXPORT_TYPE_COLORS[exportType],
                        color: '#fff',
                        height: 22,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Entite:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getEntityOptions().find((e) => e.id === entityId)?.name ||
                        'Non selectionne'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Semestre:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {DEMO_SEMESTERS.find((s) => s.id === semesterId)?.name || '-'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Periode:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {weekStart} au {weekEnd}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Orientation:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {orientation === 'portrait' ? 'Portrait' : 'Paysage'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Options:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {includeExceptions && (
                        <Chip label="Exceptions" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                      {includeNotes && (
                        <Chip label="Notes" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                      {compactMode && (
                        <Chip label="Compact" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                      {!includeExceptions && !includeNotes && !compactMode && (
                        <Typography variant="caption" color="text.secondary">
                          Aucune
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </CardContent>
          </Card>

          {/* Statistics Mini Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Statistiques d'export
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {history.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Exports generes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {history.filter((h) => h.downloaded_at).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Telecharges
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {new Set(history.map((h) => h.type)).size}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Types utilises
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {history.filter((h) => !h.downloaded_at).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Non telecharges
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ──── FULL WIDTH: Export History Table ──── */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Historique des exports
                </Typography>
                <Chip
                  label={`${history.length} export(s)`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {history.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Aucun export dans l'historique.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generez votre premier PDF pour le voir apparaitre ici.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Entite</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Periode</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fichier</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">
                          Taille
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date de generation</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">
                          Statut
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((entry) => (
                        <TableRow key={entry.id} hover>
                          <TableCell>
                            <Chip
                              label={EXPORT_TYPE_LABELS[entry.type]}
                              size="small"
                              sx={{
                                bgcolor: EXPORT_TYPE_COLORS[entry.type],
                                color: '#fff',
                                height: 22,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {entry.entity_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{entry.period}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                            >
                              {entry.file_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {entry.file_size}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{entry.generated_at}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            {entry.downloaded_at ? (
                              <Tooltip title={`Telecharge le ${entry.downloaded_at}`}>
                                <Chip
                                  label="Telecharge"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: 22, fontSize: '0.7rem' }}
                                />
                              </Tooltip>
                            ) : (
                              <Chip
                                label="Disponible"
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.7rem' }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="Telecharger">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleDownload(entry)}
                                >
                                  <span style={{ fontSize: '1rem' }}>&#11015;</span>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteHistory(entry.id)}
                                >
                                  <span style={{ fontSize: '1rem' }}>&#128465;</span>
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {history.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Les fichiers sont conserves pendant 30 jours. Pensez a telecharger vos exports
                    importants.
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    onClick={() => setHistory([])}
                  >
                    Vider l'historique
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
