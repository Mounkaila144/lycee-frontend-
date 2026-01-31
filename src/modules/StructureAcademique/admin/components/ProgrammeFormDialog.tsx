'use client';

import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { Programme, ProgrammeFormData, ProgrammeType } from '../../types/programme.types';
import { useProgrammesContext } from './ProgrammeList';
import type { User } from '@/modules/UsersGuard/types/user.types';
import { ProgrammeLevelSelector } from './ProgrammeLevelSelector';
import { programmeLevelService } from '../services/programmeLevelService';
import { useTenant } from '@/shared/lib/tenant-context';
import type { ProgrammeLevel } from '../../types/programmeLevel.types';

interface ProgrammeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programme?: Programme | null;
  isEditMode?: boolean;
}

const programmeTypes: ProgrammeType[] = ['Licence', 'Master', 'Doctorat'];

const ProgrammeFormDialog = ({ open, onClose, onSuccess, programme, isEditMode = false }: ProgrammeFormDialogProps) => {
  const { t } = useTranslation('StructureAcademique');
  const { createProgramme, updateProgramme, loading, users, loadingUsers } = useProgrammesContext();
  const { tenantId } = useTenant();
  const [error, setError] = useState<string | null>(null);
  const [selectedResponsable, setSelectedResponsable] = useState<User | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<ProgrammeLevel[]>([]);

  const [formData, setFormData] = useState<ProgrammeFormData>({
    code: '',
    libelle: '',
    type: 'Licence',
    duree_annees: 3,
    description: null,
    responsable_id: null,
  });

  // Initialize form data when programme changes or dialog opens
  useEffect(() => {
    if (programme && isEditMode) {
      // Extract responsable_id from responsable object (API returns responsable object, not responsable_id)
      const responsableId = programme.responsable?.id || programme.responsable_id;
      
      // Ensure duration matches type (backend validation)
      let duration = programme.duree_annees;
      if (programme.type === 'Licence' && duration !== 3) duration = 3;
      if (programme.type === 'Master' && duration !== 2) duration = 2;
      if (programme.type === 'Doctorat' && duration !== 3) duration = 3;
      
      setFormData({
        code: programme.code,
        libelle: programme.libelle,
        type: programme.type,
        duree_annees: duration,
        description: programme.description || null,
        responsable_id: responsableId || null,
      });
      
      // Load levels from programme data or fetch from API
      if (programme.levels && programme.levels.length > 0) {
        // Handle both formats: array of strings ["L1","L2"] or array of objects [{id, level}]
        const levelsArray = programme.levels.map(l => {
          // If it's already a string, use it directly
          if (typeof l === 'string') {
            return l as ProgrammeLevel;
          }
          // If it's an object with level property, extract it
          return l.level as ProgrammeLevel;
        });
        setSelectedLevels(levelsArray);
      } else {
        // Fetch levels from API if not in programme data
        const fetchLevels = async () => {
          try {
            const levelsData = await programmeLevelService.getLevels(
              programme.id,
              tenantId || undefined
            );
            setSelectedLevels(levelsData.map(l => l.level));
          } catch (err) {
            console.error('Error fetching levels:', err);
            setSelectedLevels([]);
          }
        };
        fetchLevels();
      }
    } else {
      // Reset form for add mode with default duration for Licence
      setFormData({
        code: '',
        libelle: '',
        type: 'Licence',
        duree_annees: 3, // Default for Licence
        description: null,
        responsable_id: null,
      });
      setSelectedResponsable(null);
      setSelectedLevels([]);
    }
    setError(null);
  }, [programme, isEditMode, open, tenantId]);

  // Set selected responsable when users are loaded
  useEffect(() => {
    if (programme && isEditMode && users.length > 0) {
      // Extract responsable_id from responsable object (API returns responsable object)
      const responsableId = programme.responsable?.id || programme.responsable_id;
      
      if (responsableId) {
        // Convert to number to ensure type matching
        const numericId = typeof responsableId === 'string' ? parseInt(responsableId) : responsableId;
        
        const responsable = users.find(u => u.id === numericId);
        
        if (responsable) {
          setSelectedResponsable(responsable);
        }
      }
    }
  }, [programme, isEditMode, users]);

  const handleChange = (field: keyof ProgrammeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-adjust duration when type changes
    if (field === 'type') {
      const type = value as ProgrammeType;
      let duration = 3; // Default
      
      if (type === 'Licence') {
        duration = 3;
      } else if (type === 'Master') {
        duration = 2;
      } else if (type === 'Doctorat') {
        duration = 3; // Assuming 3 years for Doctorat
      }
      
      setFormData((prev) => ({ ...prev, [field]: value, duree_annees: duration }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: responsable_id est requis
    if (!formData.responsable_id) {
      setError(t('Le responsable du programme est obligatoire'));
      return;
    }

    try {
      // Prepare data with null instead of undefined for optional fields
      const dataToSend = {
        ...formData,
        responsable_id: formData.responsable_id,
        description: formData.description || null
      };

      let savedProgramme: Programme;
      
      if (isEditMode && programme) {
        savedProgramme = await updateProgramme(programme.id, dataToSend);
        
        // Associate levels after programme is updated
        if (selectedLevels.length > 0) {
          await programmeLevelService.associateLevels(
            savedProgramme.id,
            selectedLevels,
            tenantId || undefined
          );
        }
      } else {
        savedProgramme = await createProgramme(dataToSend);
        
        // Associate levels after programme is created
        if (selectedLevels.length > 0) {
          await programmeLevelService.associateLevels(
            savedProgramme.id,
            selectedLevels,
            tenantId || undefined
          );
        }
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Une erreur est survenue'));
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditMode ? t('Modifier le programme') : t('Nouveau programme')}</DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('Code')}
              required
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              disabled={loading}
              helperText={t('Code unique du programme (ex: INF-L)')}
            />

            <TextField
              label={t('Libellé')}
              required
              value={formData.libelle}
              onChange={(e) => handleChange('libelle', e.target.value)}
              disabled={loading}
              helperText={t('Nom complet du programme')}
            />

            <TextField
              select
              label={t('Type')}
              required
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value as ProgrammeType)}
              disabled={loading}
              helperText={t('Le type détermine automatiquement la durée du programme')}
            >
              {programmeTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('Durée (années)')}
              type="number"
              required
              value={formData.duree_annees}
              disabled={true}
              slotProps={{ htmlInput: { min: 1, max: 8 } }}
              helperText={
                formData.type === 'Licence' ? t('Licence = 3 ans (fixe)') :
                formData.type === 'Master' ? t('Master = 2 ans (fixe)') :
                t('Doctorat = 3 ans (fixe)')
              }
            />

            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.full_name} (${option.username})`}
              value={selectedResponsable}
              onChange={(_, newValue) => {
                setSelectedResponsable(newValue);
                handleChange('responsable_id', newValue?.id || null);
              }}
              loading={loadingUsers}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Responsable du programme')}
                  required
                  helperText={t('Sélectionnez l\'enseignant responsable du programme')}
                  error={!selectedResponsable && formData.responsable_id === null}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />

            <TextField
              label={t('Description')}
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value || null)}
              disabled={loading}
              helperText={t('Description détaillée du programme (optionnel)')}
            />

            <ProgrammeLevelSelector
              programmeType={formData.type}
              selectedLevels={selectedLevels}
              onChange={setSelectedLevels}
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {t('Annuler')}
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : isEditMode ? t('Modifier') : t('Créer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProgrammeFormDialog;
