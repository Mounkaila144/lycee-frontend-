'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength, picklist } from 'valibot'
import type { InferInput } from 'valibot'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from '@/shared/i18n/use-translation'
import type { AcademicPeriod, AcademicPeriodFormInput, AcademicPeriodType } from '../../types/academicCalendar.types'

const schema = object({
  name: pipe(string(), minLength(1, 'Le nom est requis')),
  type: picklist(['Jour férié', 'Vacances', 'Session examens', 'Inscription pédagogique', 'Autre'], 'Type invalide'),
  start_date: pipe(string(), minLength(1, 'La date de début est requise')),
  end_date: pipe(string(), minLength(1, 'La date de fin est requise'))
})

type FormData = InferInput<typeof schema>

interface ValidationErrors {
  [key: string]: string[]
}

interface AcademicPeriodFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<AcademicPeriodFormInput, 'semester_id'>) => Promise<void>
  period?: AcademicPeriod | null
}

const periodTypes: AcademicPeriodType[] = ['Jour férié', 'Vacances', 'Session examens', 'Inscription pédagogique', 'Autre']

const AcademicPeriodFormDialog = ({ open, onClose, onSubmit, period }: AcademicPeriodFormDialogProps) => {
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
      type: 'Vacances',
      start_date: '',
      end_date: ''
    }
  })

  // Réinitialiser le formulaire quand la période change
  useEffect(() => {
    if (open) {
      reset({
        name: period?.name || '',
        type: period?.type || 'Vacances',
        start_date: period?.start_date || '',
        end_date: period?.end_date || ''
      })
    }
  }, [open, period, reset])

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
  const getFieldError = (fieldName: keyof FormData) => {
    if (errors[fieldName]) {
      return errors[fieldName]?.message
    }
    if (backendErrors[fieldName] && backendErrors[fieldName].length > 0) {
      return backendErrors[fieldName][0]
    }
    return undefined
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{period ? 'Modifier la période' : 'Nouvelle période'}</DialogTitle>
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
                    label="Nom de la période"
                    placeholder="Ex: Vacances de Noël"
                    error={!!errors.name || !!backendErrors.name}
                    helperText={getFieldError('name')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Type de période"
                    error={!!errors.type || !!backendErrors.type}
                    helperText={getFieldError('type')}
                    disabled={submitting}
                  >
                    {periodTypes.map(type => (
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

export default AcademicPeriodFormDialog
