'use client';

import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';

/**
 * Module option from API
 */
export interface ModuleOption {
  id: number;
  code: string;
  name: string;
  credits_ects: number;
  semester?: {
    id: number;
    name: string;
  };
  programme?: {
    id: number;
    name: string;
  };
}

/**
 * Props for ModuleSelector
 */
interface ModuleSelectorProps {
  selectedModuleId: number | null;
  semesterId: number | null;
  onModuleChange: (moduleId: number | null, moduleData: ModuleOption | null) => void;
}

/**
 * ModuleSelector Component
 * Dropdown for selecting a module to configure coefficients
 */
export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  selectedModuleId,
  semesterId,
  onModuleChange,
}) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch available modules for the selected semester
   */
  const fetchModules = useCallback(async () => {
    if (!semesterId) {
      setModules([]);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const client = createApiClient(tenantId);
      const response = await client.get<{ data: ModuleOption[] }>('/admin/modules', {
        params: { semester_id: semesterId },
      });

      setModules(response.data.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Erreur lors du chargement des modules');
    } finally {
      setLoading(false);
    }
  }, [semesterId, tenantId]);

  useEffect(() => {
    fetchModules();
    // Reset selected module when semester changes
    onModuleChange(null, null);
  }, [fetchModules]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="module-selector-label">Sélectionner un module</InputLabel>
      <Select
        labelId="module-selector-label"
        value={selectedModuleId ?? ''}
        onChange={(e) => {
          const moduleId = e.target.value ? Number(e.target.value) : null;
          const moduleData = moduleId ? modules.find((m) => m.id === moduleId) || null : null;

          onModuleChange(moduleId, moduleData);
        }}
        label="Sélectionner un module"
        disabled={loading || !semesterId}
        endAdornment={loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
      >
        <MenuItem value="">
          <em>Aucun module sélectionné</em>
        </MenuItem>
        {modules.map((module) => (
          <MenuItem key={module.id} value={module.id}>
            <Box>
              <Typography variant="body2" component="span" fontWeight="medium">
                {module.code}
              </Typography>
              <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                -
              </Typography>
              <Typography variant="body2" component="span">
                {module.name}
              </Typography>
              <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                ({module.semester.name}, {module.credits_ects} ECTS)
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
