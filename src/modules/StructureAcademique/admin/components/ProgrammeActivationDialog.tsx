'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Type Imports
import type { Programme } from '../../types/programme.types'

// Hook Imports
import { useProgrammeActivation } from '../hooks/useProgrammeActivation'

interface ProgrammeActivationDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  programme: Programme | null
  action: 'activate' | 'deactivate'
}

const ProgrammeActivationDialog = ({
  open,
  onClose,
  onSuccess,
  programme,
  action
}: ProgrammeActivationDialogProps) => {
  const { t } = useTranslation('StructureAcademique')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    canActivate,
    canDeactivate,
    activationChecks,
    deactivationChecks,
    activateProgramme,
    deactivateProgramme,
    loading: checksLoading
  } = useProgrammeActivation(programme?.id)

  if (!programme) return null

  const isActivation = action === 'activate'
  const checks = isActivation ? activationChecks : deactivationChecks
  const canProceed = isActivation ? canActivate : canDeactivate

  const handleConfirm = async () => {
    if (!programme || !canProceed) return

    setIsSubmitting(true)

    try {
      if (isActivation) {
        await activateProgramme()
      } else {
        await deactivateProgramme()
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(`Error ${action}ing programme:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCheckIcon = (passed: boolean) => {
    return passed ? (
      <i className='ri-checkbox-circle-line text-success' style={{ fontSize: '1.5rem' }} />
    ) : (
      <i className='ri-close-circle-line text-error' style={{ fontSize: '1.5rem' }} />
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {isActivation ? t('Activer le programme') : t('Désactiver le programme')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant='body2' color='text.secondary'>
            {t('Programme')}: <strong>{programme.code} - {programme.libelle}</strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t('Statut actuel')}: <strong>{programme.statut}</strong>
          </Typography>
        </Box>

        {checksLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {!canProceed && (
              <Alert severity='error' sx={{ mb: 3 }}>
                <AlertTitle>
                  {isActivation
                    ? t('Impossible d\'activer ce programme')
                    : t('Impossible de désactiver ce programme')}
                </AlertTitle>
                {t('Veuillez corriger les problèmes ci-dessous avant de continuer.')}
              </Alert>
            )}

            {canProceed && (
              <Alert severity='success' sx={{ mb: 3 }}>
                <AlertTitle>
                  {isActivation
                    ? t('Le programme peut être activé')
                    : t('Le programme peut être désactivé')}
                </AlertTitle>
                {isActivation
                  ? t('Toutes les vérifications sont passées avec succès.')
                  : t('Aucun obstacle à la désactivation.')}
              </Alert>
            )}

            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              {t('Vérifications')}:
            </Typography>

            <List dense>
              {checks.map((check, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getCheckIcon(check.passed)}
                  </ListItemIcon>
                  <ListItemText
                    primary={check.label}
                    secondary={!check.passed ? check.message : undefined}
                    primaryTypographyProps={{
                      color: check.passed ? 'text.primary' : 'error'
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {!isActivation && canProceed && (
              <Alert severity='warning' sx={{ mt: 3 }}>
                {t('La désactivation rendra ce programme indisponible pour de nouvelles inscriptions.')}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('Annuler')}
        </Button>
        <Button
          variant='contained'
          color={isActivation ? 'success' : 'error'}
          onClick={handleConfirm}
          disabled={!canProceed || isSubmitting || checksLoading}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting
            ? t('En cours...')
            : isActivation
            ? t('Activer')
            : t('Désactiver')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProgrammeActivationDialog
