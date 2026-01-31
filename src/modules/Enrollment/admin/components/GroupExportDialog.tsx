/**
 * Group Export Dialog Component
 * Dialog for exporting group student lists in various formats
 */

'use client';

import React, { useState, useCallback } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  MenuItem,
  Slider,
  Collapse,
} from '@mui/material';

import { useTenant } from '@/shared/lib/tenant-context';

import { groupService } from '../services/groupService';

import type { Group, ExportFormat, ExportTemplate, ExportOrientation, ExportSortBy } from '../../types/group.types';

interface GroupExportDialogProps {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  onSuccess?: () => void;
}

type ExportType = 'pdf' | 'excel' | 'csv' | 'attendance';

interface ExportOption {
  id: ExportType;
  title: string;
  description: string;
  icon: string;
  format: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pdf',
    title: 'Liste PDF',
    description: 'Document imprimable avec mise en page professionnelle',
    icon: 'ri-file-pdf-2-line',
    format: 'PDF',
  },
  {
    id: 'excel',
    title: 'Export Excel',
    description: 'Fichier XLSX pour analyse et traitement',
    icon: 'ri-file-excel-2-line',
    format: 'Excel',
  },
  {
    id: 'csv',
    title: 'Export CSV',
    description: 'Format universel pour import dans d\'autres systèmes',
    icon: 'ri-file-text-line',
    format: 'CSV',
  },
  {
    id: 'attendance',
    title: 'Feuille d\'émargement',
    description: 'Tableau de signatures pour les présences',
    icon: 'ri-checkbox-multiple-line',
    format: 'PDF',
  },
];

const TEMPLATE_OPTIONS: { value: ExportTemplate; label: string; description: string }[] = [
  { value: 'group_list', label: 'Liste simple', description: 'Nom, Prénom, Matricule' },
  { value: 'group_list_complete', label: 'Liste complète', description: '+ Email, Téléphone' },
  { value: 'group_list_with_photos', label: 'Avec photos', description: 'Photos miniatures incluses' },
];

const SORT_OPTIONS: { value: ExportSortBy; label: string }[] = [
  { value: 'lastname', label: 'Nom (A-Z)' },
  { value: 'firstname', label: 'Prénom (A-Z)' },
  { value: 'matricule', label: 'Matricule' },
];

const ORIENTATION_OPTIONS: { value: ExportOrientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Paysage' },
];

export const GroupExportDialog: React.FC<GroupExportDialogProps> = ({
  open,
  onClose,
  group,
  onSuccess,
}) => {
  const { tenantId } = useTenant();

  // State
  const [selectedExport, setSelectedExport] = useState<ExportType | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF Options
  const [template, setTemplate] = useState<ExportTemplate>('group_list');
  const [orientation, setOrientation] = useState<ExportOrientation>('portrait');
  const [sortBy, setSortBy] = useState<ExportSortBy>('lastname');

  // Column options
  const [includeEmail, setIncludeEmail] = useState(true);
  const [includePhone, setIncludePhone] = useState(true);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [includeBirthdate, setIncludeBirthdate] = useState(false);
  const [includeOption, setIncludeOption] = useState(false);
  const [includeLevel, setIncludeLevel] = useState(true);
  const [includeNumbering, setIncludeNumbering] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);

  // Attendance specific
  const [sessionCount, setSessionCount] = useState<number>(12);

  const handleExportSelect = (exportId: ExportType) => {
    setSelectedExport(exportId);
    setError(null);

    // Set default orientation for attendance
    if (exportId === 'attendance') {
      setOrientation('landscape');
    } else {
      setOrientation('portrait');
    }
  };

  const openDownloadUrl = useCallback((downloadUrl: string) => {
    // Transform the URL to use the current origin if the backend returns a different host
    // This handles cases where APP_URL in Laravel doesn't match the actual domain
    try {
      const url = new URL(downloadUrl);
      const currentOrigin = window.location.origin;

      // Replace the origin with the current browser origin
      // Keep the pathname (e.g., /storage/tenants/exports/...)
      const correctedUrl = `${currentOrigin}${url.pathname}`;

      // Open the corrected URL in a new tab/window to trigger download
      window.open(correctedUrl, '_blank');
    } catch {
      // If URL parsing fails, try opening as-is
      window.open(downloadUrl, '_blank');
    }
  }, []);

  const handleExport = async () => {
    if (!selectedExport || !group) return;

    setExporting(true);
    setError(null);

    const options = {
      template,
      orientation,
      sort_by: sortBy,
      include_email: includeEmail,
      include_phone: includePhone,
      include_photo: includePhoto,
      include_birthdate: includeBirthdate,
      include_option: includeOption,
      include_level: includeLevel,
      include_numbering: includeNumbering,
      include_header: includeHeader,
    };

    try {
      let downloadUrl: string;

      switch (selectedExport) {
        case 'pdf':
          downloadUrl = await groupService.exportGroupToPdf(group.id, options, tenantId);
          break;
        case 'excel':
          downloadUrl = await groupService.exportGroupToExcel(group.id, options, tenantId);
          break;
        case 'csv':
          downloadUrl = await groupService.exportGroupToCsv(group.id, options, tenantId);
          break;
        case 'attendance':
          downloadUrl = await groupService.exportAttendanceSheet(group.id, sessionCount, options, tenantId);
          break;
        default:
          throw new Error('Type d\'export non reconnu');
      }

      openDownloadUrl(downloadUrl);
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    if (!exporting) {
      setSelectedExport(null);
      setError(null);
      setTemplate('group_list');
      setOrientation('portrait');
      setSortBy('lastname');
      setIncludeEmail(true);
      setIncludePhone(true);
      setIncludePhoto(false);
      setIncludeBirthdate(false);
      setIncludeOption(false);
      setIncludeLevel(true);
      setIncludeNumbering(true);
      setIncludeHeader(true);
      setSessionCount(12);
      onClose();
    }
  };

  const showPdfOptions = selectedExport === 'pdf';
  const showColumnOptions = selectedExport === 'pdf' || selectedExport === 'excel' || selectedExport === 'csv';
  const showAttendanceOptions = selectedExport === 'attendance';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-download-2-line" style={{ fontSize: 24 }} />
          <Box>
            <Typography variant="h6">Exporter la liste du groupe</Typography>
            {group && (
              <Typography variant="body2" color="text.secondary">
                {group.name} ({group.code}) - {group.current_count || 0} étudiants
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Sélectionnez le format d'export
        </Typography>

        <Grid container spacing={2}>
          {EXPORT_OPTIONS.map((option) => (
            <Grid item xs={12} sm={6} md={3} key={option.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderColor: selectedExport === option.id ? 'primary.main' : 'divider',
                  borderWidth: selectedExport === option.id ? 2 : 1,
                  bgcolor: selectedExport === option.id ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s',
                }}
              >
                <CardActionArea
                  onClick={() => handleExportSelect(option.id)}
                  disabled={exporting}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: selectedExport === option.id ? 'primary.main' : 'action.hover',
                          color: selectedExport === option.id ? 'white' : 'text.primary',
                          mb: 1.5,
                        }}
                      >
                        <i className={option.icon} style={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, minHeight: 32 }}>
                        {option.description}
                      </Typography>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor:
                            option.format === 'PDF'
                              ? 'error.lighter'
                              : option.format === 'Excel'
                                ? 'success.lighter'
                                : 'info.lighter',
                          color:
                            option.format === 'PDF'
                              ? 'error.main'
                              : option.format === 'Excel'
                                ? 'success.main'
                                : 'info.main',
                        }}
                      >
                        <Typography variant="caption" fontWeight={600}>
                          {option.format}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* PDF Options */}
        <Collapse in={showPdfOptions}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Options PDF
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Template"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as ExportTemplate)}
                  disabled={exporting}
                >
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box>
                        <Typography variant="body2">{opt.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opt.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Orientation"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as ExportOrientation)}
                  disabled={exporting}
                >
                  {ORIENTATION_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tri"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ExportSortBy)}
                  disabled={exporting}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Column Options */}
        <Collapse in={showColumnOptions}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Colonnes à inclure
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeNumbering}
                      onChange={(e) => setIncludeNumbering(e.target.checked)}
                      disabled={exporting}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Numérotation</Typography>}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeEmail}
                      onChange={(e) => setIncludeEmail(e.target.checked)}
                      disabled={exporting}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Email</Typography>}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includePhone}
                      onChange={(e) => setIncludePhone(e.target.checked)}
                      disabled={exporting}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Téléphone</Typography>}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeBirthdate}
                      onChange={(e) => setIncludeBirthdate(e.target.checked)}
                      disabled={exporting}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Date de naissance</Typography>}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeOption}
                      onChange={(e) => setIncludeOption(e.target.checked)}
                      disabled={exporting}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Option/Spécialité</Typography>}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeLevel}
                      onChange={(e) => setIncludeLevel(e.target.checked)}
                      disabled={exporting}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Niveau</Typography>}
                />
              </Grid>
              {selectedExport === 'pdf' && (
                <>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includePhoto}
                          onChange={(e) => setIncludePhoto(e.target.checked)}
                          disabled={exporting}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Photo</Typography>}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeHeader}
                          onChange={(e) => setIncludeHeader(e.target.checked)}
                          disabled={exporting}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">En-tête groupe</Typography>}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Collapse>

        {/* Attendance Sheet Options */}
        <Collapse in={showAttendanceOptions}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Options feuille d'émargement
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  Nombre de séances: {sessionCount}
                </Typography>
                <Slider
                  value={sessionCount}
                  onChange={(_, value) => setSessionCount(value as number)}
                  min={4}
                  max={20}
                  step={1}
                  marks={[
                    { value: 4, label: '4' },
                    { value: 8, label: '8' },
                    { value: 12, label: '12' },
                    { value: 16, label: '16' },
                    { value: 20, label: '20' },
                  ]}
                  disabled={exporting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tri"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ExportSortBy)}
                  disabled={exporting}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePhoto}
                    onChange={(e) => setIncludePhoto(e.target.checked)}
                    disabled={exporting}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Inclure photos miniatures</Typography>}
              />
            </Box>
          </Box>
        </Collapse>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={exporting} color="inherit">
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={!selectedExport || exporting}
          startIcon={
            exporting ? <CircularProgress size={20} color="inherit" /> : <i className="ri-download-line" />
          }
        >
          {exporting ? 'Export en cours...' : 'Exporter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupExportDialog;
