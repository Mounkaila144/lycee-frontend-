/**
 * Core Curriculum Dialog - Gestion Tronc Commun
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import { useCoreCurriculum, useCoreCurriculumMutations } from '../hooks/useCurriculum';
import { useModules } from '../hooks/useModules';
import type { Programme, Module } from '../../types';

interface CoreCurriculumDialogProps {
  open: boolean;
  onClose: () => void;
  programme: Programme;
  level: string;
}

export const CoreCurriculumDialog: React.FC<CoreCurriculumDialogProps> = ({
  open,
  onClose,
  programme,
  level,
}) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Fetch core curriculum
  const { data: coreCurriculum, loading: isLoading, error, refetch } = useCoreCurriculum(
    programme.id,
    level
  );

  // Fetch all modules for selection
  const { modules: allModules } = useModules({
    level: level as any,
    per_page: 100,
  });

  // Mutations
  const { addModule, removeModule, isAdding, isRemoving } =
    useCoreCurriculumMutations();

  const handleAddModule = async () => {
    if (!selectedModule) return;

    try {
      await addModule(programme.id, level, {
        programme_id: programme.id,
        level,
        module_id: selectedModule.id,
      });
      setSelectedModule(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to add module:', error);
    }
  };

  const handleRemoveModule = async (moduleId: number) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir retirer ce module du tronc commun ?'
      )
    )
      return;

    try {
      await removeModule(programme.id, level, moduleId);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to remove module:', error);
    }
  };

  // Filter out already added modules
  const availableModules =
    allModules.filter(
      (module: any) =>
        !coreCurriculum?.some((cc) => cc.module_id === module.id)
    ) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Tronc Commun - {programme.code} ({level})
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Info */}
          <Alert severity="info">
            Les modules du tronc commun sont <strong>obligatoires</strong> pour
            tous les étudiants de ce niveau, quelle que soit leur spécialité.
          </Alert>

          {/* Add Module Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ajouter un module au tronc commun
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Autocomplete
                fullWidth
                options={availableModules}
                getOptionLabel={(option) =>
                  `${option.code} - ${option.name}`
                }
                value={selectedModule}
                onChange={(_, newValue) => setSelectedModule(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sélectionner un module"
                    placeholder="Rechercher..."
                  />
                )}
                disabled={isAdding}
              />
              <Button
                variant="contained"
                onClick={handleAddModule}
                disabled={!selectedModule || isAdding}
                sx={{ minWidth: 120 }}
              >
                {isAdding ? <CircularProgress size={24} /> : 'Ajouter'}
              </Button>
            </Box>
          </Box>

          {/* Current Core Curriculum */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Modules du tronc commun ({coreCurriculum?.length || 0})
            </Typography>

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error">
                Erreur lors du chargement du tronc commun
              </Alert>
            )}

            {!isLoading && !error && coreCurriculum?.length === 0 && (
              <Alert severity="warning">
                Aucun module dans le tronc commun pour ce niveau
              </Alert>
            )}

            {!isLoading && !error && coreCurriculum && coreCurriculum.length > 0 && (
              <List>
                {coreCurriculum.map((cc) => (
                  <ListItem
                    key={cc.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {cc.module?.code}
                          </Typography>
                          <Chip
                            label="Tronc Commun"
                            size="small"
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {cc.module?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cc.module?.credits_ects} crédits •{' '}
                            {cc.module?.coefficient} coef
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRemoveModule(cc.module_id)}
                        disabled={isRemoving}
                      >
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
