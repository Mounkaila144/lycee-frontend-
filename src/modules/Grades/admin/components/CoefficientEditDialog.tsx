'use client';

import React, { useState, useEffect, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';

import type { EvaluationCoefficient, CoefficientImpactSimulation } from '../../types/coefficient.types';
import { COEFFICIENT_CONSTRAINTS } from '../../types/coefficient.types';

/**
 * Props for CoefficientEditDialog
 */
interface CoefficientEditDialogProps {
  open: boolean;
  evaluation: EvaluationCoefficient | null;
  onClose: () => void;
  onSave: (evaluationId: number, coefficient: number, reason?: string) => Promise<boolean>;
  onSimulate: (evaluationId: number, coefficient: number) => Promise<CoefficientImpactSimulation | null>;
  saving: boolean;
  simulationLoading: boolean;
  simulation: CoefficientImpactSimulation | null;
  clearSimulation: () => void;
  validateCoefficient: (value: number) => { valid: boolean; error?: string };
}

/**
 * Coefficient marks for slider
 */
const coefficientMarks = [
  { value: 0.25, label: '0.25' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
];

/**
 * CoefficientEditDialog Component
 * Dialog for editing evaluation coefficient with impact simulation
 */
export const CoefficientEditDialog: React.FC<CoefficientEditDialogProps> = ({
  open,
  evaluation,
  onClose,
  onSave,
  onSimulate,
  saving,
  simulationLoading,
  simulation,
  clearSimulation,
  validateCoefficient,
}) => {
  const [coefficient, setCoefficient] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasSimulated, setHasSimulated] = useState<boolean>(false);

  // Reset state when evaluation changes
  useEffect(() => {
    if (evaluation) {
      setCoefficient(evaluation.coefficient);
      setReason('');
      setError(null);
      setHasSimulated(false);
      clearSimulation();
    }
  }, [evaluation, clearSimulation]);

  /**
   * Handle coefficient change
   */
  const handleCoefficientChange = useCallback(
    (value: number) => {
      setCoefficient(value);
      setHasSimulated(false);
      clearSimulation();

      const validation = validateCoefficient(value);

      if (!validation.valid) {
        setError(validation.error || 'Coefficient invalide');
      } else {
        setError(null);
      }
    },
    [validateCoefficient, clearSimulation]
  );

  /**
   * Handle simulation
   */
  const handleSimulate = useCallback(async () => {
    if (!evaluation) return;

    const result = await onSimulate(evaluation.id, coefficient);

    if (result) {
      setHasSimulated(true);
    }
  }, [evaluation, coefficient, onSimulate]);

  /**
   * Handle save
   */
  const handleSave = useCallback(async () => {
    if (!evaluation) return;

    const validation = validateCoefficient(coefficient);

    if (!validation.valid) {
      setError(validation.error || 'Coefficient invalide');

      return;
    }

    // Require reason if notes are published
    if (evaluation.has_published_grades && !reason.trim()) {
      setError('Une justification est requise car des notes sont publiées');

      return;
    }

    const success = await onSave(evaluation.id, coefficient, reason.trim() || undefined);

    if (success) {
      onClose();
    }
  }, [evaluation, coefficient, reason, validateCoefficient, onSave, onClose]);

  /**
   * Check if coefficient has changed
   */
  const hasChanged = evaluation ? coefficient !== evaluation.coefficient : false;

  /**
   * Check if save is allowed
   */
  const canSave = hasChanged && !error && !saving;

  if (!evaluation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-scales-line" />
          Modifier le coefficient
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Evaluation info */}
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary">
            Évaluation
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Chip label={evaluation.type} size="small" color="primary" variant="outlined" />
            <Typography variant="body1" fontWeight="medium">
              {evaluation.name}
            </Typography>
            {evaluation.has_published_grades && (
              <Chip label="Notes publiées" size="small" color="warning" />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Current vs New coefficient */}
        <Box display="flex" gap={4} mb={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Coefficient actuel
            </Typography>
            <Typography variant="h4" color="text.secondary">
              {evaluation.coefficient.toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="primary">
              Nouveau coefficient
            </Typography>
            <Typography variant="h4" color="primary">
              {coefficient.toFixed(2)}
            </Typography>
          </Box>
          {hasChanged && (
            <Box display="flex" alignItems="center">
              <Chip
                label={coefficient > evaluation.coefficient ? `+${(coefficient - evaluation.coefficient).toFixed(2)}` : (coefficient - evaluation.coefficient).toFixed(2)}
                color={coefficient > evaluation.coefficient ? 'success' : 'error'}
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Coefficient slider */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Ajuster le coefficient
          </Typography>
          <Slider
            value={coefficient}
            onChange={(_, value) => handleCoefficientChange(value as number)}
            min={COEFFICIENT_CONSTRAINTS.MIN}
            max={COEFFICIENT_CONSTRAINTS.MAX}
            step={COEFFICIENT_CONSTRAINTS.STEP}
            marks={coefficientMarks}
            valueLabelDisplay="on"
          />
        </Box>

        {/* Manual input */}
        <Box mb={3}>
          <TextField
            label="Coefficient (saisie manuelle)"
            type="number"
            inputProps={{
              min: COEFFICIENT_CONSTRAINTS.MIN,
              max: COEFFICIENT_CONSTRAINTS.MAX,
              step: COEFFICIENT_CONSTRAINTS.STEP,
            }}
            value={coefficient}
            onChange={(e) => handleCoefficientChange(parseFloat(e.target.value) || 0)}
            error={!!error}
            helperText={error || `Min: ${COEFFICIENT_CONSTRAINTS.MIN}, Max: ${COEFFICIENT_CONSTRAINTS.MAX}, Step: ${COEFFICIENT_CONSTRAINTS.STEP}`}
            fullWidth
            size="small"
          />
        </Box>

        {/* Reason (required if published) */}
        {evaluation.has_published_grades && (
          <Box mb={3}>
            <TextField
              label="Justification de la modification *"
              multiline
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              placeholder="Expliquez la raison de cette modification..."
              helperText="Requise car des notes sont déjà publiées"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Impact simulation */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Simulation d'impact
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSimulate}
              disabled={simulationLoading || !hasChanged}
              startIcon={simulationLoading ? <CircularProgress size={16} /> : <i className="ri-calculator-line" />}
            >
              {simulationLoading ? 'Calcul...' : 'Simuler'}
            </Button>
          </Box>

          {!hasSimulated && !simulation && (
            <Alert severity="info">
              Cliquez sur "Simuler" pour voir l'impact de cette modification sur les moyennes des étudiants.
            </Alert>
          )}

          {simulation && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Cette modification affectera <strong>{simulation.affected_students}</strong> étudiants.
                Variation moyenne: <strong>{simulation.average_change >= 0 ? '+' : ''}{simulation.average_change.toFixed(2)}</strong> points.
              </Alert>

              {simulation.samples.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Exemples d'impact (5 étudiants)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Étudiant</TableCell>
                          <TableCell align="center">Ancienne moyenne</TableCell>
                          <TableCell align="center">Nouvelle moyenne</TableCell>
                          <TableCell align="center">Différence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {simulation.samples.map((sample, index) => (
                          <TableRow key={index}>
                            <TableCell>{sample.student_name}</TableCell>
                            <TableCell align="center">{sample.old_average.toFixed(2)}</TableCell>
                            <TableCell align="center">{sample.new_average.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={sample.diff >= 0 ? `+${sample.diff.toFixed(2)}` : sample.diff.toFixed(2)}
                                size="small"
                                color={sample.diff >= 0 ? 'success' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave}
          startIcon={saving ? <CircularProgress size={16} /> : <i className="ri-save-line" />}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
