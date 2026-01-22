/**
 * Curriculum Tree View - Visualisation Arbre de Décision
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCoreCurriculum } from '../hooks/useCurriculum';
import { useSpecializations } from '../hooks/useSpecializations';
import { useSpecializationModules } from '../hooks/useCurriculum';
import type { Programme } from '../../types';
import { getSpecializationModuleTypeLabel, getSpecializationModuleTypeBadgeColor } from '../../types';

interface CurriculumTreeViewProps {
  programme: Programme;
  level: string;
}

interface SpecializationNodeProps {
  specializationId: number;
  specializationName: string;
}

const SpecializationNode: React.FC<SpecializationNodeProps> = ({
  specializationId,
  specializationName,
}) => {
  const { data: modules, loading: isLoading } = useSpecializationModules(specializationId);

  const obligatoryModules = modules?.filter((m: any) => m.type === 'Obligatoire') || [];
  const electiveModules = modules?.filter((m: any) => m.type === 'Optionnel') || [];

  if (isLoading) {
    return <CircularProgress size={20} />;
  }

  return (
    <Box sx={{ pl: 4, borderLeft: '2px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        📚 {specializationName}
      </Typography>

      {/* Obligatory Modules */}
      {obligatoryModules.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Modules Obligatoires ({obligatoryModules.length})
          </Typography>
          <List dense>
            {obligatoryModules.map((sm: any) => (
              <ListItem key={sm.id} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {sm.module?.code} - {sm.module?.name}
                      </Typography>
                      <Chip
                        label={getSpecializationModuleTypeLabel(sm.type)}
                        size="small"
                        color={getSpecializationModuleTypeBadgeColor(sm.type)}
                      />
                    </Box>
                  }
                  secondary={`${sm.module?.credits_ects} crédits`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Elective Modules */}
      {electiveModules.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Modules Optionnels ({electiveModules.length})
          </Typography>
          <List dense>
            {electiveModules.map((sm: any) => (
              <ListItem key={sm.id} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {sm.module?.code} - {sm.module?.name}
                      </Typography>
                      <Chip
                        label={getSpecializationModuleTypeLabel(sm.type)}
                        size="small"
                        color={getSpecializationModuleTypeBadgeColor(sm.type)}
                      />
                      {sm.capacity && (
                        <Chip
                          label={`Max: ${sm.capacity}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={`${sm.module?.credits_ects} crédits`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {obligatoryModules.length === 0 && electiveModules.length === 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          Aucun module configuré pour cette spécialité
        </Alert>
      )}
    </Box>
  );
};

export const CurriculumTreeView: React.FC<CurriculumTreeViewProps> = ({
  programme,
  level,
}) => {
  // Fetch core curriculum
  const {
    data: coreCurriculum,
    loading: isLoadingCore,
    error: errorCore,
  } = useCoreCurriculum(programme.id, level);

  // Fetch specializations for this level
  const { specializations, loading: isLoadingSpecs } = useSpecializations();

  // Filter by programme and level
  const filteredSpecializations = specializations.filter(
    (spec) => spec.programme_id === programme.id && spec.available_from_level === level
  );

  if (isLoadingCore || isLoadingSpecs) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorCore) {
    return (
      <Alert severity="error">
        Erreur lors du chargement du curriculum
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Arbre de Décision - {programme.code} ({level})
      </Typography>

      {/* Core Curriculum Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              🎯 Tronc Commun
            </Typography>
            <Chip
              label={`${coreCurriculum?.length || 0} modules`}
              size="small"
              color="primary"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {coreCurriculum && coreCurriculum.length > 0 ? (
            <List>
              {coreCurriculum.map((cc: any) => (
                <ListItem key={cc.id}>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        {cc.module?.code} - {cc.module?.name}
                      </Typography>
                    }
                    secondary={`${cc.module?.credits_ects} crédits • ${cc.module?.coefficient} coef`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">
              Aucun module dans le tronc commun
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Specializations Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              🎓 Spécialisations
            </Typography>
            <Chip
              label={`${filteredSpecializations.length} spécialités`}
              size="small"
              color="secondary"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {filteredSpecializations.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredSpecializations.map((spec: any) => (
                <SpecializationNode
                  key={spec.id}
                  specializationId={spec.id}
                  specializationName={spec.name}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              Aucune spécialisation configurée pour ce niveau
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Légende:</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
          <Chip label="Tronc Commun" size="small" color="primary" />
          <Chip label="Obligatoire" size="small" color="success" />
          <Chip label="Optionnel" size="small" color="info" />
        </Box>
      </Box>
    </Paper>
  );
};
