'use client';

import { useState } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

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

export default function GradeImportWizard({
  evaluationId,
  evaluationName,
  onComplete,
  onCancel,
}: GradeImportWizardProps) {
  const { t } = useTranslation('Grades');
  const { tenantId: rawTenantId } = useTenant();

  const steps = [
    t('gradeImportWizard.stepDownloadTemplate'),
    t('gradeImportWizard.stepUploadFile'),
    t('gradeImportWizard.stepValidateFile'),
    t('gradeImportWizard.stepPreview'),
    t('gradeImportWizard.stepImport'),
  ];
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
              {t('gradeImportWizard.downloadTemplateTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('gradeImportWizard.downloadTemplateDescription')}
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">{t('gradeImportWizard.templateOptions')}</FormLabel>
              <FormControlLabel
                control={
                  <Radio
                    checked={!includeExisting}
                    onChange={() => setIncludeExisting(false)}
                  />
                }
                label={t('gradeImportWizard.emptyTemplate')}
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={includeExisting}
                    onChange={() => setIncludeExisting(true)}
                  />
                }
                label={t('gradeImportWizard.templateWithExisting')}
              />
            </FormControl>

            <Button
              variant="contained"
              startIcon={isDownloadingTemplate ? <CircularProgress size={20} /> : <i className='ri-download-line' />}
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
            >
              {isDownloadingTemplate ? t('gradeImportWizard.downloading') : t('gradeImportWizard.downloadTemplate')}
            </Button>

            {downloadTemplateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {t('gradeImportWizard.downloadError')}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('gradeImportWizard.uploadFileTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('gradeImportWizard.uploadFileDescription')}
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<i className='ri-upload-cloud-line' />}
              sx={{ mb: 2 }}
            >
              {t('gradeImportWizard.chooseFile')}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>

            {uploadedFile && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('gradeImportWizard.fileSelected', { name: uploadedFile.name })}
              </Alert>
            )}

            {isValidatingFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography>{t('gradeImportWizard.validatingFile')}</Typography>
              </Box>
            )}

            {validateFileError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {t('gradeImportWizard.validationError')}
              </Alert>
            )}

            {validationResult && !validationResult.valid && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('gradeImportWizard.invalidFile')}
                </Typography>
                {validationResult.missing_columns && validationResult.missing_columns.length > 0 && (
                  <>
                    <Typography variant="body2">
                      {t('gradeImportWizard.missingColumns', { columns: validationResult.missing_columns.join(', ') })}
                    </Typography>
                  </>
                )}
              </Alert>
            )}

            {validationResult && validationResult.valid && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {t('gradeImportWizard.validFile')}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('gradeImportWizard.previewDataTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('gradeImportWizard.previewDataDescription')}
            </Typography>

            {isPreviewingFile && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {previewFileError && (
              <Alert severity="error">
                {t('gradeImportWizard.previewError')}
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
              {t('gradeImportWizard.importOptionsTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('gradeImportWizard.importOptionsDescription')}
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">{t('gradeImportWizard.importMode')}</FormLabel>
              <RadioGroup
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'add' | 'update' | 'overwrite')}
              >
                <FormControlLabel
                  value="add"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">{t('gradeImportWizard.modeAdd')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('gradeImportWizard.modeAddDescription')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="update"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">{t('gradeImportWizard.modeUpdate')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('gradeImportWizard.modeUpdateDescription')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="overwrite"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">{t('gradeImportWizard.modeOverwrite')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('gradeImportWizard.modeOverwriteDescription')}
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
              {isExecutingImport ? t('gradeImportWizard.importing') : t('gradeImportWizard.startImport')}
            </Button>

            {executeImportError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {t('gradeImportWizard.importError')}
              </Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('gradeImportWizard.importCompleteTitle')}
            </Typography>

            {executeImportResult?.async ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  {t('gradeImportWizard.asyncProcessing')}
                </Typography>
                <Typography variant="body2">
                  {t('gradeImportWizard.asyncEstimate', { rows: executeImportResult.estimated_rows })}
                </Typography>
              </Alert>
            ) : executeImportResult?.data ? (
              <ImportProgress report={executeImportResult.data} />
            ) : null}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={handleReset}>
                {t('gradeImportWizard.newImport')}
              </Button>
              <Button variant="contained" onClick={onComplete}>
                {t('gradeImportWizard.finish')}
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
          {t('gradeImportWizard.title', { name: evaluationName })}
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
            {t('common.cancel')}
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && activeStep < 4 && (
              <Button onClick={handleBack} disabled={isExecutingImport}>
                {t('common.back')}
              </Button>
            )}

            {activeStep === 2 && validationResult?.valid && (
              <Button variant="contained" onClick={handlePreview} disabled={isPreviewingFile}>
                {isPreviewingFile ? t('common.loading') : t('gradeImportWizard.preview')}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
