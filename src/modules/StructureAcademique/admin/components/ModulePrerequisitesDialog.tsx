'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/use-translation';
import { useModulePrerequisites } from '../hooks/useModulePrerequisites';
import { moduleService } from '../services/moduleService';
import { useTenant } from '@/shared/lib/tenant-context';
import type { Module } from '../../types/module.types';
import type { PrerequisiteType } from '../../types/modulePrerequisite.types';
import { getPrerequisiteTypeBadgeColor } from '../../types/modulePrerequisite.types';

interface ModulePrerequisitesDialogProps {
  open: boolean;
  onClose: () => void;
  module: Module | null;
}

const PREREQUISITE_TYPES: PrerequisiteType[] = ['Strict', 'Recommandé'];

const ModulePrerequisitesDialog: React.FC<ModulePrerequisitesDialogProps> = ({ open, onClose, module }) => {
  const { t } = useTranslation('StructureAcademique');
  const { tenantId } = useTenant();
  const { prerequisites, loading, error, addPrerequisite, removePrerequisite } = useModulePrerequisites(
    module?.id || 0
  );

  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedType, setSelectedType] = useState<PrerequisiteType>('Strict');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch available modules (same level or lower)
  useEffect(() => {
    const fetchAvailableModules = async () => {
      if (!module || !open) return;

      try {
        setLoadingModules(true);
        const response = await moduleService.getModules({}, tenantId || undefined);
        
        // Filter: exclude current module and already added prerequisites
        const prerequisiteIds = prerequisites.map((p) => p.prerequisite_module_id);
        const filtered = response.data.filter(
          (m) => m.id !== module.id && !prerequisiteIds.includes(m.id)
        );
        
        setAvailableModules(filtered);
      } catch (err) {
        console.error('Error fetching available modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchAvailableModules();
  }, [module, open, prerequisites, tenantId]);

  const handleAdd = async () => {
    if (!selectedModule) return;

    try {
      setAdding(true);
      setAddError(null);
      await addPrerequisite({
        prerequisite_module_id: selectedModule.id,
        type: selectedType,
      });
      setSelectedModule(null);
      setSelectedType('Strict');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Erreur lors de l\'ajout du prérequis');
      setAddError(errorMessage);
      console.error('Error adding prerequisite:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (prerequisiteId: number) => {
    try {
      await removePrerequisite(prerequisiteId);
    } catch (err) {
      console.error('Error removing prerequisite:', err);
    }
  };

  if (!module) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5">{t('Gestion des Prérequis')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {module.code} - {module.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Add Prerequisite Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('Ajouter un Prérequis')}
          </Typography>

          {addError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAddError(null)}>
              {addError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <Autocomplete
                value={selectedModule}
                onChange={(_, newValue) => setSelectedModule(newValue)}
                options={availableModules}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                loading={loadingModules}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('Module Prérequis')}
                    placeholder={t('Rechercher un module...')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingModules ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2">
                        <strong>{option.code}</strong> - {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.level} - {option.semester} ({option.credits_ects} ECTS)
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as PrerequisiteType)}
              >
                {PREREQUISITE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAdd}
                disabled={!selectedModule || adding}
                sx={{ height: '56px' }}
              >
                {adding ? <CircularProgress size={24} /> : t('Ajouter')}
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{t('Strict')}:</strong> {t('L\'étudiant doit avoir validé ce module avant de s\'inscrire.')}
              <br />
              <strong>{t('Recommandé')}:</strong> {t('Prérequis conseillé mais non bloquant.')}
            </Typography>
          </Alert>
        </Box>

        {/* Prerequisites List */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('Prérequis Actuels')} ({prerequisites.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error.message}</Alert>
          ) : prerequisites.length === 0 ? (
            <Alert severity="info">{t('Aucun prérequis défini pour ce module.')}</Alert>
          ) : (
            <List>
              {prerequisites.map((prereq) => (
                <ListItem
                  key={prereq.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          <strong>{prereq.prerequisite_module?.code}</strong> -{' '}
                          {prereq.prerequisite_module?.name}
                        </Typography>
                        <Chip
                          label={prereq.type}
                          size="small"
                          color={getPrerequisiteTypeBadgeColor(prereq.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {prereq.prerequisite_module?.level} - {prereq.prerequisite_module?.semester} (
                        {prereq.prerequisite_module?.credits_ects} ECTS)
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemove(prereq.id)}
                      size="small"
                      color="error"
                    >
                      <i className="ri-delete-bin-line" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('Fermer')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModulePrerequisitesDialog;
