'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { Semester } from '../../types/academicCalendar.types'

interface SemesterClosureDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  semester: Semester | null
}

const SemesterClosureDialog = ({ open, onClose, onConfirm, semester }: SemesterClosureDialogProps) => {
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setClosing(true)
      setError(null)
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la clôture')
    } finally {
      setClosing(false)
    }
  }

  const handleClose = () => {
    if (!closing) {
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Clôturer le semestre</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Êtes-vous sûr de vouloir clôturer le semestre <strong>{semester?.name}</strong> ?
        </DialogContentText>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark" fontWeight={600}>
            ⚠️ Conséquences de la clôture :
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • La saisie des notes sera verrouillée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Les résultats finaux seront générés
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Cette action est irréversible
          </Typography>
        </Box>
        <DialogContentText sx={{ mt: 2 }}>
          Assurez-vous que toutes les notes ont été saisies avant de continuer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={closing}>
          Annuler
        </Button>
        <Button onClick={handleConfirm} color="warning" variant="contained" disabled={closing}>
          {closing ? 'Clôture en cours...' : 'Clôturer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SemesterClosureDialog
