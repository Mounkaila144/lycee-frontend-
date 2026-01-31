/**
 * Maquette Generation Dialog - Génération PDF de maquette pédagogique
 */

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/use-translation';
import { useMaquetteGeneration } from '../hooks/useMaquette';
import type { Programme } from '../../types/programme.types';
import type {
  MaquetteGenerationOptions,
  MaquetteScope,
} from '../../types/maquette.types';

interface MaquetteGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  programme: Programme;
}

export const MaquetteGenerationDialog: React.FC<
  MaquetteGenerationDialogProps
> = ({ open, onClose, programme }) => {
  const { generateMaquette, downloadMaquette, generateAndDownload, isGenerating, isDownloading, error } =
    useMaquetteGeneration();

  // Options state
  const [scope, setScope] = useState<MaquetteScope>('programme');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [showTeachers, setShowTeachers] = useState(true);
  const [showHoursDetail, setShowHoursDetail] = useState(true);
  const [includeOptionalModules, setIncludeOptionalModules] = useState(true);
  const [includeSpecializations, setIncludeSpecializations] = useState(false);

  const handleGenerateAndDownload = async () => {
    const options: MaquetteGenerationOptions = {
      scope,
      show_teachers: showTeachers,
      show_hours_detail: showHoursDetail,
      include_optional_modules: includeOptionalModules,
      include_specializations: includeSpecializations,
    };

    if (scope === 'level' && selectedLevel) {
      options.level = selectedLevel;
    }

    if (scope === 'semester' && selectedSemester) {
      options.semester = selectedSemester;
    }

    // Use generateAndDownload for direct download
    const success = await generateAndDownload(programme.id, options);

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setScope('programme');
    setSelectedLevel('');
    setSelectedSemester('');
    onClose();
  };

  // Get available levels from programme
  const availableLevels = Array.isArray(programme.levels)
    ? programme.levels.map((l) => (typeof l === 'string' ? l : l.level))
    : [];

  const semesters = ['S1', 'S2'];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-file-pdf-line" style={{ fontSize: 24 }} />
          <Typography variant="h6">Générer Maquette Pédagogique</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Programme Info */}
          <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Programme
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {programme.code} - {programme.libelle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={programme.type} size="small" color="primary" />
              <Chip
                label={`${programme.duree_annees} ans`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" onClose={() => {}}>
              {error}
            </Alert>
          )}

          {/* Scope Selection */}
              <FormControl fullWidth>
                <InputLabel>Portée de la maquette</InputLabel>
                <Select
                  value={scope}
                  label="Portée de la maquette"
                  onChange={(e) => setScope(e.target.value as MaquetteScope)}
                  disabled={isGenerating}
                >
                  <MenuItem value="programme">Filière complète</MenuItem>
                  <MenuItem value="level">Par niveau</MenuItem>
                  <MenuItem value="semester">Par semestre</MenuItem>
                </Select>
              </FormControl>

              {/* Level Selection */}
              {scope === 'level' && (
                <FormControl fullWidth>
                  <InputLabel>Niveau</InputLabel>
                  <Select
                    value={selectedLevel}
                    label="Niveau"
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    disabled={isGenerating}
                  >
                    {availableLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Semester Selection */}
              {scope === 'semester' && (
                <FormControl fullWidth>
                  <InputLabel>Semestre</InputLabel>
                  <Select
                    value={selectedSemester}
                    label="Semestre"
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    disabled={isGenerating}
                  >
                    {semesters.map((semester) => (
                      <MenuItem key={semester} value={semester}>
                        {semester}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Divider />

              {/* Display Options */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options d'affichage
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showTeachers}
                        onChange={(e) => setShowTeachers(e.target.checked)}
                        disabled={isGenerating}
                      />
                    }
                    label="Afficher les enseignants"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showHoursDetail}
                        onChange={(e) => setShowHoursDetail(e.target.checked)}
                        disabled={isGenerating}
                      />
                    }
                    label="Détail des volumes horaires (CM/TD/TP)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeOptionalModules}
                        onChange={(e) =>
                          setIncludeOptionalModules(e.target.checked)
                        }
                        disabled={isGenerating}
                      />
                    }
                    label="Inclure les modules optionnels"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeSpecializations}
                        onChange={(e) =>
                          setIncludeSpecializations(e.target.checked)
                        }
                        disabled={isGenerating}
                      />
                    }
                    label="Inclure les spécialités (tronc commun + options)"
                  />
                </Box>
              </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isGenerating}>
          Fermer
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerateAndDownload}
          disabled={
            isGenerating ||
            (scope === 'level' && !selectedLevel) ||
            (scope === 'semester' && !selectedSemester)
          }
          startIcon={
            isGenerating ? (
              <CircularProgress size={20} />
            ) : (
              <i className="ri-file-pdf-line" />
            )
          }
        >
          {isGenerating ? 'Génération...' : 'Générer et Télécharger'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
