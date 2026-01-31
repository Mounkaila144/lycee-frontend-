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
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import {
  object,
  string,
  number,
  boolean,
  nullable,
  pipe,
  minValue,
  maxValue,
  custom,
} from 'valibot';
import type { InferInput } from 'valibot';
import { useTranslation } from '@/shared/i18n/use-translation';
import type {
  ProgressionRule,
  ProgressionRuleFormData,
  ProgressionLevel,
} from '../../types/progression.types';
import { getTargetLevels, getTransitionLabel } from '../../types/progression.types';
import type { Programme } from '../../types/programme.types';

// Validation schema
const progressionRuleSchema = object({
  programme_id: nullable(number()),
  from_level: string(),
  to_level: string(),
  min_credits_required: pipe(
    number('Les crédits minimum doivent être un nombre'),
    minValue(0, 'Minimum 0 crédits'),
    maxValue(60, 'Maximum 60 crédits')
  ),
  max_debt_allowed: pipe(
    number('La dette maximale doit être un nombre'),
    minValue(0, 'Minimum 0 crédits'),
    maxValue(30, 'Maximum 30 crédits')
  ),
  allow_conditional_pass: boolean(),
  max_repeats_before_exclusion: pipe(
    number('Le nombre de redoublements doit être un nombre'),
    minValue(1, 'Minimum 1'),
    maxValue(3, 'Maximum 3')
  ),
});

type ProgressionRuleFormInput = InferInput<typeof progressionRuleSchema>;

interface ProgressionRuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProgressionRuleFormData) => Promise<void>;
  rule?: ProgressionRule | null;
  isEditMode?: boolean;
  programmes?: Programme[];
}

const PROGRESSION_LEVELS: ProgressionLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2'];

const ProgressionRuleFormDialog: React.FC<ProgressionRuleFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  rule,
  isEditMode = false,
  programmes = [],
}) => {
  const { t } = useTranslation('StructureAcademique')
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgressionRuleFormInput>({
    resolver: valibotResolver(progressionRuleSchema),
    defaultValues: {
      programme_id: null,
      from_level: 'L1',
      to_level: 'L2',
      min_credits_required: 45,
      max_debt_allowed: 15,
      allow_conditional_pass: true,
      max_repeats_before_exclusion: 2,
    },
  });

  // Watch from_level to update available to_levels
  const selectedFromLevel = watch('from_level');
  const selectedProgrammeId = watch('programme_id');

  // Update form when rule changes
  useEffect(() => {
    if (rule && isEditMode) {
      reset({
        programme_id: rule.programme_id,
        from_level: rule.from_level,
        to_level: rule.to_level,
        min_credits_required: rule.min_credits_required,
        max_debt_allowed: rule.max_debt_allowed,
        allow_conditional_pass: rule.allow_conditional_pass,
        max_repeats_before_exclusion: rule.max_repeats_before_exclusion,
      });
    } else if (!isEditMode) {
      reset({
        programme_id: null,
        from_level: 'L1',
        to_level: 'L2',
        min_credits_required: 45,
        max_debt_allowed: 15,
        allow_conditional_pass: true,
        max_repeats_before_exclusion: 2,
      });
    }
  }, [rule, isEditMode, reset]);

  // Update to_level when from_level changes
  useEffect(() => {
    if (selectedFromLevel) {
      const availableLevels = getTargetLevels(selectedFromLevel as ProgressionLevel);
      if (availableLevels.length > 0) {
        setValue('to_level', availableLevels[0]);
      }
    }
  }, [selectedFromLevel, setValue]);

  const handleFormSubmit = async (data: ProgressionRuleFormInput) => {
    try {
      await onSubmit(data as ProgressionRuleFormData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const availableToLevels = getTargetLevels(selectedFromLevel as ProgressionLevel);
  const selectedProgramme = programmes.find(p => p.id === selectedProgrammeId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">
            {isEditMode ? 'Modifier la Règle de Progression' : 'Nouvelle Règle de Progression'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Programme Selection */}
            <Grid item xs={12}>
              <Controller
                name="programme_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={programmes}
                    getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
                    value={value === null ? null : programmes.find(p => p.id === value) || null}
                    onChange={(_, newValue) => onChange(newValue?.id || null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filière"
                        placeholder={value === null ? "Règle globale (toutes les filières)" : "Sélectionner une filière"}
                        helperText={value === null ? "Cette règle s'applique à toutes les filières" : "Règle spécifique à cette filière"}
                        error={!!errors.programme_id}
                      />
                    )}
                    disabled={isSubmitting}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                  />
                )}
              />
            </Grid>

            {/* Info Alert */}
            <Grid item xs={12}>
              <Alert severity="info">
                {selectedProgramme ? (
                  <>
                    <strong>Règle spécifique</strong> pour le programme{' '}
                    <strong>{selectedProgramme.code}</strong>
                  </>
                ) : (
                  <>
                    <strong>Règle globale</strong> applicable à tous les programmes
                  </>
                )}
              </Alert>
            </Grid>

            {/* From Level */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="from_level"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Niveau Source *"
                    error={!!errors.from_level}
                    helperText={errors.from_level?.message}
                    disabled={isSubmitting}
                  >
                    {PROGRESSION_LEVELS.slice(0, -1).map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* To Level */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="to_level"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Niveau Cible *"
                    error={!!errors.to_level}
                    helperText={errors.to_level?.message}
                    disabled={isSubmitting || availableToLevels.length === 0}
                  >
                    {availableToLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Transition Display */}
            <Grid item xs={12}>
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Transition:</strong>{' '}
                  {getTransitionLabel(
                    selectedFromLevel as ProgressionLevel,
                    watch('to_level') as ProgressionLevel
                  )}
                </Typography>
              </Alert>
            </Grid>

            {/* Min Credits Required */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="min_credits_required"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Crédits Minimum Requis *"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.min_credits_required}
                    helperText={errors.min_credits_required?.message || '0-60 crédits'}
                    disabled={isSubmitting}
                    inputProps={{ min: 0, max: 60, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Max Debt Allowed */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="max_debt_allowed"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Dette Maximale Autorisée *"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.max_debt_allowed}
                    helperText={errors.max_debt_allowed?.message || '0-30 crédits'}
                    disabled={isSubmitting}
                    inputProps={{ min: 0, max: 30, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Allow Conditional Pass */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="allow_conditional_pass"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={isSubmitting}
                      />
                    }
                    label="Passage Conditionnel Autorisé"
                  />
                )}
              />
            </Grid>

            {/* Max Repeats Before Exclusion */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="max_repeats_before_exclusion"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label="Max Redoublements Avant Exclusion *"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.max_repeats_before_exclusion}
                    helperText={errors.max_repeats_before_exclusion?.message || '1-3'}
                    disabled={isSubmitting}
                    inputProps={{ min: 1, max: 3, step: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Example Scenarios */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Exemples de scénarios:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  • Étudiant avec {watch('min_credits_required')} crédits → ✅ Passage Automatique
                  <br />
                  • Étudiant avec {watch('min_credits_required') - 3} crédits (dette: 3) → ⚠️ Passage
                  Conditionnel
                  <br />
                  • Étudiant avec {watch('min_credits_required') - watch('max_debt_allowed') - 5} crédits
                  (dette: {watch('max_debt_allowed') + 5}) → ❌ Redoublement
                  <br />• Étudiant avec module éliminatoire non validé → ❌ Bloqué
                </Typography>
              </Alert>
            </Grid>
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

export default ProgressionRuleFormDialog;
