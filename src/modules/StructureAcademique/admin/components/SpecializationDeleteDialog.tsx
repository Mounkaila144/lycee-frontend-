'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import type { Specialization } from '../../types/specialization.types'

interface SpecializationDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  specialization: Specialization | null
  isDeleting: boolean
}

const SpecializationDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  specialization,
  isDeleting
}: SpecializationDeleteDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (!specialization) return null

  const hasCandidates = (specialization.candidates_count || 0) > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Specialization</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the specialization <strong>{specialization.name}</strong> (
          {specialization.code})?
        </DialogContentText>

        {hasCandidates && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This specialization has {specialization.candidates_count} candidate(s). Deleting it will affect these
            applications.
          </Alert>
        )}

        <DialogContentText sx={{ mt: 2 }}>This action cannot be undone.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SpecializationDeleteDialog
