'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import type { EvaluationPeriod, AcademicPeriodType } from '../../types/academicCalendar.types'
import { getEvaluationPeriodTypeLabel } from '../../types/academicCalendar.types'

interface EvaluationPeriodFormData {
  name: string
  type: AcademicPeriodType
  start_date: string
  end_date: string
  description?: string
}

interface EvaluationPeriodFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EvaluationPeriodFormData) => Promise<void>
  evaluationPeriod?: EvaluationPeriod | null
  isSubmitting?: boolean
}

// Types principaux pour les périodes d'évaluation
const evaluationPeriodTypes: AcademicPeriodType[] = ['Session examens', 'Rattrapage', 'Autre']

export const EvaluationPeriodFormDialog: React.FC<EvaluationPeriodFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  evaluationPeriod,
  isSubmitting = false
}) => {
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>('')

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<EvaluationPeriodFormData>({
    defaultValues: {
      name: '',
      type: 'Session examens',
      start_date: '',
      end_date: '',
      description: ''
    }
  })

  useEffect(() => {
    if (evaluationPeriod) {
      reset({
        name: evaluationPeriod.name,
        type: evaluationPeriod.type,
        start_date: evaluationPeriod.start_date,
        end_date: evaluationPeriod.end_date,
        description: evaluationPeriod.description || ''
      })
    } else {
      reset({
        name: '',
        type: 'Session examens',
        start_date: '',
        end_date: '',
        description: ''
      })
    }
    // Clear errors when dialog opens/closes
    setBackendErrors({})
    setGeneralError('')
  }, [evaluationPeriod, reset, open])

  const handleFormSubmit = async (data: EvaluationPeriodFormData) => {
    try {
      setBackendErrors({})
      setGeneralError('')
      await onSubmit(data)
    } catch (error: any) {
      // Handle validation errors from backend (422)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        setBackendErrors(errors)

        // Set errors on form fields
        Object.keys(errors).forEach(field => {
          if (field in data) {
            setError(field as keyof EvaluationPeriodFormData, {
              type: 'manual',
              message: errors[field][0] // First error message
            })
          }
        })

        // Set general error message
        if (error.response.data.message) {
          setGeneralError(error.response.data.message)
        }
      } else {
        // Other errors
        setGeneralError(error.message || 'Une erreur est survenue lors de l\'enregistrement')
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{evaluationPeriod ? 'Modifier' : 'Ajouter'} une Période d'Évaluation</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {generalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Le nom est obligatoire' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nom de la Période"
                    placeholder="Ex: Session d'examens S1"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Le type est obligatoire' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Type de Période"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    disabled={isSubmitting}
                  >
                    {evaluationPeriodTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {getEvaluationPeriodTypeLabel(type)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: 'La date de début est obligatoire' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date de Début"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.start_date}
                    helperText={errors.start_date?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="end_date"
                control={control}
                rules={{ required: 'La date de fin est obligatoire' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date de Fin"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.end_date}
                    helperText={errors.end_date?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Description (optionnel)"
                    placeholder="Description de la période d'évaluation"
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
