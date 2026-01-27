'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { useEvaluationTemplates } from '../hooks/useEvaluationConfig'
import EvaluationTemplateForm from './EvaluationTemplateForm'
import type { EvaluationTemplate } from '../../types/evaluationConfig.types'

interface EvaluationTemplateDialogProps {
  open: boolean
  onClose: () => void
  template: EvaluationTemplate | null
}

const EvaluationTemplateDialog = ({ open, onClose, template }: EvaluationTemplateDialogProps) => {
  const { createTemplate, updateTemplate, refetch } = useEvaluationTemplates(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true)
      setError(null)

      if (template) {
        // Update existing template
        await updateTemplate(template.id, data)
      } else {
        // Create new template
        await createTemplate(data)
      }

      setSuccess(true)
      await refetch()

      // Close dialog after short delay to show success message
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error('Error saving template:', err)
      setError(err?.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Modifier le template' : 'Créer un template d\'évaluation'}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Template {template ? 'modifié' : 'créé'} avec succès !
          </Alert>
        )}

        <EvaluationTemplateForm
          initialData={template}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          disabled={submitting || success}
        />
      </DialogContent>
    </Dialog>
  )
}

export default EvaluationTemplateDialog
