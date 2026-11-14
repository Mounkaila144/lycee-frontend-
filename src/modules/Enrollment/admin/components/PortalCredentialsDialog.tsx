'use client';

import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { PortalAccountCredentials } from '../../types/studentManagement.types';

interface PortalCredentialsDialogProps {
  credentials: PortalAccountCredentials | null;

  /** Ex. « Compte de l'élève Awa Issa » */
  title: string;
  onClose: () => void;
}

const copyToClipboard = async (value: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(value);

    return true;
  } catch {
    return false;
  }
};

/**
 * Affiche UNE SEULE FOIS l'identifiant et le mot de passe générés (création ou réinitialisation).
 */
export const PortalCredentialsDialog = ({ credentials, title, onClose }: PortalCredentialsDialogProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (key: string, value: string) => {
    if (await copyToClipboard(value)) {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleClose = () => {
    setCopied(null);
    onClose();
  };

  return (
    <Dialog open={credentials !== null} onClose={(_event, reason) => reason !== 'backdropClick' && handleClose()} maxWidth='xs' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {credentials && (
          <Box className='flex flex-col gap-4'>
            <Alert severity='warning'>
              Notez ou copiez ce mot de passe maintenant : il ne sera plus affiché. En cas d&apos;oubli, utilisez
              « Réinitialiser le mot de passe ».
            </Alert>
            {[
              { key: 'username', label: 'Identifiant', value: credentials.account.username },
              { key: 'password', label: 'Mot de passe', value: credentials.password },
              {
                key: 'both',
                label: 'Identifiant + mot de passe',
                value: `Identifiant : ${credentials.account.username}\nMot de passe : ${credentials.password}`,
              },
            ].map((item) =>
              item.key === 'both' ? (
                <Button
                  key={item.key}
                  variant='outlined'
                  startIcon={<i className={copied === item.key ? 'ri-check-line' : 'ri-file-copy-line'} />}
                  onClick={() => handleCopy(item.key, item.value)}
                >
                  {copied === item.key ? 'Copié' : 'Copier les deux'}
                </Button>
              ) : (
                <Box key={item.key} className='flex items-center justify-between gap-2'>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      {item.label}
                    </Typography>
                    <Typography variant='h6' sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {item.value}
                    </Typography>
                  </Box>
                  <Tooltip title={copied === item.key ? 'Copié' : 'Copier'}>
                    <IconButton onClick={() => handleCopy(item.key, item.value)}>
                      <i className={copied === item.key ? 'ri-check-line' : 'ri-file-copy-line'} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='contained' onClick={handleClose}>
          J&apos;ai noté le mot de passe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortalCredentialsDialog;
