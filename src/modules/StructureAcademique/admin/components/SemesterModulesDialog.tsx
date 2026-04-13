'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import type { Semester } from '../../types/academicCalendar.types'

interface SemesterModulesDialogProps {
  open: boolean
  onClose: () => void
  semester: Semester | null
}

const SemesterModulesDialog = ({ open, onClose, semester }: SemesterModulesDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Modules du semestre - {semester?.name}</DialogTitle>
      <DialogContent>
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            La gestion des modules sera disponible prochainement.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SemesterModulesDialog
