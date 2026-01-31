'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';

import { useTenant } from '@/shared/lib/tenant-context';
import { moduleService } from '@/modules/StructureAcademique/admin/services/moduleService';
import { transferService } from '../services/transferService';
import { useEquivalences } from '../hooks/useTransfers';

import type { Module } from '@/modules/StructureAcademique/types/module.types';
import type { Transfer, Equivalence, EquivalenceFormData, EquivalenceType } from '../../types/transfer.types';

interface EquivalenceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transfer: Transfer;
  equivalence?: Equivalence | null;
}

const getEquivalenceTypes = (t: (key: string) => string): { value: EquivalenceType; label: string }[] => [
  { value: 'Full', label: t('Full equivalence') },
  { value: 'Partial', label: t('Partial equivalence') },
  { value: 'None', label: t('No equivalence') },
  { value: 'Exemption', label: t('Exemption') },
];

/**
 * EquivalenceFormDialog Component
 * Dialog for creating or editing an equivalence
 */
export const EquivalenceFormDialog = ({
  open,
  onClose,
  onSuccess,
  transfer,
  equivalence,
}: EquivalenceFormDialogProps) => {
  const { t } = useTranslation('Enrollment');
  const { tenantId } = useTenant();
  const { createEquivalence, updateEquivalence } = useEquivalences(transfer.id);
  const isEditing = !!equivalence;

  // Form state
  const [formData, setFormData] = useState<EquivalenceFormData>({
    origin_module_code: '',
    origin_module_name: '',
    origin_ects: 0,
    origin_hours: 0,
    origin_grade: null,
    target_module_id: null,
    equivalence_type: 'Full',
    equivalence_percentage: 100,
    granted_ects: 0,
    granted_grade: null,
    notes: '',
  });

  // Modules state
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loadingModules, setLoadingModules] = useState(false);
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load modules for the target program
  useEffect(() => {
    if (!open) return;

    const loadModules = async () => {
      try {
        setLoadingModules(true);
        const response = await moduleService.getModules(
          {
            programme_id: transfer.target_program_id,
            per_page: 100,
          },
          tenantId || undefined
        );
        setModules(response.data);
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };

    loadModules();
  }, [open, transfer.target_program_id, tenantId]);

  // Initialize form when dialog opens or equivalence changes
  useEffect(() => {
    if (open && equivalence) {
      setFormData({
        origin_module_code: equivalence.origin_module_code || '',
        origin_module_name: equivalence.origin_module_name,
        origin_ects: equivalence.origin_ects,
        origin_hours: equivalence.origin_hours,
        origin_grade: equivalence.origin_grade,
        target_module_id: equivalence.target_module_id,
        equivalence_type: equivalence.equivalence_type,
        equivalence_percentage: equivalence.equivalence_percentage,
        granted_ects: equivalence.granted_ects,
        granted_grade: equivalence.granted_grade,
        notes: equivalence.notes || '',
      });

      // Set selected module if available
      if (equivalence.target_module) {
        setSelectedModule(equivalence.target_module as unknown as Module);
      }
    } else if (open) {
      // Reset form for new equivalence
      setFormData({
        origin_module_code: '',
        origin_module_name: '',
        origin_ects: 0,
        origin_hours: 0,
        origin_grade: null,
        target_module_id: null,
        equivalence_type: 'Full',
        equivalence_percentage: 100,
        granted_ects: 0,
        granted_grade: null,
        notes: '',
      });
      setSelectedModule(null);
    }
  }, [open, equivalence]);

  // Update granted ECTS when equivalence type changes
  useEffect(() => {
    if (formData.equivalence_type === 'Full' && selectedModule) {
      setFormData(prev => ({
        ...prev,
        equivalence_percentage: 100,
        granted_ects: selectedModule.credits_ects || prev.origin_ects,
      }));
    } else if (formData.equivalence_type === 'None') {
      setFormData(prev => ({
        ...prev,
        equivalence_percentage: 0,
        granted_ects: 0,
      }));
    }
  }, [formData.equivalence_type, selectedModule]);

  // Handle field changes
  const handleChange = useCallback((field: keyof EquivalenceFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle module selection
  const handleModuleChange = useCallback((_: any, module: Module | null) => {
    setSelectedModule(module);
    setFormData(prev => ({
      ...prev,
      target_module_id: module?.id || null,
      granted_ects: module?.credits_ects || prev.origin_ects,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.origin_module_name.trim()) {
      setError(t('Origin module name is required'));

      return;
    }

    if (!formData.origin_ects || formData.origin_ects <= 0) {
      setError(t('Origin ECTS count is required'));

      return;
    }

    if (!formData.equivalence_type) {
      setError(t('Equivalence type is required'));

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit: EquivalenceFormData = {
        ...formData,
        target_module_id: selectedModule?.id || null,
      };

      if (isEditing && equivalence) {
        await updateEquivalence(equivalence.id, dataToSubmit);
      } else {
        await createEquivalence(dataToSubmit);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || t('Error during save');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const EQUIVALENCE_TYPES = getEquivalenceTypes(t);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-exchange-line" />
          <Typography variant="h6">
            {isEditing ? t('Edit equivalence') : t('Add equivalence')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Origin Module Information */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t('Origin module')}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label={t('Module name')}
                value={formData.origin_module_name}
                onChange={e => handleChange('origin_module_name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label={t('Code')}
                value={formData.origin_module_code || ''}
                onChange={e => handleChange('origin_module_code', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label={t('ECTS')}
                type="number"
                value={formData.origin_ects || ''}
                onChange={e => handleChange('origin_ects', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 30 }}
                required
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label={t('Hours')}
                type="number"
                value={formData.origin_hours || ''}
                onChange={e => handleChange('origin_hours', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label={t('Grade obtained /20')}
                type="number"
                value={formData.origin_grade !== null ? formData.origin_grade : ''}
                onChange={e => handleChange('origin_grade', e.target.value ? parseFloat(e.target.value) : null)}
                inputProps={{ min: 0, max: 20, step: 0.5 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Target Module and Equivalence Type */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t('Equivalence')}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={modules}
                value={selectedModule}
                onChange={handleModuleChange}
                getOptionLabel={option => `${option.code} - ${option.nom}`}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={t('Target module')}
                    placeholder={t('Search for a module...')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingModules ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={loadingModules}
                noOptionsText={t('No module found')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>{t('Equivalence type')}</InputLabel>
                <Select
                  value={formData.equivalence_type}
                  label={t('Equivalence type')}
                  onChange={e => handleChange('equivalence_type', e.target.value as EquivalenceType)}
                >
                  {EQUIVALENCE_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.equivalence_type === 'Partial' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('Equivalence percentage')}
                  type="number"
                  value={formData.equivalence_percentage || ''}
                  onChange={e => handleChange('equivalence_percentage', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 100 }}
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label={t('Granted ECTS')}
                type="number"
                value={formData.granted_ects || ''}
                onChange={e => handleChange('granted_ects', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 30 }}
                required
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label={t('Granted grade /20')}
                type="number"
                value={formData.granted_grade !== null ? formData.granted_grade : ''}
                onChange={e => handleChange('granted_grade', e.target.value ? parseFloat(e.target.value) : null)}
                inputProps={{ min: 0, max: 20, step: 0.5 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Notes */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t('Notes / Comments')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('Notes')}
            value={formData.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder={t('Add comments or justifications for this equivalence...')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEditing ? t('Update') : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
