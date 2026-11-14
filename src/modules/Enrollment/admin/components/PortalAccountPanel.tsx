'use client';

import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';

import type { PortalAccount, PortalAccountCredentials } from '../../types/studentManagement.types';
import { PortalCredentialsDialog } from './PortalCredentialsDialog';

interface PortalAccountPanelProps {
  account: PortalAccount | null;

  /** Nom affiché dans la fenêtre du mot de passe (ex. « l'élève Awa Issa ») */
  ownerLabel: string;

  /** Proposition d'identifiant affichée en aide (ex. « eleve.<matricule> ») */
  usernameHint: string;
  canManage: boolean;
  compact?: boolean;
  onCreate: (username?: string) => Promise<PortalAccountCredentials>;
  onResetPassword: () => Promise<PortalAccountCredentials>;
  onToggleActive: (isActive: boolean) => Promise<PortalAccount>;
  onChanged: (account: PortalAccount) => void;
}

/**
 * Compte de connexion (élève ou parent) : création, réinitialisation du mot de passe, activation.
 */
export const PortalAccountPanel = ({
  account,
  ownerLabel,
  usernameHint,
  canManage,
  compact = false,
  onCreate,
  onResetPassword,
  onToggleActive,
  onChanged,
}: PortalAccountPanelProps) => {
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<PortalAccountCredentials | null>(null);

  const run = async (action: () => Promise<PortalAccountCredentials | PortalAccount>) => {
    setBusy(true);
    setError(null);

    try {
      const result = await action();

      if ('password' in result) {
        setCredentials(result);
        onChanged(result.account);
      } else {
        onChanged(result);
      }
    } catch (err) {
      setError(await extractErrorMessage(err, "L'opération sur le compte a échoué."));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Générer un nouveau mot de passe pour ${ownerLabel} ? L'ancien ne fonctionnera plus.`)) {
      run(onResetPassword);
    }
  };

  const handleToggle = () => {
    if (!account) return;

    if (account.is_active || window.confirm(`Réactiver le compte de ${ownerLabel} ?`)) {
      run(() => onToggleActive(!account.is_active));
    }
  };

  return (
    <Box className='flex flex-col gap-3'>
      {error && <Alert severity='error' onClose={() => setError(null)}>{error}</Alert>}

      {account ? (
        <Box className='flex flex-wrap items-center gap-3'>
          <Box className='flex flex-col'>
            <Typography variant={compact ? 'body2' : 'body1'}>
              Identifiant : <strong style={{ fontFamily: 'monospace' }}>{account.username}</strong>
            </Typography>
            {!compact && (
              <Typography variant='caption' color='text.secondary'>
                Dernière connexion :{' '}
                {account.lastlogin ? new Date(account.lastlogin).toLocaleString('fr-FR') : 'jamais'}
              </Typography>
            )}
          </Box>
          <Chip
            size='small'
            variant='tonal'
            color={account.is_active ? 'success' : 'secondary'}
            label={account.is_active ? 'Actif' : 'Désactivé'}
          />
          {canManage && (
            <Box className='flex flex-wrap gap-2'>
              <Button size='small' variant='outlined' disabled={busy} onClick={handleReset} startIcon={<i className='ri-key-2-line' />}>
                Réinitialiser le mot de passe
              </Button>
              <Button
                size='small'
                variant='outlined'
                color={account.is_active ? 'error' : 'success'}
                disabled={busy}
                onClick={handleToggle}
                startIcon={<i className={account.is_active ? 'ri-forbid-line' : 'ri-checkbox-circle-line'} />}
              >
                {account.is_active ? 'Désactiver' : 'Activer'}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Box className='flex flex-wrap items-center gap-3'>
          <Typography variant='body2' color='text.secondary'>
            Aucun compte de connexion.
          </Typography>
          {canManage && (
            <>
              {!compact && (
                <TextField
                  size='small'
                  label='Identifiant (facultatif)'
                  placeholder={usernameHint}
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase())}
                  helperText='Laissez vide pour le générer automatiquement.'
                />
              )}
              <Button
                size='small'
                variant='contained'
                disabled={busy}
                onClick={() => run(() => onCreate(username.trim() || undefined))}
                startIcon={<i className='ri-user-add-line' />}
              >
                Créer le compte
              </Button>
            </>
          )}
        </Box>
      )}

      <PortalCredentialsDialog
        credentials={credentials}
        title={`Compte de connexion de ${ownerLabel}`}
        onClose={() => setCredentials(null)}
      />
    </Box>
  );
};

export default PortalAccountPanel;
