'use client'

import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

import { userService } from '../services/userService'
import type { User } from '../../types/user.types'

interface ResetPasswordDialogProps {
  open: boolean
  user: User | null
  onClose: () => void
}

const MIN_PASSWORD_LENGTH = 8

/**
 * Réinitialisation du mot de passe d'un utilisateur par l'administration
 * (pas d'envoi d'e-mail : le nouveau mot de passe est communiqué à l'utilisateur).
 */
const ResetPasswordDialog = ({ open, user, onClose }: ResetPasswordDialogProps) => {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setPassword('')
      setConfirmation('')
      setError(null)
      setSuccess(false)
    }
  }, [open])

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const mismatch = confirmation.length > 0 && confirmation !== password
  const canSubmit = password.length >= MIN_PASSWORD_LENGTH && confirmation === password && !submitting

  const handleSubmit = async () => {
    if (!user || !canSubmit) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await userService.updateUser(user.id, { password })
      setSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.errors?.password?.[0] ||
          err?.response?.data?.message ||
          'Impossible de réinitialiser le mot de passe.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = user ? [user.firstname, user.lastname].filter(Boolean).join(' ') || user.username : ''

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
      <DialogContent className='flex flex-col gap-4'>
        <Typography color='text.secondary'>
          Nouveau mot de passe pour <strong>{displayName}</strong>
          {user?.username ? ` (identifiant : ${user.username})` : ''}. Communiquez-le à l&apos;utilisateur.
        </Typography>
        {success ? (
          <Alert severity='success'>Le mot de passe a été réinitialisé.</Alert>
        ) : (
          <>
            {error && <Alert severity='error'>{error}</Alert>}
            <TextField
              autoFocus
              fullWidth
              type='password'
              label='Nouveau mot de passe'
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={tooShort}
              helperText={`${MIN_PASSWORD_LENGTH} caractères minimum`}
              autoComplete='new-password'
            />
            <TextField
              fullWidth
              type='password'
              label='Confirmer le mot de passe'
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              error={mismatch}
              helperText={mismatch ? 'Les mots de passe ne correspondent pas' : ' '}
              autoComplete='new-password'
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          {success ? 'Fermer' : 'Annuler'}
        </Button>
        {!success && (
          <Button variant='contained' onClick={handleSubmit} disabled={!canSubmit}>
            Réinitialiser
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ResetPasswordDialog
