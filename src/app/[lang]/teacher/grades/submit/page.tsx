'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { GradeSubmissionCard } from '@/modules/Grades/frontend/components';
import { useTeacherModules } from '@/modules/Grades/frontend/hooks';

export default function GradeSubmissionPage() {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);

  // For demo purposes, using hardcoded academic year
  // In production, this should come from context or user session
  const academicYearId = 1;

  const { modules, evaluations, selectModule, loading, error } = useTeacherModules();

  const handleModuleChange = async (moduleId: number) => {
    setSelectedModuleId(moduleId);
    setSelectedEvaluationId(null);

    const module = modules?.find((m) => m.id === moduleId);
    if (module) {
      await selectModule(module);
    }
  };

  const selectedModule = modules?.find((m) => m.id === selectedModuleId);

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Soumettre les Notes pour Validation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez un module et une évaluation pour soumettre les notes au responsable
          pédagogique
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>À propos de la soumission</AlertTitle>
        Une fois les notes soumises, vous ne pourrez plus les modifier jusqu'à la décision du
        responsable pédagogique. Assurez-vous que toutes les notes sont correctement saisies avant
        de soumettre.
      </Alert>

      {/* Module Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Module</InputLabel>
            <Select
              value={selectedModuleId || ''}
              label="Module"
              onChange={(e) => handleModuleChange(Number(e.target.value))}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Sélectionner un module</em>
              </MenuItem>
              {modules?.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.code} - {module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {evaluations && evaluations.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Évaluation</InputLabel>
              <Select
                value={selectedEvaluationId || ''}
                label="Évaluation"
                onChange={(e) => setSelectedEvaluationId(Number(e.target.value))}
              >
                <MenuItem value="">
                  <em>Toutes les évaluations</em>
                </MenuItem>
                {evaluations.map((evaluation) => (
                  <MenuItem key={evaluation.id} value={evaluation.id}>
                    {evaluation.name} ({evaluation.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Submission Card */}
      {selectedModuleId && (
        <GradeSubmissionCard
          moduleId={selectedModuleId}
          evaluationId={selectedEvaluationId || undefined}
          academicYearId={academicYearId}
          onSubmitSuccess={() => {
            // Optionally redirect or show success message
            alert('Notes soumises avec succès!');
          }}
        />
      )}

      {!selectedModuleId && !loading && (
        <Alert severity="info">Sélectionnez un module pour commencer</Alert>
      )}
    </Box>
  );
}
