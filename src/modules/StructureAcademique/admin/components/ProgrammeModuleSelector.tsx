/**
 * Sélecteur de modules pour un programme
 * Affiche les modules groupés par niveau avec checkboxes
 */

'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import type { Module, ModuleLevel } from '../../types/module.types';
import type { ProgrammeLevel } from '../../types/programmeLevel.types';
import { groupModulesByLevel } from '../../types/programmeModule.types';

interface ProgrammeModuleSelectorProps {
  availableModules: Module[];
  selectedModuleIds: number[];
  programmeLevels: string[]; // Peut être string[] ou ProgrammeLevel[]
  onChange: (moduleIds: number[]) => void;
  disabled?: boolean;
}

const LEVEL_LABELS: Record<ModuleLevel, string> = {
  L1: 'Licence 1',
  L2: 'Licence 2',
  L3: 'Licence 3',
  M1: 'Master 1',
  M2: 'Master 2',
};

const LEVEL_COLORS: Record<ModuleLevel, 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
  L1: 'primary',
  L2: 'info',
  L3: 'success',
  M1: 'secondary',
  M2: 'warning',
};

const ProgrammeModuleSelector: React.FC<ProgrammeModuleSelectorProps> = ({
  availableModules,
  selectedModuleIds,
  programmeLevels,
  onChange,
  disabled = false,
}) => {
  /**
   * Filtrer les modules selon les niveaux du programme
   */
  const filteredModules = useMemo(() => {
    console.log('🔍 ProgrammeModuleSelector - Debug:', {
      programmeLevels,
      availableModulesCount: availableModules.length,
      availableModules: availableModules.map(m => ({ id: m.id, code: m.code, level: m.level }))
    });
    
    if (programmeLevels.length === 0) {
      return availableModules;
    }
    
    const filtered = availableModules.filter(module => {
      const isIncluded = programmeLevels.includes(module.level as ProgrammeLevel);
      console.log(`  Module ${module.code} (${module.level}): ${isIncluded ? '✅ Inclus' : '❌ Exclu'}`);
      return isIncluded;
    });
    
    console.log('  Résultat filtrage:', filtered.length, 'modules');
    return filtered;
  }, [availableModules, programmeLevels]);

  /**
   * Détecter les modules sélectionnés qui ne correspondent pas aux niveaux
   */
  const incompatibleSelectedModules = useMemo(() => {
    return availableModules.filter(
      module =>
        selectedModuleIds.includes(module.id) &&
        !programmeLevels.includes(module.level as ProgrammeLevel)
    );
  }, [availableModules, selectedModuleIds, programmeLevels]);

  /**
   * Grouper les modules par niveau
   */
  const modulesByLevel = useMemo(() => {
    return groupModulesByLevel(filteredModules);
  }, [filteredModules]);

  /**
   * Gérer la sélection/désélection d'un module
   */
  const handleToggleModule = (moduleId: number) => {
    if (disabled) return;

    const newSelection = selectedModuleIds.includes(moduleId)
      ? selectedModuleIds.filter(id => id !== moduleId)
      : [...selectedModuleIds, moduleId];

    onChange(newSelection);
  };

  /**
   * Sélectionner/désélectionner tous les modules d'un niveau
   */
  const handleToggleLevel = (level: ModuleLevel, checked: boolean) => {
    if (disabled) return;

    const levelModuleIds = filteredModules
      .filter(m => m.level === level)
      .map(m => m.id);

    const newSelection = checked
      ? [...new Set([...selectedModuleIds, ...levelModuleIds])]
      : selectedModuleIds.filter(id => !levelModuleIds.includes(id));

    onChange(newSelection);
  };

  /**
   * Vérifier si tous les modules d'un niveau sont sélectionnés
   */
  const isLevelFullySelected = (level: ModuleLevel): boolean => {
    const levelModules = filteredModules.filter(m => m.level === level);
    if (levelModules.length === 0) return false;
    return levelModules.every(m => selectedModuleIds.includes(m.id));
  };

  /**
   * Vérifier si certains modules d'un niveau sont sélectionnés
   */
  const isLevelPartiallySelected = (level: ModuleLevel): boolean => {
    const levelModules = filteredModules.filter(m => m.level === level);
    const selectedCount = levelModules.filter(m => selectedModuleIds.includes(m.id)).length;
    return selectedCount > 0 && selectedCount < levelModules.length;
  };

  if (programmeLevels.length === 0) {
    return (
      <Alert severity="warning">
        Veuillez d'abord associer des niveaux à ce programme avant de sélectionner des modules.
      </Alert>
    );
  }

  if (filteredModules.length === 0) {
    const hasModulesButWrongLevel = availableModules.length > 0;
    
    return (
      <Alert severity={hasModulesButWrongLevel ? 'warning' : 'info'}>
        {hasModulesButWrongLevel ? (
          <>
            <Typography variant="body2" gutterBottom>
              <strong>Aucun module compatible trouvé.</strong>
            </Typography>
            <Typography variant="body2">
              Ce programme nécessite des modules de niveau <strong>{programmeLevels.join(', ')}</strong>.
              Les modules existants ne correspondent pas à ces niveaux.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Créez des modules pour les niveaux {programmeLevels.join(', ')} ou vérifiez les associations existantes.
            </Typography>
          </>
        ) : (
          <>
            Aucun module disponible pour les niveaux de ce programme.
            Créez d'abord des modules correspondant aux niveaux {programmeLevels.join(', ')}.
          </>
        )}
      </Alert>
    );
  }

  return (
    <Box>
      {incompatibleSelectedModules.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>⚠️ Modules incompatibles détectés</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Les modules suivants sont associés mais ne correspondent pas aux niveaux du programme ({programmeLevels.join(', ')}):
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            {incompatibleSelectedModules.map(module => (
              <li key={module.id}>
                <Typography variant="body2">
                  <strong>{module.code}</strong> - {module.name} (Niveau: <strong>{module.level}</strong>)
                </Typography>
              </li>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Ces modules seront automatiquement dissociés lors de la sauvegarde.
          </Typography>
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sélectionnez les modules à associer au programme. Seuls les modules correspondant aux
        niveaux du programme ({programmeLevels.join(', ')}) sont affichés.
      </Typography>

      <Stack spacing={1}>
        {modulesByLevel.map(({ level, modules }) => (
          <Accordion key={level} defaultExpanded>
            <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Checkbox
                  checked={isLevelFullySelected(level)}
                  indeterminate={isLevelPartiallySelected(level)}
                  onChange={(e) => handleToggleLevel(level, e.target.checked)}
                  disabled={disabled}
                  onClick={(e) => e.stopPropagation()}
                />
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {LEVEL_LABELS[level]}
                </Typography>
                <Chip
                  label={`${modules.filter(m => selectedModuleIds.includes(m.id)).length}/${modules.length}`}
                  size="small"
                  color={LEVEL_COLORS[level]}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {modules.map(module => (
                  <FormControlLabel
                    key={module.id}
                    control={
                      <Checkbox
                        checked={selectedModuleIds.includes(module.id)}
                        onChange={() => handleToggleModule(module.id)}
                        disabled={disabled}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>{module.code}</strong> - {module.name}
                        </Typography>
                        <Chip
                          label={`${module.credits_ects} ECTS`}
                          size="small"
                          variant="outlined"
                        />
                        {module.is_eliminatory && (
                          <Chip
                            label="Éliminatoire"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={module.type}
                          size="small"
                          color={module.type === 'Obligatoire' ? 'primary' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>{selectedModuleIds.length}</strong> module(s) sélectionné(s) sur{' '}
            <strong>{filteredModules.length}</strong> disponible(s)
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default ProgrammeModuleSelector;
