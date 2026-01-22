'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, number, pipe, minValue, maxValue, optional, nullable } from 'valibot'
import type { InferInput } from 'valibot'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import type { EvaluationConfig, EvaluationType } from '../../types/evaluationConfig.types'

const evaluationTypes: EvaluationType[] = ['CC', 'TP', 'Projet', 'Examen', 'Rattrapage']

const schema = object({
  name: pipe(string(), minValue(1, 'Le nom est requis')),
  type: pipe(string(), minValue(1, 'Le type est requis')),
  coefficient: pipe(number(), minValue(1, 'Minimum 1%'), maxValue(100, 'Maximum 100%')),
  max_score: optional(pipe(number(), minValue(10, 'Minimum 10'), maxValue(20, 'Maximum 20'))),
  planned_date: optional(nullable(string())),
  is_eliminatory: optional(nullable(string())),
  elimination_threshold: optional(nullable(pipe(number(), minValue(0), maxValue(20))))
})

type FormData = InferInput<typeof schema>

interface EvaluationConfigFormProps {
  initialData?: EvaluationConfig
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  disabled?: boolean
}

const EvaluationConfigForm = ({ initialData, onSubmit, onCancel, disabled }: EvaluationConfigFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
      coefficient: initialData?.coefficient || 20,
      max_score: initialData?.max_score || 20,
      planned_date: initialData?.planned_date || null,
      is_eliminatory: initialData?.is_eliminatory ? 'true' : 'false',
      elimination_threshold: initialData?.elimination_threshold || null
    }
  })

  const isEliminatory = watch('is_eliminatory') === 'true'

  const handleFormSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        type: data.type as EvaluationType,
        coefficient: data.coefficient,
        max_score: data.max_score || 20,
        planned_date: data.planned_date || null,
        is_eliminatory: data.is_eliminatory === 'true',
        elimination_threshold: data.is_eliminatory === 'true' ? data.elimination_threshold : null
      }
      await onSubmit(payload)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {disabled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          La configuration est publiée et ne peut plus être modifiée
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nom de l'évaluation"
                placeholder="Ex: CC1, Examen Final"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting || disabled}
                required
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Type"
                error={!!errors.type}
                helperText={errors.type?.message}
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

        <Grid item xs={12} sm={6}>
          <Controller
            name="coefficient"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label="Coefficient (%)"
                error={!!errors.coefficient}
                helperText={errors.coefficient?.message}
                disabled={isSubmitting || disabled}
                required
                inputProps={{ min: 1, max: 100, step: 1 }}
                onChange={e => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="max_score"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label="Note maximale"
                error={!!errors.max_score}
                helperText={errors.max_score?.message}
                disabled={isSubmitting || disabled}
                inputProps={{ min: 10, max: 20, step: 0.5 }}
                onChange={e => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="planned_date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                label="Date planifiée"
                InputLabelProps={{ shrink: true }}
                error={!!errors.planned_date}
                helperText={errors.planned_date?.message}
                disabled={isSubmitting || disabled}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="is_eliminatory"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value === 'true'}
                    onChange={e => field.onChange(e.target.checked ? 'true' : 'false')}
                    disabled={isSubmitting || disabled}
                  />
                }
                label="Évaluation éliminatoire"
              />
            )}
          />
        </Grid>

        {isEliminatory && (
          <Grid item xs={12} sm={6}>
            <Controller
              name="elimination_threshold"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Seuil éliminatoire"
                  placeholder="Ex: 8"
                  error={!!errors.elimination_threshold}
                  helperText={errors.elimination_threshold?.message || 'Note minimale requise'}
                  disabled={isSubmitting || disabled}
                  inputProps={{ min: 0, max: 20, step: 0.5 }}
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              )}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting || disabled}>
          {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer'}
        </Button>
      </Box>
    </Box>
  )
}

export default EvaluationConfigForm
