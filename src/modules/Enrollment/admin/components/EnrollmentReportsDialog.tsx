/**
 * Enrollment Reports Dialog Component
 * Dialog for generating and exporting enrollment reports
 */

'use client';

import React, { useState } from 'react';
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
} from '@mui/material';

interface EnrollmentReportsDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerateExecutiveSummary: () => Promise<void>;
  onGenerateDashboard: () => Promise<void>;
  onExportExcel: (options?: { include_demographics?: boolean; include_pedagogical?: boolean }) => Promise<void>;
  generating?: boolean;
  exporting?: boolean;
  error?: Error | null;
}

type ReportType = 'executive' | 'dashboard' | 'excel';

interface ReportOption {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
  format: 'PDF' | 'Excel';
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'executive',
    title: 'Rapport Exécutif',
    description: 'Synthèse 1-2 pages avec KPIs et indicateurs clés pour la direction',
    icon: 'ri-file-chart-line',
    format: 'PDF',
  },
  {
    id: 'dashboard',
    title: 'Tableau de Bord Complet',
    description: 'Rapport détaillé avec tous les graphiques et analyses statistiques',
    icon: 'ri-dashboard-line',
    format: 'PDF',
  },
  {
    id: 'excel',
    title: 'Export Excel',
    description: 'Données brutes exportées pour analyse pivot et traitement personnalisé',
    icon: 'ri-file-excel-2-line',
    format: 'Excel',
  },
];

export const EnrollmentReportsDialog: React.FC<EnrollmentReportsDialogProps> = ({
  open,
  onClose,
  onGenerateExecutiveSummary,
  onGenerateDashboard,
  onExportExcel,
  generating = false,
  exporting = false,
  error,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [excelOptions, setExcelOptions] = useState({
    include_demographics: true,
    include_pedagogical: true,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const isProcessing = generating || exporting;

  const handleReportSelect = (reportId: ReportType) => {
    setSelectedReport(reportId);
    setLocalError(null);
  };

  const handleGenerate = async () => {
    if (!selectedReport) return;

    setLocalError(null);

    try {
      switch (selectedReport) {
        case 'executive':
          await onGenerateExecutiveSummary();
          break;
        case 'dashboard':
          await onGenerateDashboard();
          break;
        case 'excel':
          await onExportExcel(excelOptions);
          break;
      }
      // Close dialog on success
      handleClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedReport(null);
      setLocalError(null);
      onClose();
    }
  };

  const handleExcelOptionChange = (option: keyof typeof excelOptions) => {
    setExcelOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-file-download-line" style={{ fontSize: 24 }} />
          <Typography variant="h6">Générer un Rapport</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {localError || error?.message || 'Une erreur est survenue'}
          </Alert>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Sélectionnez le type de rapport à générer
        </Typography>

        <Grid container spacing={2}>
          {REPORT_OPTIONS.map((option) => (
            <Grid item xs={12} md={4} key={option.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderColor: selectedReport === option.id ? 'primary.main' : 'divider',
                  borderWidth: selectedReport === option.id ? 2 : 1,
                  bgcolor: selectedReport === option.id ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s',
                }}
              >
                <CardActionArea
                  onClick={() => handleReportSelect(option.id)}
                  disabled={isProcessing}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: selectedReport === option.id ? 'primary.main' : 'action.hover',
                          color: selectedReport === option.id ? 'white' : 'text.primary',
                          mb: 2,
                        }}
                      >
                        <i className={option.icon} style={{ fontSize: 28 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {option.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {option.description}
                      </Typography>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: option.format === 'PDF' ? 'error.lighter' : 'success.lighter',
                          color: option.format === 'PDF' ? 'error.main' : 'success.main',
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

        {/* Excel Options */}
        {selectedReport === 'excel' && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Options d'export Excel
            </Typography>
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={excelOptions.include_demographics}
                    onChange={() => handleExcelOptionChange('include_demographics')}
                    disabled={isProcessing}
                  />
                }
                label="Inclure les données démographiques"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={excelOptions.include_pedagogical}
                    onChange={() => handleExcelOptionChange('include_pedagogical')}
                    disabled={isProcessing}
                  />
                }
                label="Inclure les statistiques pédagogiques"
              />
            </FormControl>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isProcessing} color="inherit">
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!selectedReport || isProcessing}
          startIcon={
            isProcessing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <i className="ri-download-line" />
            )
          }
        >
          {isProcessing
            ? generating
              ? 'Génération...'
              : 'Export...'
            : 'Générer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
