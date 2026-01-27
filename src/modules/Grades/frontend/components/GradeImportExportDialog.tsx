'use client';

import React, { useState, useCallback, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import type { ImportGradesPreviewResponse, ImportGradesResult } from '../../types/grade.types';

/**
 * Props for GradeImportExportDialog
 */
interface GradeImportExportDialogProps {
  open: boolean;
  onClose: () => void;
  evaluationId: number;
  evaluationName: string;
  onExportTemplate: (evaluationId: number) => Promise<void>;
  onExportAbsents: (evaluationId: number) => Promise<void>;
  onPreviewImport: (evaluationId: number, file: File) => Promise<ImportGradesPreviewResponse>;
  onExecuteImport: (evaluationId: number, overwrite: boolean) => Promise<ImportGradesResult>;
  onImportComplete: () => void;
  exporting: boolean;
  importing: boolean;
  previewLoading: boolean;
  importPreview: ImportGradesPreviewResponse | null;
  importResult: ImportGradesResult | null;
  exportError: Error | null;
  importError: Error | null;
  resetImport: () => void;
}

/**
 * Tab Panel Component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && children}
  </div>
);

/**
 * GradeImportExportDialog Component
 * Dialog for importing and exporting grades
 */
export const GradeImportExportDialog: React.FC<GradeImportExportDialogProps> = ({
  open,
  onClose,
  evaluationId,
  evaluationName,
  onExportTemplate,
  onExportAbsents,
  onPreviewImport,
  onExecuteImport,
  onImportComplete,
  exporting,
  importing,
  previewLoading,
  importPreview,
  importResult,
  exportError,
  importError,
  resetImport,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle tab change
   */
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      resetImport();
      setSelectedFile(null);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        try {
          await onPreviewImport(evaluationId, file);
        } catch (err) {
          console.error('Error previewing import:', err);
        }
      }
    },
    [evaluationId, onPreviewImport]
  );

  /**
   * Handle import execution
   */
  const handleExecuteImport = useCallback(async () => {
    try {
      await onExecuteImport(evaluationId, overwriteExisting);
      onImportComplete();
    } catch (err) {
      console.error('Error executing import:', err);
    }
  }, [evaluationId, overwriteExisting, onExecuteImport, onImportComplete]);

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!importing && !exporting) {
      resetImport();
      setSelectedFile(null);
      setTabValue(0);
      onClose();
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <i className="ri-checkbox-circle-fill" style={{ color: '#4caf50', fontSize: 18 }} />;
      case 'warning':
        return <i className="ri-error-warning-fill" style={{ color: '#ff9800', fontSize: 18 }} />;
      case 'error':
        return <i className="ri-close-circle-fill" style={{ color: '#f44336', fontSize: 18 }} />;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Import/Export Notes - {evaluationName}</Typography>
          <IconButton onClick={handleClose} disabled={importing || exporting}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            icon={<i className="ri-download-line" style={{ fontSize: 20 }} />}
            label="Exporter"
            iconPosition="start"
          />
          <Tab
            icon={<i className="ri-upload-line" style={{ fontSize: 20 }} />}
            label="Importer"
            iconPosition="start"
          />
        </Tabs>

        {/* Export Tab */}
        <TabPanel value={tabValue} index={0}>
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erreur lors de l'export: {exportError.message}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            {/* Export Template */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Template de saisie
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fichier Excel avec la liste des étudiants et colonnes de notes
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={
                    exporting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <i className="ri-download-line" />
                    )
                  }
                  onClick={() => onExportTemplate(evaluationId)}
                  disabled={exporting}
                >
                  Télécharger
                </Button>
              </Box>
            </Paper>

            {/* Export Absents */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Liste des absents
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export de la liste des étudiants marqués absents
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={
                    exporting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <i className="ri-download-line" />
                    )
                  }
                  onClick={() => onExportAbsents(evaluationId)}
                  disabled={exporting}
                >
                  Télécharger
                </Button>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Import Tab */}
        <TabPanel value={tabValue} index={1}>
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erreur lors de l'import: {importError.message}
            </Alert>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert
              severity={importResult.errors > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              Import terminé: {importResult.imported} importées, {importResult.updated} mises à jour,{' '}
              {importResult.skipped} ignorées, {importResult.errors} erreurs
            </Alert>
          )}

          {/* File Upload */}
          {!importPreview && !importResult && (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
              {previewLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <i
                    className="ri-upload-cloud-2-line"
                    style={{ fontSize: 48, color: '#9e9e9e', display: 'block', marginBottom: 8 }}
                  />
                  <Typography variant="subtitle1">
                    Cliquez ou glissez un fichier ici
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formats acceptés: .xlsx, .xls, .csv
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Preview Table */}
          {importPreview && !importResult && (
            <>
              {/* Preview Summary */}
              <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                <Chip
                  label={`${importPreview.total_rows} lignes`}
                  color="default"
                />
                <Chip
                  icon={<i className="ri-checkbox-circle-fill" style={{ color: '#4caf50' }} />}
                  label={`${importPreview.valid_rows} valides`}
                  color="success"
                  variant="outlined"
                />
                {importPreview.warning_rows > 0 && (
                  <Chip
                    icon={<i className="ri-error-warning-fill" style={{ color: '#ff9800' }} />}
                    label={`${importPreview.warning_rows} avertissements`}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {importPreview.error_rows > 0 && (
                  <Chip
                    icon={<i className="ri-close-circle-fill" style={{ color: '#f44336' }} />}
                    label={`${importPreview.error_rows} erreurs`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Preview Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Statut</TableCell>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell>Absent</TableCell>
                      <TableCell>Messages</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.preview.slice(0, 50).map((row) => (
                      <TableRow
                        key={row.row_number}
                        sx={{
                          bgcolor:
                            row.status === 'error'
                              ? 'error.lighter'
                              : row.status === 'warning'
                              ? 'warning.lighter'
                              : 'transparent',
                        }}
                      >
                        <TableCell>{getStatusIcon(row.status)}</TableCell>
                        <TableCell>{row.matricule}</TableCell>
                        <TableCell>{row.student_name}</TableCell>
                        <TableCell>{row.score !== null ? row.score : '-'}</TableCell>
                        <TableCell>{row.is_absent ? 'Oui' : 'Non'}</TableCell>
                        <TableCell>
                          {row.errors.length > 0 && (
                            <Typography variant="caption" color="error">
                              {row.errors.join(', ')}
                            </Typography>
                          )}
                          {row.warnings.length > 0 && (
                            <Typography variant="caption" color="warning.main">
                              {row.warnings.join(', ')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {importPreview.preview.length > 50 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Affichage des 50 premières lignes sur {importPreview.total_rows}
                </Typography>
              )}

              {/* Import Options */}
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={overwriteExisting}
                      onChange={(e) => setOverwriteExisting(e.target.checked)}
                    />
                  }
                  label="Écraser les notes existantes"
                />
              </Box>
            </>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={importing || exporting}>
          {importResult ? 'Fermer' : 'Annuler'}
        </Button>

        {tabValue === 1 && importPreview && !importResult && (
          <>
            <Button
              onClick={() => {
                resetImport();
                setSelectedFile(null);
              }}
              disabled={importing}
            >
              Changer de fichier
            </Button>
            <Button
              variant="contained"
              onClick={handleExecuteImport}
              disabled={importing || importPreview.error_rows === importPreview.total_rows}
              startIcon={
                importing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <i className="ri-upload-line" />
                )
              }
            >
              {importing ? 'Import en cours...' : 'Importer'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
