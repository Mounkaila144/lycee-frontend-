'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import type { AvailableModule, ModuleSelection, ModuleGroup } from '../../types/pedagogicalEnrollment.types';

interface GroupSelectionStepProps {
  modulesWithGroups: AvailableModule[];
  selectedModules: ModuleSelection[];
  onUpdateGroup: (moduleId: number, groupId: number) => void;
  translations: {
    selectGroup: string;
    groupCapacity: string;
    noGroupsRequired: string;
    groupFull: string;
    spotsRemaining: string;
    cm: string;
    td: string;
    tp: string;
  };
}

/**
 * Group Option Component
 */
const GroupOption: React.FC<{
  group: ModuleGroup;
  isSelected: boolean;
  translations: GroupSelectionStepProps['translations'];
}> = ({ group, isSelected, translations }) => {
  const capacityPercentage = (group.enrolled_count / group.capacity) * 100;
  const isFull = group.is_full;

  const getGroupTypeLabel = () => {
    switch (group.type) {
      case 'CM':
        return translations.cm;
      case 'TD':
        return translations.td;
      case 'TP':
        return translations.tp;
      default:
        return group.type;
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 1,
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        opacity: isFull && !isSelected ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            {group.name}
          </Typography>
          <Chip
            label={getGroupTypeLabel()}
            size="small"
            color={group.type === 'CM' ? 'primary' : group.type === 'TD' ? 'secondary' : 'default'}
            variant="outlined"
          />
          {isSelected && <i className="ri-checkbox-circle-fill" style={{ fontSize: 18, color: '#4caf50' }} />}
          {isFull && !isSelected && (
            <Tooltip title={translations.groupFull}>
              <i className="ri-error-warning-fill" style={{ fontSize: 18, color: '#f44336' }} />
            </Tooltip>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {group.enrolled_count}/{group.capacity}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={capacityPercentage}
        color={isFull ? 'error' : capacityPercentage >= 80 ? 'warning' : 'primary'}
        sx={{ height: 4, borderRadius: 2, mb: 1 }}
      />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {group.remaining_capacity} {translations.spotsRemaining}
        </Typography>
        {group.schedule_info && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <i className="ri-time-line" style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.54)' }} />
            <Typography variant="caption" color="text.secondary">
              {group.schedule_info}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

/**
 * Module Group Selection Card
 */
const ModuleGroupCard: React.FC<{
  module: AvailableModule;
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
  translations: GroupSelectionStepProps['translations'];
}> = ({ module, selectedGroupId, onSelectGroup, translations }) => {
  if (!module.groups || module.groups.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <i className="ri-team-fill" style={{ fontSize: 24, color: '#1976d2' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {module.code} - {module.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {module.credits_ects} ECTS
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {translations.selectGroup}
        </Typography>

        <RadioGroup
          value={selectedGroupId || ''}
          onChange={(e) => onSelectGroup(Number(e.target.value))}
        >
          <Grid container spacing={2}>
            {module.groups.map(group => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <FormControlLabel
                  value={group.id}
                  control={<Radio size="small" sx={{ display: 'none' }} />}
                  label={
                    <GroupOption
                      group={group}
                      isSelected={selectedGroupId === group.id}
                      translations={translations}
                    />
                  }
                  disabled={group.is_full && selectedGroupId !== group.id}
                  sx={{
                    m: 0,
                    width: '100%',
                    cursor: group.is_full && selectedGroupId !== group.id ? 'not-allowed' : 'pointer',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

/**
 * Group Selection Step Component
 */
export const GroupSelectionStep: React.FC<GroupSelectionStepProps> = ({
  modulesWithGroups,
  selectedModules,
  onUpdateGroup,
  translations,
}) => {
  const getSelectedGroupId = (moduleId: number): number | undefined => {
    const selection = selectedModules.find(m => m.module_id === moduleId);

    return selection?.group_id;
  };

  const allGroupsSelected = modulesWithGroups.every(m => {
    const selection = selectedModules.find(s => s.module_id === m.id);

    return selection?.group_id !== undefined;
  });

  if (modulesWithGroups.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <i className="ri-team-line" style={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.54)', marginBottom: 16, display: 'block' }} />
        <Typography variant="h6" color="text.secondary">
          {translations.noGroupsRequired}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aucun des modules sélectionnés ne nécessite de choix de groupe TD/TP.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Sélectionnez un groupe TD/TP pour chaque module. Les groupes avec peu de places restantes sont indiqués en orange.
        </Typography>
      </Alert>

      {!allGroupsSelected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Vous devez sélectionner un groupe pour chaque module avant de continuer.
          </Typography>
        </Alert>
      )}

      {modulesWithGroups.map(module => (
        <ModuleGroupCard
          key={module.id}
          module={module}
          selectedGroupId={getSelectedGroupId(module.id)}
          onSelectGroup={(groupId) => onUpdateGroup(module.id, groupId)}
          translations={translations}
        />
      ))}
    </Box>
  );
};

export default GroupSelectionStep;
