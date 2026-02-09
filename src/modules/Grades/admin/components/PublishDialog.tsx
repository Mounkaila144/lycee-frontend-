'use client';

import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { PublishRequest, PublicationType, PublicationScope, CanPublishResponse } from '../../types/publication.types';

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  canPublishData: CanPublishResponse | null;
  onPublish: (request: PublishRequest) => Promise<any>;
  publishing: boolean;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({
  open,
  onClose,
  canPublishData,
  onPublish,
  publishing,
}) => {
  const [form, setForm] = useState<PublishRequest>({
    type: 'semester',
    scope: 'all',
    notify_students: true,
    notes: '',
  });

  const handlePublish = async () => {
    const result = await onPublish(form);

    if (result) {
      onClose();
      setForm({ type: 'semester', scope: 'all', notify_students: true, notes: '' });
    }
  };

  const canProceed = canPublishData?.can_publish ?? false;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Publier les résultats</DialogTitle>
      <DialogContent>
        {/* Prerequisites checklist */}
        {canPublishData && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Prérequis</Typography>
            {canPublishData.can_publish ? (
              <Alert severity="success" sx={{ mb: 1 }}>
                Tous les prérequis sont remplis. {canPublishData.unpublished_count} résultat(s) non publié(s) sur {canPublishData.total_results} total.
              </Alert>
            ) : (
              <>
                <List dense>
                  {canPublishData.reasons.map((reason, index) => (
                    <ListItem key={index} dense>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <i className="ri-close-circle-fill" style={{ color: 'var(--mui-palette-error-main)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={reason}
                        primaryTypographyProps={{
                          color: 'error.main',
                          variant: 'body2',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Alert severity="warning" sx={{ mt: 1 }}>
                  La publication est bloquée. Veuillez résoudre les problèmes ci-dessus.
                </Alert>
              </>
            )}
          </Box>
        )}

        {/* Type */}
        <FormControl sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Type de publication</Typography>
          <RadioGroup
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as PublicationType })}
          >
            <FormControlLabel value="semester" control={<Radio size="small" />} label="Résultats semestriels" />
            <FormControlLabel value="module" control={<Radio size="small" />} label="Résultats par module" />
            <FormControlLabel value="final" control={<Radio size="small" />} label="Résultats finaux" />
          </RadioGroup>
        </FormControl>

        {/* Scope */}
        <FormControl sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Portée</Typography>
          <RadioGroup
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value as PublicationScope })}
          >
            <FormControlLabel value="all" control={<Radio size="small" />} label="Tous les étudiants" />
            <FormControlLabel value="validated" control={<Radio size="small" />} label="Étudiants validés uniquement" />
            <FormControlLabel value="failed" control={<Radio size="small" />} label="Étudiants non validés uniquement" />
          </RadioGroup>
        </FormControl>

        {/* Notify */}
        <FormControlLabel
          control={
            <Switch
              checked={form.notify_students}
              onChange={(e) => setForm({ ...form, notify_students: e.target.checked })}
            />
          }
          label="Notifier les étudiants"
          sx={{ mb: 2, display: 'block' }}
        />

        {/* Notes */}
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={2}
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes additionnelles..."
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handlePublish}
          disabled={!canProceed || publishing}
          startIcon={publishing ? <CircularProgress size={16} /> : <i className="ri-send-plane-line" />}
        >
          {publishing ? 'Publication...' : 'Publier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
