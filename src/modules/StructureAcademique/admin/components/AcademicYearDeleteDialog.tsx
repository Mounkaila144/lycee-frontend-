'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useState } from 'react'
import { useTranslation } from '@/shared/i18n/use-translation'
import type { AcademicYear } from '../../types/academicCalendar.types'

interface AcademicYearDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  academicYear: AcademicYear | null
}

const AcademicYearDeleteDialog = ({ open, onClose, onConfirm, academicYear }: AcademicYearDeleteDialogProps) => {
  const { t } = useTranslation('StructureAcademique')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setDeleting(true)
      setError(null)
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Erreur lors de la suppression'))
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (!deleting) {
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Supprimer l\'année académique')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          {t('Êtes-vous sûr de vouloir supprimer l\'année académique')} <strong>{academicYear?.name}</strong> ?
        </DialogContentText>
        <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
          {t('Cette action supprimera également tous les semestres et périodes associés. Cette action est irréversible.')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          {t('Annuler')}
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={deleting}>
          {deleting ? t('Suppression...') : t('Supprimer')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AcademicYearDeleteDialog
