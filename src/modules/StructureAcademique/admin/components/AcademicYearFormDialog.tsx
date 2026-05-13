'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength } from 'valibot'
import type { InferInput } from 'valibot'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from '@/shared/i18n/use-translation'
import type { AcademicYear, AcademicYearFormInput } from '../../types/academicCalendar.types'

const schema = object({
  name: pipe(string(), minLength(1, 'Le nom est requis')),
  start_date: pipe(string(), minLength(1, 'La date de début est requise')),
  end_date: pipe(string(), minLength(1, 'La date de fin est requise'))
})

type FormData = InferInput<typeof schema>

interface ValidationErrors {
  [key: string]: string[]
}

interface AcademicYearFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AcademicYearFormInput) => Promise<void>
  academicYear?: AcademicYear | null
}

const AcademicYearFormDialog = ({ open, onClose, onSubmit, academicYear }: AcademicYearFormDialogProps) => {
  const { t } = useTranslation('StructureAcademique')
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
      end_date: ''
    }
  })

  // Réinitialiser le formulaire quand l'année académique change
  useEffect(() => {
    if (open) {
      reset({
        name: academicYear?.name || '',
        start_date: academicYear?.start_date || '',
        end_date: academicYear?.end_date || ''
      })
    }
  }, [open, academicYear, reset])

  const handleFormSubmit = async (data: FormData) => {
    try {
      setSubmitting(true)
      setError(null)
      setBackendErrors({})

      // Validation de la durée : minimum 6 mois, pas de plafond strict
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())

      if (diffMonths < 6) {
        setError(t('La durée de l\'année académique doit être d\'au moins 6 mois'))
        setSubmitting(false)
        return
      }

      await onSubmit(data)
      reset()
      onClose()
    } catch (err) {
      // Gestion des erreurs de validation du backend (422)
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const validationErrors = err.response.data.errors as ValidationErrors
        setBackendErrors(validationErrors)
        
        // Message d'erreur général
        const errorMessage = err.response.data.message || t('Erreur de validation')
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : t('Une erreur est survenue'))
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

  // Helper pour obtenir l'erreur d'un champ (client ou backend)
  const getFieldError = (fieldName: keyof FormData) => {
    // Erreur de validation côté client (React Hook Form + Valibot)
    if (errors[fieldName]) {
      return errors[fieldName]?.message
    }
    // Erreur de validation côté backend (Laravel)
    if (backendErrors[fieldName] && backendErrors[fieldName].length > 0) {
      return backendErrors[fieldName][0]
    }
    return undefined
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{academicYear ? t('Modifier l\'année académique') : t('Nouvelle année académique')}</DialogTitle>
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
                    label={t("Nom de l'année")}
                    placeholder={t("Ex: 2025-2026")}
                    error={!!errors.name || !!backendErrors.name}
                    helperText={getFieldError('name')}
                    disabled={submitting}
                  />
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
                    label={t("Date de début")}
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
                    label={t("Date de fin")}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.end_date || !!backendErrors.end_date}
                    helperText={getFieldError('end_date') || t('Durée minimale : 6 mois')}
                    disabled={submitting}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            {t('Annuler')}
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? t('Enregistrement...') : t('Enregistrer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AcademicYearFormDialog
