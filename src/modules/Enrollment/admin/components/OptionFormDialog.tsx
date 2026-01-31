'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTenant } from '@/shared/lib/tenant-context';
import { optionService } from '../services/optionService';
import type { Option, OptionFormData, OptionStatus } from '../../types/option.types';

interface OptionFormDialogProps {
  open: boolean;
  onClose: () => void;
  option?: Option | null;
  onSuccess: () => void;
  programmes: Array<{ id: number; code: string; libelle: string }>;
}

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];
const STATUSES: OptionStatus[] = ['Open', 'Closed', 'Archived'];

export const OptionFormDialog = ({
  open,
  onClose,
  option,
  onSuccess,
  programmes,
}: OptionFormDialogProps) => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!option;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OptionFormData>({
    defaultValues: {
      programme_id: 0,
      level: 'L3',
      code: '',
      name: '',
      description: '',
      capacity: 30,
      is_mandatory: false,
      choice_start_date: '',
      choice_end_date: '',
      status: 'Closed',
    },
  });

  useEffect(() => {
    if (open) {
      if (option) {
        reset({
          programme_id: option.programme_id,
          level: option.level,
          code: option.code,
          name: option.name,
          description: option.description || '',
          capacity: option.capacity,
          is_mandatory: option.is_mandatory,
          choice_start_date: option.choice_start_date?.split('T')[0] || '',
          choice_end_date: option.choice_end_date?.split('T')[0] || '',
          status: option.status,
        });
      } else {
        reset({
          programme_id: programmes[0]?.id || 0,
          level: 'L3',
          code: '',
          name: '',
          description: '',
          capacity: 30,
          is_mandatory: false,
          choice_start_date: '',
          choice_end_date: '',
          status: 'Closed',
        });
      }
      setError(null);
    }
  }, [open, option, reset, programmes]);

  const onSubmit = async (data: OptionFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (isEdit && option) {
        await optionService.updateOption(option.id, data, tenantId || undefined);
      } else {
        await optionService.createOption(data, tenantId || undefined);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving option:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEdit ? 'Modifier l\'option' : 'Nouvelle option'}
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Code */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="code"
                control={control}
                rules={{ required: 'Le code est requis' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Code"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    placeholder="OPT-INFO-001"
                  />
                )}
              />
            </Grid>

            {/* Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Le nom est requis' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom de l'option"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="Intelligence Artificielle"
                  />
                )}
              />
            </Grid>

            {/* Programme */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="programme_id"
                control={control}
                rules={{ required: 'La filière est requise' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.programme_id}>
                    <InputLabel>Filière</InputLabel>
                    <Select {...field} label="Filière">
                      {programmes.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.code} - {prog.libelle}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Level */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="level"
                control={control}
                rules={{ required: 'Le niveau est requis' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.level}>
                    <InputLabel>Niveau</InputLabel>
                    <Select {...field} label="Niveau">
                      {LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Description de l'option..."
                  />
                )}
              />
            </Grid>

            {/* Capacity */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="capacity"
                control={control}
                rules={{
                  required: 'La capacité est requise',
                  min: { value: 1, message: 'Minimum 1 place' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Capacité (places)"
                    fullWidth
                    error={!!errors.capacity}
                    helperText={errors.capacity?.message}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select {...field} label="Statut">
                      <MenuItem value="Closed">Fermé</MenuItem>
                      <MenuItem value="Open">Ouvert</MenuItem>
                      <MenuItem value="Archived">Archivé</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Choice Start Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="choice_start_date"
                control={control}
                rules={{ required: 'La date de début est requise' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Date de début des choix"
                    fullWidth
                    error={!!errors.choice_start_date}
                    helperText={errors.choice_start_date?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Choice End Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="choice_end_date"
                control={control}
                rules={{ required: 'La date de fin est requise' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Date de fin des choix"
                    fullWidth
                    error={!!errors.choice_end_date}
                    helperText={errors.choice_end_date?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Is Mandatory */}
            <Grid item xs={12}>
              <Controller
                name="is_mandatory"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Option obligatoire (les étudiants doivent choisir)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-save-line" />}
          >
            {isEdit ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OptionFormDialog;
