/**
 * Specialization Modules Dialog - Gestion Modules de Spécialité
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  useSpecializationModules,
  useSpecializationModuleMutations,
} from '../hooks/useCurriculum';
import { useModules } from '../hooks/useModules';
import type {
  Specialization,
  SpecializationModuleType,
  Module,
} from '../../types';
import { getSpecializationModuleTypeLabel, getSpecializationModuleTypeBadgeColor } from '../../types';

interface SpecializationModulesDialogProps {
  open: boolean;
  onClose: () => void;
  specialization: Specialization;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const SpecializationModulesDialog: React.FC<
  SpecializationModulesDialogProps
> = ({ open, onClose, specialization }) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleType, setModuleType] =
    useState<SpecializationModuleType>('Obligatoire');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch specialization modules
  const { data: specializationModules, loading: isLoading, error, refetch } =
    useSpecializationModules(specialization.id);

  // Fetch all modules for selection
  const { modules: allModules } = useModules({
    level: specialization.available_from_level,
    per_page: 100,
  });

  // Mutations
  const { addModule, removeModule, isAdding, isRemoving } =
    useSpecializationModuleMutations();

  const handleAddModule = async () => {
    if (!selectedModule) return;

    try {
      await addModule(specialization.id, {
        specialization_id: specialization.id,
        module_id: selectedModule.id,
        type: moduleType,
        capacity: moduleType === 'Optionnel' && capacity ? Number(capacity) : null,
      });
      setSelectedModule(null);
      setCapacity('');
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to add module:', error);
    }
  };

  const handleRemoveModule = async (moduleId: number) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir retirer ce module de la spécialité ?'
      )
    )
      return;

    try {
      await removeModule(specialization.id, moduleId);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to remove module:', error);
    }
  };

  // Filter modules
  const availableModules =
    allModules.filter(
      (module: any) =>
        !specializationModules?.some((sm: any) => sm.module_id === module.id)
    ) || [];

  const obligatoryModules =
    specializationModules?.filter((sm: any) => sm.type === 'Obligatoire') || [];
  const electiveModules =
    specializationModules?.filter((sm: any) => sm.type === 'Optionnel') || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Modules de Spécialité - {specialization.name}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Info */}
          <Alert severity="info">
            <Typography variant="body2" gutterBottom>
              <strong>Modules Obligatoires</strong> : Tous les étudiants de
              cette spécialité doivent suivre ces modules.
            </Typography>
            <Typography variant="body2">
              <strong>Modules Optionnels</strong> : Les étudiants choisissent
              parmi ces modules selon les contraintes définies.
            </Typography>
          </Alert>

          {/* Add Module Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ajouter un module à la spécialité
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={moduleType}
                    label="Type"
                    onChange={(e) =>
                      setModuleType(e.target.value as SpecializationModuleType)
                    }
                    disabled={isAdding}
                  >
                    <MenuItem value="Obligatoire">Obligatoire</MenuItem>
                    <MenuItem value="Optionnel">Optionnel</MenuItem>
                  </Select>
                </FormControl>

                {moduleType === 'Optionnel' && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Capacité (places)"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Laisser vide = illimité"
                    disabled={isAdding}
                  />
                )}

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
          </Box>

          {/* Modules List with Tabs */}
          <Box>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab
                label={`Obligatoires (${obligatoryModules.length})`}
              />
              <Tab label={`Optionnels (${electiveModules.length})`} />
            </Tabs>

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Erreur lors du chargement des modules
                </Typography>
                <Typography variant="caption" component="div">
                  {error}
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                  <strong>Endpoint appelé :</strong> GET /admin/specializations/{specialization.id}/modules
                </Typography>
                <Typography variant="caption" component="div" color="warning.main" sx={{ mt: 1 }}>
                  ⚠️ Vérifiez que cet endpoint existe dans le backend Laravel
                </Typography>
              </Alert>
            )}

            {/* Obligatory Modules Tab */}
            <TabPanel value={tabValue} index={0}>
              {obligatoryModules.length === 0 ? (
                <Alert severity="warning">
                  Aucun module obligatoire pour cette spécialité
                </Alert>
              ) : (
                <List>
                  {obligatoryModules.map((sm: any) => (
                    <ListItem
                      key={sm.id}
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
                              {sm.module?.code}
                            </Typography>
                            <Chip
                              label={getSpecializationModuleTypeLabel(sm.type)}
                              size="small"
                              color={getSpecializationModuleTypeBadgeColor(sm.type)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {sm.module?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {sm.module?.credits_ects} crédits •{' '}
                              {sm.module?.coefficient} coef
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveModule(sm.module_id)}
                          disabled={isRemoving}
                        >
                          <i className="ri-delete-bin-line" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* Elective Modules Tab */}
            <TabPanel value={tabValue} index={1}>
              {electiveModules.length === 0 ? (
                <Alert severity="warning">
                  Aucun module optionnel pour cette spécialité
                </Alert>
              ) : (
                <List>
                  {electiveModules.map((sm: any) => (
                    <ListItem
                      key={sm.id}
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
                              {sm.module?.code}
                            </Typography>
                            <Chip
                              label={getSpecializationModuleTypeLabel(sm.type)}
                              size="small"
                              color={getSpecializationModuleTypeBadgeColor(sm.type)}
                            />
                            {sm.capacity && (
                              <Chip
                                label={`${sm.current_enrollment || 0}/${sm.capacity} places`}
                                size="small"
                                color={
                                  (sm.current_enrollment || 0) >= sm.capacity
                                    ? 'error'
                                    : 'default'
                                }
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {sm.module?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {sm.module?.credits} crédits •{' '}
                              {sm.module?.coefficient} coef
                              {sm.capacity
                                ? ` • Capacité: ${sm.capacity} places`
                                : ' • Capacité illimitée'}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveModule(sm.module_id)}
                          disabled={isRemoving}
                        >
                          <i className="ri-delete-bin-line" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
