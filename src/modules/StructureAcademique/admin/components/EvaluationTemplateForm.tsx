'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  MenuItem,
  Chip,
  Divider,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { useTranslation } from '@/shared/i18n/use-translation'
import type { EvaluationTemplate, EvaluationType } from '../../types/evaluationConfig.types'

const evaluationTypes: EvaluationType[] = ['CC', 'TP', 'Projet', 'Examen', 'Rattrapage']

interface EvaluationItem {
  name: string
  type: EvaluationType | ''
  coefficient: number
  max_score: number
  is_eliminatory: boolean
  elimination_threshold: number | null
}

interface FormData {
  name: string
  description: string
  is_active: boolean
  evaluations: EvaluationItem[]
}

interface EvaluationTemplateFormProps {
  initialData?: EvaluationTemplate | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  disabled?: boolean
}

const EvaluationTemplateForm = ({ initialData, onSubmit, onCancel, disabled }: EvaluationTemplateFormProps) => {
  const { t } = useTranslation('StructureAcademique')
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
      evaluations: initialData?.config_json?.evaluations || [
        {
          name: '',
          type: '',
          coefficient: 20,
          max_score: 20,
          is_eliminatory: false,
          elimination_threshold: null
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'evaluations'
  })

  const evaluations = watch('evaluations')
  const totalCoefficient = evaluations.reduce((sum, e) => sum + (Number(e.coefficient) || 0), 0)

  const handleFormSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      is_active: data.is_active,
      config_json: {
        evaluations: data.evaluations.map(e => ({
          name: e.name,
          type: e.type as EvaluationType,
          coefficient: Number(e.coefficient),
          max_score: Number(e.max_score),
          is_eliminatory: e.is_eliminatory,
          elimination_threshold: e.is_eliminatory ? Number(e.elimination_threshold) : null
        }))
      }
    }

    await onSubmit(payload)
  }

  const addEvaluation = () => {
    append({
      name: '',
      type: '',
      coefficient: 20,
      max_score: 20,
      is_eliminatory: false,
      elimination_threshold: null
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        {/* Template Info */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('Informations du template')}
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Le nom est requis' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t("Nom du template")}
                placeholder={t("Ex: Standard L1, Pratique avec TP")}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting || disabled}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting || disabled}
                  />
                }
                label={t("Template actif")}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            rules={{ required: 'La description est requise' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={2}
                label={t("Description")}
                placeholder={t("Décrivez l'usage de ce template")}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={isSubmitting || disabled}
                required
              />
            )}
          />
        </Grid>

        {/* Evaluations Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {t('Évaluations')} ({fields.length})
            </Typography>
            <Chip
              label={`Total: ${totalCoefficient}%`}
              color={totalCoefficient === 100 ? 'success' : 'warning'}
              variant={totalCoefficient === 100 ? 'filled' : 'outlined'}
            />
          </Box>

          {totalCoefficient !== 100 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('Le total des coefficients doit être égal à 100% (actuellement')} {totalCoefficient}%)
            </Alert>
          )}
        </Grid>

        {fields.map((field, index) => (
          <Grid item xs={12} key={field.id}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('Évaluation')} #{index + 1}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => remove(index)}
                  disabled={isSubmitting || disabled || fields.length === 1}
                >
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`evaluations.${index}.name`}
                    control={control}
                    rules={{ required: 'Le nom est requis' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t("Nom")}
                        placeholder={t("Ex: CC1, Examen Final")}
                        size="small"
                        error={!!errors.evaluations?.[index]?.name}
                        helperText={errors.evaluations?.[index]?.name?.message}
                        disabled={isSubmitting || disabled}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`evaluations.${index}.type`}
                    control={control}
                    rules={{ required: 'Le type est requis' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Type"
                        size="small"
                        error={!!errors.evaluations?.[index]?.type}
                        helperText={errors.evaluations?.[index]?.type?.message}
                        disabled={isSubmitting || disabled}
                        required
                      >
                        {evaluationTypes.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Controller
                    name={`evaluations.${index}.coefficient`}
                    control={control}
                    rules={{
                      required: 'Requis',
                      min: { value: 1, message: 'Min 1%' },
                      max: { value: 100, message: 'Max 100%' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        fullWidth
                        label={t("Coefficient (%)")}
                        size="small"
                        error={!!errors.evaluations?.[index]?.coefficient}
                        helperText={errors.evaluations?.[index]?.coefficient?.message}
                        disabled={isSubmitting || disabled}
                        required
                        inputProps={{ min: 1, max: 100, step: 1 }}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Controller
                    name={`evaluations.${index}.max_score`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        fullWidth
                        label={t("Note max")}
                        size="small"
                        error={!!errors.evaluations?.[index]?.max_score}
                        disabled={isSubmitting || disabled}
                        inputProps={{ min: 10, max: 20, step: 0.5 }}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 20)}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`evaluations.${index}.is_eliminatory`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting || disabled}
                          />
                        }
                        label={t("Éliminatoire")}
                      />
                    )}
                  />
                </Grid>

                {evaluations[index]?.is_eliminatory && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`evaluations.${index}.elimination_threshold`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          fullWidth
                          label={t("Seuil éliminatoire")}
                          size="small"
                          placeholder="Ex: 8"
                          disabled={isSubmitting || disabled}
                          inputProps={{ min: 0, max: 20, step: 0.5 }}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<i className='ri-add-line' />}
            onClick={addEvaluation}
            disabled={isSubmitting || disabled}
            fullWidth
          >
            {t('Ajouter une évaluation')}
          </Button>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onCancel} disabled={isSubmitting || disabled}>
              {t('Annuler')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || disabled || totalCoefficient !== 100}
            >
              {isSubmitting ? t('Enregistrement...') : initialData ? t('Mettre à jour') : t('Créer')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EvaluationTemplateForm
