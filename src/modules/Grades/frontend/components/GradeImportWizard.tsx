'use client';

import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import { useGradeImport } from '../hooks/useGradeImport';
import { useTenant } from '@/shared/lib/tenant-context';
import ImportPreviewTable from './ImportPreviewTable';
import ImportProgress from './ImportProgress';

interface GradeImportWizardProps {
  evaluationId: number;
  evaluationName: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const steps = [
  'Télécharger le template',
  'Uploader le fichier',
  'Valider le fichier',
  'Prévisualiser',
  'Importer',
];

export default function GradeImportWizard({
  evaluationId,
  evaluationName,
  onComplete,
  onCancel,
}: GradeImportWizardProps) {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'add' | 'update' | 'overwrite'>('add');
  const [includeExisting, setIncludeExisting] = useState(false);

  const {
    selectedFile,
    validationResult,
    previewData,
    downloadTemplate,
    isDownloadingTemplate,
    downloadTemplateError,
    validateFile,
    isValidatingFile,
    validateFileError,
    previewFile,
    isPreviewingFile,
    previewFileError,
    executeImport,
    isExecutingImport,
    executeImportError,
    executeImportResult,
    reset,
  } = useGradeImport(tenantId);

  const handleDownloadTemplate = () => {
    downloadTemplate(
      { evaluationId, includeExisting },
      {
        onSuccess: () => {
          setActiveStep(1);
        },
      }
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      validateFile(file, {
        onSuccess: (result) => {
          if (result.valid) {
            setActiveStep(2);
          }
        },
      });
    }
  };

  const handlePreview = () => {
    if (uploadedFile) {
      previewFile(
        { file: uploadedFile, limit: 100 },
        {
          onSuccess: () => {
            setActiveStep(3);
          },
        }
      );
    }
  };

  const handleExecuteImport = () => {
    if (uploadedFile) {
      executeImport(
        {
          file: uploadedFile,
          evaluationId,
          importMode,
          async: true,
        },
        {
          onSuccess: (result) => {
            setActiveStep(4);
            if (!result.async && onComplete) {
              // Sync import completed
              setTimeout(() => onComplete(), 2000);
            }
          },
        }
      );
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setUploadedFile(null);
    setImportMode('add');
    setIncludeExisting(false);
    reset();
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Télécharger le template Excel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Téléchargez le template Excel pré-rempli avec la liste des étudiants et les colonnes
              d'évaluation configurées.
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Options du template</FormLabel>
              <FormControlLabel
                control={
                  <Radio
                    checked={!includeExisting}
                    onChange={() => setIncludeExisting(false)}
                  />
                }
                label="Template vide (pour nouvelle saisie)"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={includeExisting}
                    onChange={() => setIncludeExisting(true)}
                  />
                }
                label="Template avec notes existantes (pour modification)"
              />
            </FormControl>

            <Button
              variant="contained"
              startIcon={isDownloadingTemplate ? <CircularProgress size={20} /> : <i className='ri-download-line' />}
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
            >
              {isDownloadingTemplate ? 'Téléchargement...' : 'Télécharger le template'}
            </Button>

            {downloadTemplateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Erreur lors du téléchargement du template
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Uploader le fichier Excel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sélectionnez le fichier Excel rempli à importer. Format accepté: .xlsx, .xls (max 5MB)
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<i className='ri-upload-cloud-line' />}
              sx={{ mb: 2 }}
            >
              Choisir un fichier
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>

            {uploadedFile && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Fichier sélectionné: {uploadedFile.name}
              </Alert>
            )}

            {isValidatingFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography>Validation du fichier en cours...</Typography>
              </Box>
            )}

            {validateFileError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Erreur lors de la validation du fichier
              </Alert>
            )}

            {validationResult && !validationResult.valid && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fichier invalide
                </Typography>
                {validationResult.missing_columns && validationResult.missing_columns.length > 0 && (
                  <>
                    <Typography variant="body2">
                      Colonnes manquantes: {validationResult.missing_columns.join(', ')}
                    </Typography>
                  </>
                )}
              </Alert>
            )}

            {validationResult && validationResult.valid && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Fichier valide! Cliquez sur "Suivant" pour prévisualiser.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Prévisualiser les données
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vérifiez les données avant l'import. Les 100 premières lignes sont affichées.
            </Typography>

            {isPreviewingFile && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {previewFileError && (
              <Alert severity="error">
                Erreur lors de la prévisualisation du fichier
              </Alert>
            )}

            {previewData && (
              <ImportPreviewTable data={previewData.data} count={previewData.count} />
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Options d'import
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choisissez le mode d'import selon votre besoin.
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Mode d'import</FormLabel>
              <RadioGroup
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'add' | 'update' | 'overwrite')}
              >
                <FormControlLabel
                  value="add"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Ajout</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ajouter uniquement les notes qui n'existent pas encore
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="update"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Mise à jour</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mettre à jour uniquement les notes qui ont changé
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="overwrite"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Écrasement</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Remplacer toutes les notes existantes
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              startIcon={isExecutingImport ? <CircularProgress size={20} /> : <i className='ri-play-line' />}
              onClick={handleExecuteImport}
              disabled={isExecutingImport}
            >
              {isExecutingImport ? 'Import en cours...' : 'Lancer l\'import'}
            </Button>

            {executeImportError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Erreur lors de l'import des notes
              </Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Import terminé
            </Typography>

            {executeImportResult?.async ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Import en cours de traitement en arrière-plan
                </Typography>
                <Typography variant="body2">
                  Environ {executeImportResult.estimated_rows} lignes à traiter. Vous serez notifié
                  une fois l'import terminé.
                </Typography>
              </Alert>
            ) : executeImportResult?.data ? (
              <ImportProgress report={executeImportResult.data} />
            ) : null}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={handleReset}>
                Nouvel import
              </Button>
              <Button variant="contained" onClick={onComplete}>
                Terminer
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Import Excel des Notes - {evaluationName}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>{renderStepContent(activeStep)}</Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={onCancel} disabled={isExecutingImport}>
            Annuler
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && activeStep < 4 && (
              <Button onClick={handleBack} disabled={isExecutingImport}>
                Retour
              </Button>
            )}

            {activeStep === 2 && validationResult?.valid && (
              <Button variant="contained" onClick={handlePreview} disabled={isPreviewingFile}>
                {isPreviewingFile ? 'Chargement...' : 'Prévisualiser'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
