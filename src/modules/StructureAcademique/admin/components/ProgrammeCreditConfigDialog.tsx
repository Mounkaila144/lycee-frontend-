'use client';

import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { useProgramLevelCredits, useProgramCreditValidation } from '../hooks/useLevelCredits';
import LevelCreditConfigTable from './LevelCreditConfigTable';
import LevelCreditConfigDialog from './LevelCreditConfigDialog';
import CreditValidationReport from './CreditValidationReport';
import type { AcademicLevel, LevelCreditConfiguration } from '../../types/levelCredit.types';
import type { Programme } from '../../types/programme.types';
import type { ProgrammeLevel } from '../../types/programmeLevel.types';

interface ProgrammeCreditConfigDialogProps {
  open: boolean;
  onClose: () => void;
  programme: Programme | null;
}

const ProgrammeCreditConfigDialog: React.FC<ProgrammeCreditConfigDialogProps> = ({
  open,
  onClose,
  programme,
}) => {
  const programId = programme?.id || 0;
  const { configurations, loading, error, updateConfiguration } = useProgramLevelCredits(programId);
  const {
    validationReport,
    loading: validationLoading,
    error: validationError,
    validate,
  } = useProgramCreditValidation(programId);

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<LevelCreditConfiguration | undefined>();
  const [activeTab, setActiveTab] = useState(0);

  // Extract program levels
  const getProgramLevels = (): AcademicLevel[] => {
    if (!programme?.levels) return [];
    
    const levels = Array.isArray(programme.levels) ? programme.levels : [];
    if (levels.length === 0) return [];
    
    // Handle both formats: [{id, level}] or ["L1", "L2"]
    const levelStrings = typeof levels[0] === 'object' && 'level' in levels[0]
      ? levels.map((l: any) => l.level)
      : levels;
    
    // Filter to valid AcademicLevel types
    return levelStrings.filter((level: string): level is AcademicLevel => 
      ['L1', 'L2', 'L3', 'M1', 'M2'].includes(level)
    );
  };

  const programLevels = getProgramLevels();

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
    // Refresh validation after update
    validate();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Reset tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(0);
    }
  }, [open]);

  if (!programme) return null;

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
                Configuration des Crédits ECTS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {programme.libelle} ({programme.code})
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <i className="ri-close-line" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Configuration" />
            <Tab label="Validation de la Maquette" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Les configurations définies ici remplacent les valeurs globales pour ce programme uniquement.
                  Si aucune configuration n'est définie, les valeurs globales seront utilisées.
                  {programLevels.length > 0 && (
                    <> Ce programme a {programLevels.length} niveau(x) associé(s).</>
                  )}
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
              ) : programLevels.length === 0 ? (
                <Alert severity="warning">
                  Ce programme n'a aucun niveau associé. Veuillez d'abord associer des niveaux au programme.
                </Alert>
              ) : (
                <LevelCreditConfigTable
                  configurations={configurations}
                  onEdit={handleEdit}
                  isGlobal={false}
                  levels={programLevels}
                />
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Vérifiez que les crédits configurés correspondent aux crédits des modules associés à chaque niveau.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={validate}
                  disabled={validationLoading}
                  startIcon={validationLoading ? <CircularProgress size={16} /> : <i className="ri-refresh-line" />}
                >
                  Actualiser
                </Button>
              </Box>

              <CreditValidationReport
                validationReport={validationReport}
                loading={validationLoading}
                error={validationError}
              />
            </Box>
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
          title={`Configuration Programme - ${selectedLevel}`}
        />
      )}
    </>
  );
};

export default ProgrammeCreditConfigDialog;
