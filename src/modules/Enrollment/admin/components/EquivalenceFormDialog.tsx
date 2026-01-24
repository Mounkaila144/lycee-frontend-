'use client';

import { useState, useEffect, useCallback } from 'react';

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

const EQUIVALENCE_TYPES: { value: EquivalenceType; label: string }[] = [
  { value: 'Full', label: 'Équivalence totale' },
  { value: 'Partial', label: 'Équivalence partielle' },
  { value: 'None', label: "Pas d'équivalence" },
  { value: 'Exemption', label: 'Dispense' },
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
      setError("Le nom du module d'origine est requis");

      return;
    }

    if (!formData.origin_ects || formData.origin_ects <= 0) {
      setError("Le nombre d'ECTS d'origine est requis");

      return;
    }

    if (!formData.equivalence_type) {
      setError("Le type d'équivalence est requis");

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
      const message = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-exchange-line" />
          <Typography variant="h6">
            {isEditing ? "Modifier l'équivalence" : 'Ajouter une équivalence'}
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
            Module d'origine
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="Nom du module"
                value={formData.origin_module_name}
                onChange={e => handleChange('origin_module_name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Code"
                value={formData.origin_module_code || ''}
                onChange={e => handleChange('origin_module_code', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="ECTS"
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
                label="Heures"
                type="number"
                value={formData.origin_hours || ''}
                onChange={e => handleChange('origin_hours', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Note obtenue /20"
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
            Équivalence
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
                    label="Module cible"
                    placeholder="Rechercher un module..."
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
                noOptionsText="Aucun module trouvé"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Type d'équivalence</InputLabel>
                <Select
                  value={formData.equivalence_type}
                  label="Type d'équivalence"
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
                  label="Pourcentage d'équivalence"
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
                label="ECTS accordés"
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
                label="Note accordée /20"
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
            Notes / Commentaires
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Ajoutez des commentaires ou justifications pour cette équivalence..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEditing ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
