'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
} from '@mui/material';
import { useEliminatoryModules } from '../hooks/useProgression';
import type { Programme } from '../../types/programme.types';
import type { ProgressionLevel } from '../../types/progression.types';
import type { Module } from '../../types/module.types';
import { useModules } from '../hooks/useModules';

interface EliminatoryModulesDialogProps {
  open: boolean;
  onClose: () => void;
  programme: Programme | null;
}

const PROGRESSION_LEVELS: ProgressionLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2'];

const EliminatoryModulesDialog: React.FC<EliminatoryModulesDialogProps> = ({
  open,
  onClose,
  programme,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ProgressionLevel>('L1');
  const [adding, setAdding] = useState(false);

  const { modules: eliminatoryModules, loading, error, addModule, removeModule } = useEliminatoryModules(
    programme?.id || 0
  );

  // Fetch all modules for autocomplete
  const { modules: allModules, loading: modulesLoading } = useModules();

  // Filter modules: only those not already eliminatory
  const availableModules = useMemo(() => {
    const eliminatoryModuleIds = eliminatoryModules.map((em) => em.module_id);
    return allModules.filter((m) => !eliminatoryModuleIds.includes(m.id));
  }, [allModules, eliminatoryModules]);

  // Group eliminatory modules by level
  const modulesByLevel = useMemo(() => {
    const grouped: Record<ProgressionLevel, typeof eliminatoryModules> = {
      L1: [],
      L2: [],
      L3: [],
      M1: [],
      M2: [],
    };

    eliminatoryModules.forEach((em) => {
      if (grouped[em.level]) {
        grouped[em.level].push(em);
      }
    });

    return grouped;
  }, [eliminatoryModules]);

  const handleAdd = async () => {
    if (!selectedModuleId || !programme) return;

    try {
      setAdding(true);
      await addModule({
        programme_id: programme.id,
        module_id: selectedModuleId,
        level: selectedLevel,
      });
      setSelectedModuleId(null);
      setSelectedLevel('L1');
    } catch (error) {
      console.error('Error adding eliminatory module:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (moduleId: number) => {
    if (!programme) return;

    if (confirm('Êtes-vous sûr de vouloir retirer ce module éliminatoire ?')) {
      try {
        await removeModule(moduleId);
      } catch (error) {
        console.error('Error removing eliminatory module:', error);
      }
    }
  };

  if (!programme) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5">Modules Éliminatoires</Typography>
            <Typography variant="body2" color="text.secondary">
              {programme.code} - {programme.libelle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Un module éliminatoire doit être validé obligatoirement pour permettre la progression, même si
            l'étudiant a suffisamment de crédits.
          </Typography>
        </Alert>

        {/* Add Section */}
        <Box sx={{ mb: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Ajouter un Module Éliminatoire
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={availableModules}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                value={availableModules.find((m) => m.id === selectedModuleId) || null}
                onChange={(_, newValue) => setSelectedModuleId(newValue?.id || null)}
                renderInput={(params) => (
                  <TextField {...params} label="Module" placeholder="Sélectionner un module" />
                )}
                loading={modulesLoading}
                disabled={adding}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Niveau"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as ProgressionLevel)}
                disabled={adding}
              >
                {PROGRESSION_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAdd}
                disabled={!selectedModuleId || adding}
                startIcon={adding ? <CircularProgress size={16} /> : <i className="ri-add-line" />}
              >
                Ajouter
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* List Section */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : eliminatoryModules.length === 0 ? (
          <Alert severity="warning">Aucun module éliminatoire défini pour ce programme.</Alert>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Modules Éliminatoires par Niveau
            </Typography>
            {PROGRESSION_LEVELS.map((level) => {
              const levelModules = modulesByLevel[level];
              if (levelModules.length === 0) return null;

              return (
                <Box key={level} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Niveau {level}
                  </Typography>
                  <List dense>
                    {levelModules.map((em, index) => (
                      <React.Fragment key={em.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemove(em.module_id)}
                              color="error"
                            >
                              <i className="ri-delete-bin-line" />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  [{em.module?.code}] {em.module?.name}
                                </Typography>
                                <Chip
                                  label="Éliminatoire"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {em.module?.credits_ects} ECTS • {em.module?.semester}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EliminatoryModulesDialog;
