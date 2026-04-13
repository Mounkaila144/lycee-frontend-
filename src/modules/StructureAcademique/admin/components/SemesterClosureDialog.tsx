'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import type { Semester } from '../../types/academicCalendar.types'

interface SemesterClosureDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  semester: Semester | null
}

const SemesterClosureDialog = ({ open, onClose, onConfirm, semester }: SemesterClosureDialogProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      setError(null)
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Clôturer le semestre</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cette action est irréversible.
        </Alert>
        <Typography>
          Êtes-vous sûr de vouloir clôturer le semestre <strong>{semester?.name}</strong> ?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Une fois clôturé, aucune modification ne pourra être apportée aux notes et évaluations de ce semestre.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button variant="contained" color="warning" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Clôture en cours...' : 'Clôturer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SemesterClosureDialog
