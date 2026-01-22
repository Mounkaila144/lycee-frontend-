'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import {
  object,
  string,
  number,
  boolean,
  optional,
  nullable,
  pipe,
  minLength,
  minValue,
  maxValue,
  custom,
} from 'valibot';
import type { InferInput } from 'valibot';
import type { Module, ModuleType, ModuleSemester, ModuleLevel } from '../../types/module.types';
import { getSemestersForLevel, isSemesterLevelConsistent } from '../../types/module.types';

// Validation schema
const moduleSchema = object({
  code: pipe(string(), minLength(1, 'Le code est requis')),
  name: pipe(string(), minLength(1, 'Le nom est requis')),
  credits_ects: pipe(
    number('Les crédits ECTS doivent être un nombre'),
    minValue(2, 'Minimum 2 crédits'),
    maxValue(6, 'Maximum 6 crédits')
  ),
  coefficient: pipe(
    number('Le coefficient doit être un nombre'),
    minValue(0.5, 'Minimum 0.5'),
    maxValue(5, 'Maximum 5')
  ),
  type: string(),
  semester: string(),
  level: string(),
  description: optional(nullable(string()), null),
  hours_cm: optional(nullable(pipe(number(), minValue(0, 'Minimum 0'))), null),
  hours_td: optional(nullable(pipe(number(), minValue(0, 'Minimum 0'))), null),
  hours_tp: optional(nullable(pipe(number(), minValue(0, 'Minimum 0'))), null),
  is_eliminatory: boolean(),
});

type ModuleFormInput = InferInput<typeof moduleSchema>;

interface ModuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormInput) => Promise<void>;
  module?: Module | null;
  isEditMode?: boolean;
}

const MODULE_TYPES: ModuleType[] = ['Obligatoire', 'Optionnel'];
const MODULE_LEVELS: ModuleLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2'];

const ModuleFormDialog: React.FC<ModuleFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  module,
  isEditMode = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ModuleFormInput>({
    resolver: valibotResolver(moduleSchema),
    defaultValues: {
      code: '',
      name: '',
      credits_ects: 3,
      coefficient: 1,
      type: 'Obligatoire',
      semester: 'S1',
      level: 'L1',
      description: null,
      hours_cm: null,
      hours_td: null,
      hours_tp: null,
      is_eliminatory: false,
    },
  });

  // Watch level to update available semesters
  const selectedLevel = watch('level');
  const hoursCm = watch('hours_cm');
  const hoursTd = watch('hours_td');
  const hoursTp = watch('hours_tp');

  // Calculate total hours
  const totalHours = (hoursCm || 0) + (hoursTd || 0) + (hoursTp || 0);

  // Update form when module changes
  useEffect(() => {
    if (module && isEditMode) {
      reset({
        code: module.code,
        name: module.name,
        credits_ects: module.credits_ects,
        coefficient: module.coefficient,
        type: module.type,
        semester: module.semester,
        level: module.level,
        description: module.description || null,
        hours_cm: module.hours_cm || null,
        hours_td: module.hours_td || null,
        hours_tp: module.hours_tp || null,
        is_eliminatory: module.is_eliminatory,
      });
    } else if (!isEditMode) {
      reset({
        code: '',
        name: '',
        credits_ects: 3,
        coefficient: 1,
        type: 'Obligatoire',
        semester: 'S1',
        level: 'L1',
        description: null,
        hours_cm: null,
        hours_td: null,
        hours_tp: null,
        is_eliminatory: false,
      });
    }
  }, [module, isEditMode, reset]);

  // Update semester when level changes
  useEffect(() => {
    if (selectedLevel) {
      const availableSemesters = getSemestersForLevel(selectedLevel as ModuleLevel);
      if (availableSemesters.length > 0) {
        setValue('semester', availableSemesters[0]);
      }
    }
  }, [selectedLevel, setValue]);

  const handleFormSubmit = async (data: ModuleFormInput) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const availableSemesters = getSemestersForLevel(selectedLevel as ModuleLevel);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">
            {isEditMode ? 'Modifier le Module' : 'Nouveau Module'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Code */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Code Module *"
                    placeholder="Ex: INF101"
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                  />
                )}
              />
            </Grid>

            {/* Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nom du Module *"
                    placeholder="Ex: Programmation Orientée Objet"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            {/* Level */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Niveau *"
                    error={!!errors.level}
                    helperText={errors.level?.message}
                    disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                  >
                    {MODULE_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Semester */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Semestre *"
                    error={!!errors.semester}
                    helperText={errors.semester?.message}
                    disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                  >
                    {availableSemesters.map((semester) => (
                      <MenuItem key={semester} value={semester}>
                        {semester}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Credits ECTS */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="credits_ects"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Crédits ECTS *"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.credits_ects}
                    helperText={errors.credits_ects?.message || '2-6 crédits'}
                    disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                    inputProps={{ min: 2, max: 6, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Coefficient */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="coefficient"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Coefficient *"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.coefficient}
                    helperText={errors.coefficient?.message || '0.5-5'}
                    disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                    inputProps={{ min: 0.5, max: 5, step: 0.5 }}
                  />
                )}
              />
            </Grid>

            {/* Type */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Type *"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                  >
                    {MODULE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Volume Horaire Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Volume Horaire
              </Typography>
            </Grid>

            {/* Hours CM */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="hours_cm"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="CM (Cours Magistral)"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    error={!!errors.hours_cm}
                    helperText={errors.hours_cm?.message}
                    disabled={isSubmitting}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Hours TD */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="hours_td"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="TD (Travaux Dirigés)"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    error={!!errors.hours_td}
                    helperText={errors.hours_td?.message}
                    disabled={isSubmitting}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Hours TP */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="hours_tp"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="TP (Travaux Pratiques)"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    error={!!errors.hours_tp}
                    helperText={errors.hours_tp?.message}
                    disabled={isSubmitting}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Total Hours Display */}
            <Grid item xs={12}>
              <Alert severity={totalHours >= 15 ? 'success' : 'warning'}>
                <Typography variant="body2">
                  <strong>Total heures:</strong> {totalHours}h
                  {totalHours < 15 && ' (Minimum réglementaire: 15h)'}
                </Typography>
              </Alert>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field: { value, ...field } }) => (
                  <TextField
                    {...field}
                    value={value || ''}
                    fullWidth
                    multiline
                    rows={4}
                    label="Description / Contenu"
                    placeholder="Décrivez le contenu du module..."
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            {/* Is Eliminatory */}
            <Grid item xs={12}>
              <Controller
                name="is_eliminatory"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={isSubmitting || (isEditMode && !module?.can_be_modified)}
                      />
                    }
                    label="Module éliminatoire"
                  />
                )}
              />
            </Grid>

            {/* Warning for edit mode */}
            {isEditMode && module && !module.can_be_modified && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  Ce module a des notes saisies. Seuls la description et le volume horaire peuvent être modifiés.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModuleFormDialog;
