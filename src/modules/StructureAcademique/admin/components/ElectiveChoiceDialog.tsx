/**
 * Elective Choice Dialog - Choix des Options par Étudiant
 */

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
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  useAvailableElectives,
  useElectiveChoiceMutations,
} from '../hooks/useCurriculum';
import type { Specialization } from '../../types';

interface ElectiveChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  specialization: Specialization;
  studentId: number;
}

export const ElectiveChoiceDialog: React.FC<ElectiveChoiceDialogProps> = ({
  open,
  onClose,
  specialization,
  studentId,
}) => {
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);

  // Fetch available electives
  const { data: electivesData, loading: isLoading, error } = useAvailableElectives(
    specialization.id
  );

  // Mutations
  const { chooseElectives, confirmElectives, isChoosing, isConfirming } =
    useElectiveChoiceMutations();

  const constraints = electivesData?.constraints;
  const electives = electivesData?.data || [];

  // Validation
  const selectedCount = selectedModuleIds.length;
  const minElectives = constraints?.min_electives || 0;
  const maxElectives = constraints?.max_electives || 0;
  const isValid =
    selectedCount >= minElectives && selectedCount <= maxElectives;

  const handleToggleModule = (moduleId: number) => {
    setSelectedModuleIds((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        // Check if max reached
        if (maxElectives && prev.length >= maxElectives) {
          alert(`Vous ne pouvez sélectionner que ${maxElectives} options maximum`);
          return prev;
        }
        return [...prev, moduleId];
      }
    });
  };

  const handleSaveChoices = async () => {
    try {
      await chooseElectives(specialization.id, {
        student_id: studentId,
        specialization_id: specialization.id,
        module_ids: selectedModuleIds,
      });
      alert('Vos choix ont été enregistrés avec succès');
    } catch (error: any) {
      alert(
        error.message || 'Erreur lors de l\'enregistrement des choix'
      );
    }
  };

  const handleConfirmChoices = async () => {
    if (!isValid) {
      alert(
        `Vous devez sélectionner entre ${minElectives} et ${maxElectives} options`
      );
      return;
    }

    if (
      !confirm(
        'Êtes-vous sûr de vouloir confirmer vos choix ? Cette action est définitive.'
      )
    )
      return;

    try {
      await confirmElectives(specialization.id, studentId);
      alert('Vos choix ont été confirmés avec succès');
      onClose();
    } catch (error: any) {
      alert(
        error.message || 'Erreur lors de la confirmation des choix'
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Choix des Options - {specialization.name}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Constraints Info */}
          {constraints && (
            <Alert
              severity={isValid ? 'success' : 'warning'}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Typography variant="body2">
                Vous devez choisir <strong>entre {minElectives} et{' '}
                {maxElectives} options</strong>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption">
                  Sélectionnés: {selectedCount}/{maxElectives}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(selectedCount / maxElectives) * 100}
                  sx={{ flex: 1 }}
                  color={isValid ? 'success' : 'warning'}
                />
              </Box>
            </Alert>
          )}

          {/* Loading */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error">
              Erreur lors du chargement des options disponibles
            </Alert>
          )}

          {/* Electives List */}
          {!isLoading && !error && electives.length === 0 && (
            <Alert severity="info">
              Aucune option disponible pour cette spécialité
            </Alert>
          )}

          {!isLoading && !error && electives.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Options disponibles ({electives.length})
              </Typography>
              <List>
                {electives.map((elective: any) => {
                  const isSelected = selectedModuleIds.includes(
                    elective.module.id
                  );
                  const isFull = elective.is_full;
                  const canSelect = elective.can_enroll;

                  return (
                    <ListItem
                      key={elective.module.id}
                      sx={{
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                        opacity: !canSelect ? 0.6 : 1,
                      }}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          checked={isSelected}
                          onChange={() => handleToggleModule(elective.module.id)}
                          disabled={!canSelect || isChoosing}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Typography variant="body1" fontWeight="medium">
                              {elective.module.code}
                            </Typography>
                            {isFull && (
                              <Chip
                                label="Complet"
                                size="small"
                                color="error"
                              />
                            )}
                            {elective.capacity && (
                              <Chip
                                label={`${elective.current_enrollment}/${elective.capacity} places`}
                                size="small"
                                color={isFull ? 'error' : 'default'}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {elective.module.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {elective.module.credits_ects} crédits •{' '}
                              {elective.module.coefficient} coef
                              {elective.module.description && (
                                <> • {elective.module.description}</>
                              )}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isChoosing || isConfirming}>
          Annuler
        </Button>
        <Button
          variant="outlined"
          onClick={handleSaveChoices}
          disabled={!isValid || isChoosing || isConfirming}
        >
          {isChoosing ? <CircularProgress size={24} /> : 'Enregistrer'}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmChoices}
          disabled={!isValid || isChoosing || isConfirming}
        >
          {isConfirming ? <CircularProgress size={24} /> : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
