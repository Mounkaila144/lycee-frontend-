'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { CreditValidationReport } from '../../types/levelCredit.types';

interface CreditValidationReportProps {
  validationReport: CreditValidationReport | null;
  loading: boolean;
  error: Error | null;
}

const LEVEL_LABELS: Record<string, string> = {
  L1: 'Licence 1',
  L2: 'Licence 2',
  L3: 'Licence 3',
  M1: 'Master 1',
  M2: 'Master 2',
};

const CreditValidationReportComponent: React.FC<CreditValidationReportProps> = ({
  validationReport,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la validation: {error.message}
      </Alert>
    );
  }

  if (!validationReport || Object.keys(validationReport).length === 0) {
    return (
      <Alert severity="info">
        Aucun niveau configuré pour ce programme.
      </Alert>
    );
  }

  const results = Object.entries(validationReport);
  const hasErrors = results.some(([_, result]) => result.status === 'KO');

  return (
    <Box>
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            Incohérences détectées dans la maquette pédagogique
          </Typography>
          <Typography variant="body2">
            Le programme ne peut pas être activé tant que les crédits des modules ne correspondent pas aux crédits configurés.
          </Typography>
        </Alert>
      )}

      {!hasErrors && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            Maquette pédagogique valide
          </Typography>
          <Typography variant="body2">
            Tous les niveaux ont des crédits cohérents entre la configuration et les modules associés.
          </Typography>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Niveau</TableCell>
              <TableCell align="center">Crédits Configurés</TableCell>
              <TableCell align="center">Crédits Modules</TableCell>
              <TableCell align="center">Écart</TableCell>
              <TableCell align="center">Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map(([level, result]) => (
              <TableRow key={level} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {LEVEL_LABELS[level] || level}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {result.configured_credits} crédits
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {result.modules_credits} crédits
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {result.gap !== 0 && (
                    <Typography
                      variant="body2"
                      color={result.gap > 0 ? 'error' : 'success'}
                      fontWeight="medium"
                    >
                      {result.gap > 0 ? `Manque ${result.gap}` : `Surplus ${Math.abs(result.gap)}`}
                    </Typography>
                  )}
                  {result.gap === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Aucun
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {result.status === 'OK' ? (
                    <Chip label="Valide" size="small" color="success" />
                  ) : (
                    <Chip label="Invalide" size="small" color="error" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasErrors && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Pour corriger les incohérences, vous devez soit:
          </Typography>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Ajouter/modifier des modules pour atteindre les crédits configurés
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Ajuster la configuration des crédits pour correspondre aux modules existants
              </Typography>
            </li>
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default CreditValidationReportComponent;
