'use client'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Component Imports
import ProgrammeHistoryView from './ProgrammeHistoryView'

// Type Imports
import type { Programme } from '../../types/programme.types'

interface ProgrammeHistoryDialogProps {
  open: boolean
  onClose: () => void
  programme: Programme | null
}

const ProgrammeHistoryDialog = ({
  open,
  onClose,
  programme,
}: ProgrammeHistoryDialogProps) => {
  const { t } = useTranslation('StructureAcademique')

  if (!programme) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t('Historique du programme')}
        <IconButton onClick={onClose} size="small">
          <i className="ri-close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <ProgrammeHistoryView programme={programme} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('Fermer')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProgrammeHistoryDialog
