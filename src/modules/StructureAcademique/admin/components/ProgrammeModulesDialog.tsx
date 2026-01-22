/**
 * Dialog pour gérer les modules associés à un programme
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useProgrammeModules } from '../hooks/useProgrammeModules';
import ProgrammeModuleSelector from './ProgrammeModuleSelector';
import { calculateModuleStats } from '../../types/programmeModule.types';
import type { Programme } from '../../types/programme.types';

interface ProgrammeModulesDialogProps {
  open: boolean;
  onClose: () => void;
  programme: Programme | null;
  onSuccess?: () => void;
}

const ProgrammeModulesDialog: React.FC<ProgrammeModulesDialogProps> = ({
  open,
  onClose,
  programme,
  onSuccess,
}) => {
  const {
    modules,
    availableModules,
    loading,
    loadingAvailable,
    error,
    fetchAvailableModules,
    associateModules,
  } = useProgrammeModules({
    programmeId: programme?.id,
    autoFetch: true,
  });

  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Charger les modules disponibles au montage
   */
  useEffect(() => {
    if (open) {
      fetchAvailableModules();
    }
  }, [open, fetchAvailableModules]);

  /**
   * Initialiser la sélection avec les modules actuels
   */
  useEffect(() => {
    if (modules && modules.length > 0) {
      setSelectedModuleIds(modules.map(m => m.id));
    } else {
      setSelectedModuleIds([]);
    }
  }, [modules]);

  /**
   * Sauvegarder les associations
   */
  const handleSave = async () => {
    if (!programme) return;

    try {
      setSaving(true);
      setSaveError(null);
      await associateModules({ module_ids: selectedModuleIds });
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Calculer les statistiques
   */
  const stats = calculateModuleStats(
    availableModules.filter(m => selectedModuleIds.includes(m.id))
  );

  // Normaliser les niveaux du programme (peut être string[] ou object[])
  const programmeLevels = useMemo(() => {
    if (!programme?.levels) return [];
    
    // Si c'est déjà un array de strings
    if (typeof programme.levels[0] === 'string') {
      return programme.levels as string[];
    }
    
    // Si c'est un array d'objets avec propriété level
    return (programme.levels as Array<{ level: string }>).map(l => l.level);
  }, [programme?.levels]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5">Gérer les Modules</Typography>
            {programme && (
              <Typography variant="body2" color="text.secondary">
                {programme.code} - {programme.libelle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading || loadingAvailable ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}

            <ProgrammeModuleSelector
              availableModules={availableModules}
              selectedModuleIds={selectedModuleIds}
              programmeLevels={programmeLevels}
              onChange={setSelectedModuleIds}
              disabled={saving}
            />

            {selectedModuleIds.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Statistiques
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total modules
                      </Typography>
                      <Typography variant="h6">{stats.total}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Crédits ECTS
                      </Typography>
                      <Typography variant="h6">{stats.total_credits}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Obligatoires
                      </Typography>
                      <Typography variant="h6">{stats.by_type.Obligatoire}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Optionnels
                      </Typography>
                      <Typography variant="h6">{stats.by_type.Optionnel}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Éliminatoires
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        {stats.eliminatory_count}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading || loadingAvailable}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgrammeModulesDialog;
