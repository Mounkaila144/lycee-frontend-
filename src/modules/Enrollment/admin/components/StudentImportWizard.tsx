'use client';

import { useCallback, useRef } from 'react';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

// Hook Imports
import { useStudentImport, type ImportStep } from '../hooks/useStudentImport';

// Type Imports
import type { ImportColumnMapping, StudentFormData } from '../../types/student.types';

interface StudentImportWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const steps: { key: ImportStep; label: string }[] = [
  { key: 'upload', label: 'Télécharger' },
  { key: 'mapping', label: 'Mapper les colonnes' },
  { key: 'preview', label: 'Prévisualiser' },
  { key: 'importing', label: 'Import' },
  { key: 'complete', label: 'Terminé' },
];

const fieldLabels: Record<keyof StudentFormData | 'programme_code', string> = {
  firstname: 'Prénom',
  lastname: 'Nom',
  birthdate: 'Date de naissance',
  birthplace: 'Lieu de naissance',
  sex: 'Sexe',
  email: 'Email',
  phone: 'Téléphone',
  mobile: 'Mobile',
  address: 'Adresse',
  city: 'Ville',
  country: 'Pays',
  nationality: 'Nationalité',
  photo: 'Photo',
  emergency_contact_name: 'Contact urgence (nom)',
  emergency_contact_phone: 'Contact urgence (tél)',
  programme_id: 'ID Programme',
  programme_code: 'Code Programme',
};

export const StudentImportWizard = ({
  open,
  onClose,
  onSuccess,
}: StudentImportWizardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    step,
    file,
    preview,
    columnMapping,
    importMode,
    generateMatricules,
    skipDuplicates,
    result,
    jobStatus,
    error,
    isUploading,
    isExecuting,
    uploadFile,
    updateColumnMapping,
    setImportMode,
    setGenerateMatricules,
    setSkipDuplicates,
    proceedToPreview,
    executeImport,
    downloadTemplate,
    downloadReport,
    reset,
    goBack,
    clearError,
  } = useStudentImport();

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        // Validate file type
        const allowedTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        const isValidType =
          allowedTypes.includes(selectedFile.type) ||
          selectedFile.name.endsWith('.csv') ||
          selectedFile.name.endsWith('.xlsx');

        if (!isValidType) {
          return;
        }

        // Validate file size (10MB max)
        if (selectedFile.size > 10 * 1024 * 1024) {
          return;
        }

        uploadFile(selectedFile);
      }
    },
    [uploadFile]
  );

  // Handle column mapping change
  const handleMappingChange = useCallback(
    (csvColumn: string, fieldName: string | null) => {
      if (!columnMapping || !csvColumn) return;

      const newMapping = columnMapping.map((m) =>
        m?.csvColumn === csvColumn
          ? { ...m, fieldName: fieldName as keyof StudentFormData | 'programme_code' | null }
          : m
      );
      updateColumnMapping(newMapping);
    },
    [columnMapping, updateColumnMapping]
  );

  // Handle close
  const handleClose = () => {
    reset();
    onClose();
  };

  // Handle completion
  const handleComplete = () => {
    onSuccess?.();
    handleClose();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      uploadFile(droppedFile);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h5">Import en Masse d'Étudiants</Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
          {steps.map((s) => (
            <Step key={s.key}>
              <StepLabel>{s.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Box>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6">Télécharger le fichier CSV/Excel</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<i className="ri-download-line" />}
                onClick={downloadTemplate}
              >
                Télécharger le template
              </Button>
            </Box>

            <Box
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <input
                key={file ? 'file-selected' : 'no-file'}
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {isUploading ? (
                <Box>
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                  <Typography>Analyse du fichier en cours...</Typography>
                </Box>
              ) : (
                <Box>
                  <i
                    className="ri-upload-cloud-2-line"
                    style={{ fontSize: 64, color: 'var(--mui-palette-primary-main)' }}
                  />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Glissez-déposez votre fichier ici
                  </Typography>
                  <Typography color="text.secondary">
                    ou cliquez pour sélectionner un fichier
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Formats supportés: CSV, XLSX (max 10 Mo, max 1000 lignes)
                  </Typography>
                </Box>
              )}
            </Box>

            {file && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<i className="ri-file-excel-line" />}
                  label={file.name}
                  onDelete={() => reset()}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && preview && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Associer les colonnes du fichier aux champs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {preview.total_rows ?? 0} lignes détectées. Encodage: {preview.detected_encoding ?? 'UTF-8'}
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Colonne CSV</TableCell>
                    <TableCell>Champ correspondant</TableCell>
                    <TableCell>Obligatoire</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(columnMapping || []).map((mapping) => (
                    <TableRow key={mapping?.csvColumn || Math.random()}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {mapping?.csvColumn || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={mapping?.fieldName ?? ''}
                            onChange={(e) =>
                              handleMappingChange(mapping?.csvColumn || '', e.target.value || null)
                            }
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>-- Ignorer --</em>
                            </MenuItem>
                            {Object.entries(fieldLabels).map(([key, label]) => (
                              <MenuItem key={key} value={key}>
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {mapping?.required && (
                          <Chip label="Obligatoire" size="small" color="error" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Import Options */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Options d'import
              </Typography>

              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Mode d'import
                </Typography>
                <RadioGroup
                  value={importMode || 'complete'}
                  onChange={(e) => setImportMode(e.target.value as any)}
                >
                  <FormControlLabel
                    value="complete"
                    control={<Radio />}
                    label="Import complet - Importer toutes les lignes valides, ignorer les erreurs"
                  />
                  <FormControlLabel
                    value="strict"
                    control={<Radio />}
                    label="Import strict - Abandonner si une seule erreur est détectée"
                  />
                  <FormControlLabel
                    value="update"
                    control={<Radio />}
                    label="Mode mise à jour - Mettre à jour si l'étudiant existe (par email)"
                  />
                </RadioGroup>
              </FormControl>

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generateMatricules ?? true}
                      onChange={(e) => setGenerateMatricules(e.target.checked)}
                    />
                  }
                  label="Générer automatiquement les matricules"
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={skipDuplicates ?? false}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                    />
                  }
                  label="Ignorer les doublons potentiels"
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && preview && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Prévisualisation de l'import
            </Typography>

            {/* Summary Cards */}
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card variant="outlined">
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="text.primary">
                    {preview.total_rows ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total lignes
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="success.main">
                    {preview.valid_rows ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valides
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="warning.main">
                    {preview.warning_rows ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avertissements
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="error.main">
                    {preview.error_rows ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Erreurs
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Preview Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Ligne</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Détails</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(preview.preview || []).slice(0, 50).map((row) => (
                    <TableRow
                      key={row.rowNumber}
                      sx={{
                        bgcolor:
                          row.status === 'error'
                            ? 'error.lighter'
                            : row.status === 'warning'
                            ? 'warning.lighter'
                            : undefined,
                      }}
                    >
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            row.status === 'valid'
                              ? 'Valide'
                              : row.status === 'warning'
                              ? 'Avertissement'
                              : 'Erreur'
                          }
                          size="small"
                          color={
                            row.status === 'valid'
                              ? 'success'
                              : row.status === 'warning'
                              ? 'warning'
                              : 'error'
                          }
                        />
                        {row.isDuplicate && (
                          <Chip
                            label="Doublon"
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ ml: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {row.data['firstname'] || row.data['prenom']} {row.data['lastname'] || row.data['nom']}
                      </TableCell>
                      <TableCell>{row.data['email']}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 && (
                          <Tooltip
                            title={row.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}
                          >
                            <Typography variant="caption" color="error">
                              {row.errors.length} erreur(s)
                            </Typography>
                          </Tooltip>
                        )}
                        {row.warnings.length > 0 && (
                          <Tooltip title={row.warnings.join(', ')}>
                            <Typography variant="caption" color="warning.main">
                              {row.warnings.length} avertissement(s)
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {(preview.total_rows ?? 0) > 50 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Affichage des 50 premières lignes sur {preview.total_rows ?? 0}
              </Typography>
            )}
          </Box>
        )}

        {/* Step 4: Importing */}
        {step === 'importing' && jobStatus && (
          <Box className="text-center" sx={{ py: 4 }}>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Import en cours...
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={jobStatus.progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {jobStatus.processed} / {jobStatus.total} lignes traitées ({jobStatus.progress}%)
              </Typography>
            </Box>
            <Box className="flex justify-center gap-4">
              <Chip label={`${jobStatus.created} créés`} color="success" variant="outlined" />
              <Chip label={`${jobStatus.updated} mis à jour`} color="info" variant="outlined" />
              <Chip label={`${jobStatus.errors} erreurs`} color="error" variant="outlined" />
            </Box>
          </Box>
        )}

        {/* Step 5: Complete */}
        {step === 'complete' && (
          <Box sx={{ py: 4 }}>
            <Box className="text-center">
              {(result?.errors === 0 && (!jobStatus || jobStatus.errors === 0)) ? (
                <i
                  className="ri-checkbox-circle-line"
                  style={{ fontSize: 64, color: 'var(--mui-palette-success-main)' }}
                />
              ) : (result?.created || 0) > 0 ? (
                <i
                  className="ri-error-warning-line"
                  style={{ fontSize: 64, color: 'var(--mui-palette-warning-main)' }}
                />
              ) : (
                <i
                  className="ri-close-circle-line"
                  style={{ fontSize: 64, color: 'var(--mui-palette-error-main)' }}
                />
              )}

              <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
                {(result?.created || 0) > 0
                  ? 'Import terminé'
                  : 'Échec de l\'import'}
              </Typography>
            </Box>

            {/* Results Summary */}
            <Box className="flex justify-center gap-4 mb-4">
              <Card variant="outlined" sx={{ minWidth: 120 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="success.main">
                    {result?.created || jobStatus?.created || 0}
                  </Typography>
                  <Typography variant="body2">Créés</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 120 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="info.main">
                    {result?.updated || jobStatus?.updated || 0}
                  </Typography>
                  <Typography variant="body2">Mis à jour</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 120 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="text.secondary">
                    {result?.skipped || 0}
                  </Typography>
                  <Typography variant="body2">Ignorés</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 120 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" color="error.main">
                    {result?.errors || jobStatus?.errors || 0}
                  </Typography>
                  <Typography variant="body2">Erreurs</Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Error Details */}
            {(result?.errors || 0) > 0 && result?.results && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <AlertTitle>Erreurs lors de l'import</AlertTitle>
                  Les lignes suivantes n'ont pas pu être importées :
                </Alert>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ligne</TableCell>
                        <TableCell>Erreur</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.results
                        .filter((r: any) => r.status === 'error')
                        .map((row: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{row.row_number}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error">
                                {row.error}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Success Details */}
            {(result?.created || 0) > 0 && result?.results && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Étudiants importés avec succès</AlertTitle>
                  {result.created} étudiant(s) ont été créés.
                </Alert>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Matricule</TableCell>
                        <TableCell>Nom</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.results
                        .filter((r: any) => r.status === 'created')
                        .map((row: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{row.matricule || '-'}</TableCell>
                            <TableCell>{row.student_name || '-'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === 'upload' && (
          <Button onClick={handleClose} color="secondary">
            Annuler
          </Button>
        )}

        {step === 'mapping' && (
          <>
            <Button onClick={goBack} color="secondary">
              Retour
            </Button>
            <Button onClick={proceedToPreview} variant="contained">
              Prévisualiser
            </Button>
          </>
        )}

        {step === 'preview' && (
          <>
            <Button onClick={goBack} color="secondary">
              Retour
            </Button>
            <Button
              onClick={executeImport}
              variant="contained"
              disabled={isExecuting || (preview?.valid_rows === 0)}
              startIcon={
                isExecuting ? <CircularProgress size={20} color="inherit" /> : <i className="ri-upload-2-line" />
              }
            >
              {isExecuting ? 'Lancement...' : `Importer ${preview?.valid_rows || 0} étudiants`}
            </Button>
          </>
        )}

        {step === 'importing' && (
          <Button onClick={handleClose} color="secondary">
            Exécuter en arrière-plan
          </Button>
        )}

        {step === 'complete' && (
          <Button onClick={handleComplete} variant="contained">
            Terminer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentImportWizard;
