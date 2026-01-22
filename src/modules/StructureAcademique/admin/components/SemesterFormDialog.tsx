'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength, optional, nullable } from 'valibot'
import type { InferInput } from 'valibot'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { useState, useEffect } from 'react'
import axios from 'axios'
import type { Semester, SemesterFormInput } from '../../types/academicCalendar.types'

const schema = object({
  name: pipe(string(), minLength(1, 'Le nom est requis')),
  start_date: pipe(string(), minLength(1, 'La date de début est requise')),
  end_date: pipe(string(), minLength(1, 'La date de fin est requise')),
  courses_start_date: optional(nullable(string())),
  courses_end_date: optional(nullable(string())),
  exams_start_date: optional(nullable(string())),
  exams_end_date: optional(nullable(string()))
})

type FormData = InferInput<typeof schema>

interface ValidationErrors {
  [key: string]: string[]
}

interface SemesterFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<SemesterFormInput, 'academic_year_id'>) => Promise<void>
  semester?: Semester | null
}

const SemesterFormDialog = ({ open, onClose, onSubmit, semester }: SemesterFormDialogProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendErrors, setBackendErrors] = useState<ValidationErrors>({})

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      courses_start_date: '',
      courses_end_date: '',
      exams_start_date: '',
      exams_end_date: ''
    }
  })

  // Réinitialiser le formulaire quand le semestre change
  useEffect(() => {
    if (open) {
      reset({
        name: semester?.name || '',
        start_date: semester?.start_date || '',
        end_date: semester?.end_date || '',
        courses_start_date: semester?.courses_start_date || '',
        courses_end_date: semester?.courses_end_date || '',
        exams_start_date: semester?.exams_start_date || '',
        exams_end_date: semester?.exams_end_date || ''
      })
    }
  }, [open, semester, reset])

  const handleFormSubmit = async (data: FormData) => {
    try {
      setSubmitting(true)
      setError(null)
      setBackendErrors({})
      await onSubmit(data as any)
      reset()
      onClose()
    } catch (err) {
      // Gestion des erreurs de validation du backend (422)
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const validationErrors = err.response.data.errors as ValidationErrors
        setBackendErrors(validationErrors)
        
        // Message d'erreur général
        const errorMessage = err.response.data.message || 'Erreur de validation'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      reset()
      setError(null)
      setBackendErrors({})
      onClose()
    }
  }

  // Helper pour obtenir l'erreur d'un champ
  const getFieldError = (fieldName: string) => {
    if (errors[fieldName as keyof FormData]) {
      return errors[fieldName as keyof FormData]?.message
    }
    if (backendErrors[fieldName] && backendErrors[fieldName].length > 0) {
      return backendErrors[fieldName][0]
    }
    return undefined
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{semester ? 'Modifier le semestre' : 'Nouveau semestre'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nom du semestre"
                    placeholder="Ex: S1, S2"
                    error={!!errors.name || !!backendErrors.name}
                    helperText={getFieldError('name')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Dates du semestre
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date de début"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.start_date || !!backendErrors.start_date}
                    helperText={getFieldError('start_date')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date de fin"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.end_date || !!backendErrors.end_date}
                    helperText={getFieldError('end_date')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Période des cours (optionnel)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="courses_start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Début des cours"
                    InputLabelProps={{ shrink: true }}
                    error={!!backendErrors.courses_start_date}
                    helperText={getFieldError('courses_start_date')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="courses_end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Fin des cours"
                    InputLabelProps={{ shrink: true }}
                    error={!!backendErrors.courses_end_date}
                    helperText={getFieldError('courses_end_date')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Période des examens (optionnel)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="exams_start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Début des examens"
                    InputLabelProps={{ shrink: true }}
                    error={!!backendErrors.exams_start_date}
                    helperText={getFieldError('exams_start_date')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="exams_end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Fin des examens"
                    InputLabelProps={{ shrink: true }}
                    error={!!backendErrors.exams_end_date}
                    helperText={getFieldError('exams_end_date')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SemesterFormDialog
