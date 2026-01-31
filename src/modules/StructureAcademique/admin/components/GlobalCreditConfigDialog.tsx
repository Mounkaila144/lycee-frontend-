'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/use-translation';
import { useGlobalLevelCredits } from '../hooks/useLevelCredits';
import LevelCreditConfigTable from './LevelCreditConfigTable';
import LevelCreditConfigDialog from './LevelCreditConfigDialog';
import type { AcademicLevel, LevelCreditConfiguration } from '../../types/levelCredit.types';

interface GlobalCreditConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const GlobalCreditConfigDialog: React.FC<GlobalCreditConfigDialogProps> = ({
  open,
  onClose,
}) => {
  const { configurations, loading, error, updateConfiguration } = useGlobalLevelCredits();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<LevelCreditConfiguration | undefined>();

  const handleEdit = (level: AcademicLevel, config?: LevelCreditConfiguration) => {
    setSelectedLevel(level);
    setSelectedConfig(config);
    setConfigDialogOpen(true);
  };

  const handleCloseConfigDialog = () => {
    setConfigDialogOpen(false);
    setSelectedLevel(null);
    setSelectedConfig(undefined);
  };

  const handleSave = async (data: any) => {
    await updateConfiguration(data);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" component="div">
                Configuration Globale des Crédits ECTS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valeurs par défaut pour toutes les filières
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <i className="ri-close-line" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Normes LMD:</strong> 60 crédits par année (30 crédits par semestre).
              Vous pouvez personnaliser la répartition semestrielle selon vos besoins pédagogiques.
              Ces valeurs seront appliquées à tous les programmes sauf si une configuration spécifique est définie.
            </Typography>
          </Alert>

          {loading && configurations.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          ) : (
            <LevelCreditConfigTable
              configurations={configurations}
              onEdit={handleEdit}
              isGlobal={true}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested Configuration Dialog */}
      {selectedLevel && (
        <LevelCreditConfigDialog
          open={configDialogOpen}
          onClose={handleCloseConfigDialog}
          onSave={handleSave}
          level={selectedLevel}
          existingConfig={selectedConfig}
          title={`Configuration Globale - ${selectedLevel}`}
        />
      )}
    </>
  );
};

export default GlobalCreditConfigDialog;
