'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import { useTenant } from '@/shared/lib/tenant-context';
import { moduleService } from '@/modules/StructureAcademique/admin/services/moduleService';
import { programmeService } from '@/modules/StructureAcademique/admin/services/programmeService';

import type { Group, GroupFormData, GroupType, GroupStatus } from '../../types/group.types';
import type { Module } from '@/modules/StructureAcademique/types/module.types';
import type { Programme } from '@/modules/StructureAcademique/types/programme.types';

interface GroupFormDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSave: (data: GroupFormData) => Promise<void>;
}

const levels = ['L1', 'L2', 'L3', 'M1', 'M2'];
const groupTypes: GroupType[] = ['CM', 'TD', 'TP'];

/**
 * GroupFormDialog Component
 * Dialog for creating and editing groups
 */
export const GroupFormDialog = ({ open, group, onClose, onSave }: GroupFormDialogProps) => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);

  const [formData, setFormData] = useState<GroupFormData>({
    module_id: 0,
    program_id: 0,
    level: 'L1',
    academic_year_id: 1, // TODO: Get from context/settings
    semester_id: null,
    code: '',
    name: '',
    type: 'TD',
    capacity_min: 20,
    capacity_max: 35,
    teacher_id: null,
    room_id: null,
    status: 'Active',
  });

  // Load modules and programmes
  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true);

      try {
        const [modulesRes, programmesRes] = await Promise.all([
          moduleService.getModules({ per_page: 200 }, tenantId || undefined),
          programmeService.getProgrammes(tenantId || undefined, { per_page: 100 }),
        ]);

        setModules(modulesRes.data);
        setProgrammes(programmesRes.data);
      } catch (err) {
        console.error('Error loading dependencies:', err);
      } finally {
        setLoadingDeps(false);
      }
    };

    if (open) {
      loadDependencies();
    }
  }, [open, tenantId]);

  // Reset form when dialog opens/closes or group changes
  useEffect(() => {
    if (group) {
      setFormData({
        module_id: group.module_id || 0,
        program_id: group.program_id || group.program?.id || 0,
        level: group.level,
        academic_year_id: group.academic_year_id,
        semester_id: group.semester_id,
        code: group.code,
        name: group.name,
        type: group.type,
        capacity_min: group.capacity_min,
        capacity_max: group.capacity_max,
        teacher_id: group.teacher_id,
        room_id: group.room_id,
        status: group.status,
      });
    } else {
      setFormData({
        module_id: 0,
        program_id: 0,
        level: 'L1',
        academic_year_id: 1,
        semester_id: null,
        code: '',
        name: '',
        type: 'TD',
        capacity_min: 20,
        capacity_max: 35,
        teacher_id: null,
        room_id: null,
        status: 'Active',
      });
    }

    setError(null);
  }, [group, open]);

  // Generate code suggestion
  useEffect(() => {
    if (!group && formData.module_id && formData.level && formData.type) {
      const module = modules.find(m => m.id === formData.module_id);

      if (module) {
        const suggestedCode = `${module.code}-${formData.level}-${formData.type}-A`;
        setFormData(prev => ({ ...prev, code: suggestedCode }));
      }
    }
  }, [formData.module_id, formData.level, formData.type, modules, group]);

  const handleChange = (field: keyof GroupFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: field === 'capacity_min' || field === 'capacity_max' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (field: keyof GroupFormData) => (event: any) => {
    const value = event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.module_id || !formData.program_id) {
      setError('Veuillez sélectionner un module et un programme.');

      return;
    }

    if (!formData.code || !formData.name) {
      setError('Le code et le nom sont obligatoires.');

      return;
    }

    if (formData.capacity_min > formData.capacity_max) {
      setError('La capacité minimum ne peut pas être supérieure à la capacité maximum.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{group ? 'Modifier le groupe' : 'Nouveau groupe'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loadingDeps ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Programme *</InputLabel>
                <Select
                  value={formData.program_id || ''}
                  label="Programme *"
                  onChange={handleSelectChange('program_id')}
                >
                  {programmes.map(prog => (
                    <MenuItem key={prog.id} value={prog.id}>
                      {prog.code} - {prog.libelle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Module *</InputLabel>
                <Select
                  value={formData.module_id || ''}
                  label="Module *"
                  onChange={handleSelectChange('module_id')}
                >
                  {modules.map(mod => (
                    <MenuItem key={mod.id} value={mod.id}>
                      {mod.code} - {mod.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Niveau *"
                value={formData.level}
                onChange={handleChange('level')}
              >
                {levels.map(level => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Type *"
                value={formData.type}
                onChange={handleChange('type')}
              >
                {groupTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Statut"
                value={formData.status}
                onChange={handleChange('status')}
              >
                <MenuItem value="Active">Actif</MenuItem>
                <MenuItem value="Inactive">Inactif</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Code *"
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="Ex: ALGO-L1-TD-A"
                helperText="Code unique du groupe"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom *"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Ex: Groupe A"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Capacité minimum"
                value={formData.capacity_min}
                onChange={handleChange('capacity_min')}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Capacité maximum"
                value={formData.capacity_max}
                onChange={handleChange('capacity_max')}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || loadingDeps}>
          {loading ? <CircularProgress size={24} /> : group ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupFormDialog;
