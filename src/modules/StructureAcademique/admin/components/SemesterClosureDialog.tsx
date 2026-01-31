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
import { useTranslation } from '@/shared/i18n/use-translation'
import type { Semester } from '../../types/academicCalendar.types'

interface SemesterClosureDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  semester: Semester | null
}

const SemesterClosureDialog = ({ open, onClose, onConfirm, semester }: SemesterClosureDialogProps) => {
  const { t } = useTranslation('StructureAcademique')
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setClosing(true)
      setError(null)
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Erreur lors de la clôture'))
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
      <DialogTitle>{t('Clôturer le semestre')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          {t('Êtes-vous sûr de vouloir clôturer le semestre')} <strong>{semester?.name}</strong> ?
        </DialogContentText>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark" fontWeight={600}>
            {t('Conséquences de la clôture :')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('La saisie des notes sera verrouillée')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Les résultats finaux seront générés')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Cette action est irréversible')}
          </Typography>
        </Box>
        <DialogContentText sx={{ mt: 2 }}>
          {t('Assurez-vous que toutes les notes ont été saisies avant de continuer.')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={closing}>
          {t('Annuler')}
        </Button>
        <Button onClick={handleConfirm} color="warning" variant="contained" disabled={closing}>
          {closing ? t('Clôture en cours...') : t('Clôturer')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SemesterClosureDialog
