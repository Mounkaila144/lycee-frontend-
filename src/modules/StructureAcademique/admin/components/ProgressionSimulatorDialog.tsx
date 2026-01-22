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
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { progressionService } from '../services/progressionService';
import { useTenant } from '@/shared/lib/tenant-context';
import type { ProgressionResult } from '../../types/progression.types';
import { getProgressionStatusLabel, getProgressionStatusColor } from '../../types/progression.types';

interface ProgressionSimulatorDialogProps {
  open: boolean;
  onClose: () => void;
}

// Mock student type (replace with actual type when available)
interface Student {
  id: number;
  name: string;
  email: string;
}

const ProgressionSimulatorDialog: React.FC<ProgressionSimulatorDialogProps> = ({ open, onClose }) => {
  const { tenantId } = useTenant();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProgressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock students (replace with actual API call)
  const students: Student[] = [];

  const handleSimulate = async () => {
    if (!selectedStudentId) return;

    try {
      setLoading(true);
      setError(null);
      const progressionResult = await progressionService.validateStudentProgression(
        selectedStudentId,
        tenantId || undefined
      );
      setResult(progressionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la simulation');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedStudentId(null);
    setResult(null);
    setError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Simulateur de Progression</Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Simulez la progression d'un étudiant pour vérifier s'il peut passer au niveau supérieur selon les
            règles définies.
          </Typography>
        </Alert>

        {/* Student Selection */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={students}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={students.find((s) => s.id === selectedStudentId) || null}
            onChange={(_, newValue) => {
              setSelectedStudentId(newValue?.id || null);
              setResult(null);
              setError(null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Étudiant" placeholder="Sélectionner un étudiant" />
            )}
            disabled={loading}
          />
        </Box>

        {/* Simulate Button */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSimulate}
            disabled={!selectedStudentId || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-play-line" />}
            fullWidth
          >
            {loading ? 'Simulation en cours...' : 'Simuler la Progression'}
          </Button>
          {result && (
            <Button variant="outlined" onClick={handleReset} disabled={loading}>
              Réinitialiser
            </Button>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <Card variant="outlined">
            <CardContent>
              {/* Status Badge */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip
                  label={getProgressionStatusLabel(result.status)}
                  color={getProgressionStatusColor(result.status)}
                  size="large"
                  sx={{ fontSize: '1rem', py: 3, px: 2 }}
                  icon={
                    result.status === 'automatic_pass' ? (
                      <i className="ri-checkbox-circle-line" />
                    ) : result.status === 'conditional_pass' ? (
                      <i className="ri-alert-line" />
                    ) : (
                      <i className="ri-close-circle-line" />
                    )
                  }
                />
              </Box>

              {/* Details */}
              <List dense>
                {/* Allowed */}
                <ListItem>
                  <ListItemText
                    primary="Progression Autorisée"
                    secondary={result.allowed ? 'Oui' : 'Non'}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={result.allowed ? 'Oui' : 'Non'}
                    size="small"
                    color={result.allowed ? 'success' : 'error'}
                  />
                </ListItem>

                <Divider />

                {/* Credits */}
                {result.credits !== undefined && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Crédits Acquis"
                        secondary="Total des crédits validés"
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                      <Typography variant="body1" fontWeight="bold">
                        {result.credits} crédits
                      </Typography>
                    </ListItem>
                    <Divider />
                  </>
                )}

                {/* Debt */}
                {result.debt !== undefined && result.debt > 0 && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Dette Pédagogique"
                        secondary="Crédits manquants"
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                      <Chip label={`${result.debt} crédits`} size="small" color="warning" />
                    </ListItem>
                    <Divider />
                  </>
                )}

                {/* Message */}
                {result.message && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Message"
                        secondary={result.message}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    <Divider />
                  </>
                )}

                {/* Missing Eliminatory Modules */}
                {result.missing_eliminatory_modules && result.missing_eliminatory_modules.length > 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Modules Éliminatoires Non Validés"
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                          {result.missing_eliminatory_modules.map((module, index) => (
                            <Chip
                              key={index}
                              label={module}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      }
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}
              </List>

              {/* Explanation */}
              <Alert
                severity={
                  result.status === 'automatic_pass'
                    ? 'success'
                    : result.status === 'conditional_pass'
                    ? 'warning'
                    : 'error'
                }
                sx={{ mt: 2 }}
              >
                <Typography variant="body2">
                  {result.status === 'automatic_pass' && (
                    <>
                      <strong>Passage Automatique:</strong> L'étudiant a acquis suffisamment de crédits et
                      validé tous les modules éliminatoires. Il peut passer au niveau supérieur sans
                      restriction.
                    </>
                  )}
                  {result.status === 'conditional_pass' && (
                    <>
                      <strong>Passage Conditionnel:</strong> L'étudiant n'a pas tous les crédits requis mais
                      sa dette pédagogique est dans les limites autorisées. Il peut passer au niveau supérieur
                      avec une dette à rattraper.
                    </>
                  )}
                  {result.status === 'must_repeat' && (
                    <>
                      <strong>Redoublement:</strong> L'étudiant n'a pas suffisamment de crédits et sa dette
                      dépasse le maximum autorisé. Il doit redoubler le niveau actuel.
                    </>
                  )}
                  {result.status === 'blocked_eliminatory' && (
                    <>
                      <strong>Bloqué:</strong> L'étudiant n'a pas validé un ou plusieurs modules éliminatoires.
                      Même avec suffisamment de crédits, il ne peut pas progresser tant que ces modules ne sont
                      pas validés.
                    </>
                  )}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* No Student Selected */}
        {!selectedStudentId && !result && !error && (
          <Alert severity="info">Sélectionnez un étudiant pour simuler sa progression.</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgressionSimulatorDialog;
