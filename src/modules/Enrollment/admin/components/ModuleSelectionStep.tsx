'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  Divider,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material';
import type { AvailableModule, ModuleSelection } from '../../types/pedagogicalEnrollment.types';

interface ModuleSelectionStepProps {
  mandatoryModules: AvailableModule[];
  optionalModules: AvailableModule[];
  selectedModules: ModuleSelection[];
  totalCredits: number;
  minCredits: number;
  maxCredits: number;
  onToggleModule: (moduleId: number) => void;
  translations: {
    mandatory: string;
    optional: string;
    credits: string;
    totalCredits: string;
    minCredits: string;
    maxCredits: string;
    prerequisiteNotMet: string;
    moduleFull: string;
    capacity: string;
    enrolled: string;
    remaining: string;
    selectModules: string;
    creditsWarning: string;
    creditsError: string;
  };
}

/**
 * Module Card Component
 */
const ModuleCard: React.FC<{
  module: AvailableModule;
  isSelected: boolean;
  isMandatory: boolean;
  onToggle: () => void;
  translations: ModuleSelectionStepProps['translations'];
}> = ({ module, isSelected, isMandatory, onToggle, translations }) => {
  const [expanded, setExpanded] = React.useState(false);

  const isDisabled = module.prerequisite_status === 'not_met' || module.is_full;
  const canSelect = !isDisabled && !isMandatory;

  const getStatusIcon = () => {
    if (module.prerequisite_status === 'not_met') {
      return (
        <Tooltip title={module.prerequisite_message || translations.prerequisiteNotMet}>
          <i className="ri-lock-fill" style={{ fontSize: 18, color: '#f44336' }} />
        </Tooltip>
      );
    }

    if (module.is_full) {
      return (
        <Tooltip title={translations.moduleFull}>
          <i className="ri-error-warning-fill" style={{ fontSize: 18, color: '#ed6c02' }} />
        </Tooltip>
      );
    }

    if (isSelected) {
      return <i className="ri-checkbox-circle-fill" style={{ fontSize: 18, color: '#4caf50' }} />;
    }

    return null;
  };

  const capacityPercentage = module.capacity
    ? (module.enrolled_count / module.capacity) * 100
    : 0;

  return (
    <Card
      sx={{
        mb: 1,
        opacity: isDisabled ? 0.6 : 1,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isDisabled ? 'none' : 2,
        },
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          {canSelect && (
            <Checkbox
              checked={isSelected}
              onChange={onToggle}
              disabled={isDisabled}
              size="small"
            />
          )}
          {isMandatory && (
            <Tooltip title="Module obligatoire">
              <i className="ri-graduation-cap-fill" style={{ fontSize: 18, color: '#1976d2' }} />
            </Tooltip>
          )}

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                {module.code}
              </Typography>
              <Chip
                label={`${module.credits_ects} ${translations.credits}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {getStatusIcon()}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {module.name}
            </Typography>
          </Box>

          {module.capacity && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <i className="ri-group-line" style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.54)' }} />
              <Typography variant="caption" color="text.secondary">
                {module.enrolled_count}/{module.capacity}
              </Typography>
            </Box>
          )}

          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <i className={expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box mt={2}>
            {module.description && (
              <Typography variant="body2" color="text.secondary" mb={1}>
                {module.description}
              </Typography>
            )}

            {module.capacity && (
              <Box mb={1}>
                <Typography variant="caption" color="text.secondary">
                  {translations.capacity}: {module.enrolled_count}/{module.capacity} ({translations.remaining}: {module.remaining_capacity})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={capacityPercentage}
                  color={capacityPercentage >= 90 ? 'error' : capacityPercentage >= 70 ? 'warning' : 'primary'}
                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            {module.prerequisites && module.prerequisites.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Prérequis:
                </Typography>
                {module.prerequisites.map(prereq => (
                  <Box key={prereq.id} display="flex" alignItems="center" gap={0.5} ml={1}>
                    {prereq.is_met ? (
                      <i className="ri-checkbox-circle-fill" style={{ fontSize: 14, color: '#4caf50' }} />
                    ) : (
                      <i className="ri-lock-fill" style={{ fontSize: 14, color: '#f44336' }} />
                    )}
                    <Typography variant="caption">
                      {prereq.prerequisite_module_code} - {prereq.prerequisite_module_name}
                      {prereq.min_grade && ` (min: ${prereq.min_grade}/20)`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

/**
 * Module Selection Step Component
 */
export const ModuleSelectionStep: React.FC<ModuleSelectionStepProps> = ({
  mandatoryModules,
  optionalModules,
  selectedModules,
  totalCredits,
  minCredits,
  maxCredits,
  onToggleModule,
  translations,
}) => {
  const isModuleSelected = (moduleId: number) =>
    selectedModules.some(m => m.module_id === moduleId);

  const creditStatus = useMemo(() => {
    if (totalCredits < minCredits) {
      return { type: 'error' as const, message: translations.creditsError };
    }

    if (totalCredits > maxCredits) {
      return { type: 'warning' as const, message: translations.creditsWarning };
    }

    return { type: 'success' as const, message: '' };
  }, [totalCredits, minCredits, maxCredits, translations]);

  const mandatoryCredits = useMemo(
    () => mandatoryModules.reduce((sum, m) => sum + m.credits_ects, 0),
    [mandatoryModules]
  );

  const selectedOptionalCredits = useMemo(
    () =>
      optionalModules
        .filter(m => isModuleSelected(m.id))
        .reduce((sum, m) => sum + m.credits_ects, 0),
    [optionalModules, selectedModules]
  );

  return (
    <Box>
      {/* Credit Summary */}
      <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {totalCredits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translations.totalCredits}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={4}>
              <Box textAlign="center">
                <Typography variant="h6">{mandatoryCredits}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {translations.mandatory}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={4}>
              <Box textAlign="center">
                <Typography variant="h6">{selectedOptionalCredits}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {translations.optional}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={Math.min((totalCredits / maxCredits) * 100, 100)}
              color={creditStatus.type === 'error' ? 'error' : creditStatus.type === 'warning' ? 'warning' : 'success'}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                {translations.minCredits}: {minCredits}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {translations.maxCredits}: {maxCredits}
              </Typography>
            </Box>
          </Box>

          {creditStatus.message && (
            <Alert severity={creditStatus.type} sx={{ mt: 2 }}>
              {creditStatus.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mandatory Modules */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <i className="ri-graduation-cap-fill" style={{ color: '#1976d2', fontSize: 24 }} />
          {translations.mandatory} ({mandatoryModules.length})
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Les modules obligatoires sont automatiquement sélectionnés.
          </Typography>
        </Alert>
        {mandatoryModules.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            isSelected={isModuleSelected(module.id)}
            isMandatory={true}
            onToggle={() => {}}
            translations={translations}
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Optional Modules */}
      <Box>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <i className="ri-information-fill" style={{ color: '#9c27b0', fontSize: 24 }} />
          {translations.optional} ({optionalModules.length})
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {translations.selectModules}
          </Typography>
        </Alert>
        {optionalModules.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            Aucun module optionnel disponible pour ce semestre.
          </Typography>
        ) : (
          optionalModules.map(module => (
            <ModuleCard
              key={module.id}
              module={module}
              isSelected={isModuleSelected(module.id)}
              isMandatory={false}
              onToggle={() => onToggleModule(module.id)}
              translations={translations}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default ModuleSelectionStep;
