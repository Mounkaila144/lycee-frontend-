'use client'

import { useState } from 'react'

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

import type { Subject } from '../../types/subject.types'

interface SubjectDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  subject: Subject | null
}

export const SubjectDeleteDialog = ({ open, onClose, onConfirm, subject }: SubjectDeleteDialogProps) => {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setDeleting(true)
      setError(null)
      await onConfirm()
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erreur lors de la suppression.'

      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Supprimer la matière</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>
          Êtes-vous sûr de vouloir supprimer la matière <strong>{subject?.name}</strong> ({subject?.code}) ?
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Cette action est irréversible. La suppression sera bloquée si des coefficients ou notes existent.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          Annuler
        </Button>
        <Button variant='contained' color='error' onClick={handleConfirm} disabled={deleting}>
          {deleting ? 'Suppression...' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
