'use client';

import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import type { CoefficientHistoryEntry, CreditsHistoryEntry } from '../../types/coefficient.types';

/**
 * Props for CoefficientHistoryDialog
 */
interface CoefficientHistoryDialogProps {
  open: boolean;
  type: 'coefficient' | 'credits';
  title: string;
  coefficientHistory: CoefficientHistoryEntry[];
  creditsHistory: CreditsHistoryEntry[];
  loading: boolean;
  onClose: () => void;
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * CoefficientHistoryDialog Component
 * Dialog for displaying coefficient or credits modification history
 */
export const CoefficientHistoryDialog: React.FC<CoefficientHistoryDialogProps> = ({
  open,
  type,
  title,
  coefficientHistory,
  creditsHistory,
  loading,
  onClose,
}) => {
  const history = type === 'coefficient' ? coefficientHistory : creditsHistory;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-history-line" />
          Historique - {title}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Alert severity="info">
            Aucune modification enregistrée pour cet élément.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {type === 'coefficient' ? 'Ancien coefficient' : 'Anciens crédits'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {type === 'coefficient' ? 'Nouveau coefficient' : 'Nouveaux crédits'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Variation</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Modifié par</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Justification</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {type === 'coefficient'
                  ? coefficientHistory.map((entry) => {
                      const diff = entry.difference ?? (entry.new_coefficient - entry.old_coefficient);

                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(entry.changed_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {entry.old_coefficient.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {entry.new_coefficient.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                              size="small"
                              color={diff >= 0 ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {entry.changed_by}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {entry.reason ? (
                              <Tooltip title={entry.reason}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {entry.reason}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                Non spécifiée
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : creditsHistory.map((entry) => {
                      const diff = entry.difference ?? (entry.new_credits - entry.old_credits);

                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(entry.changed_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {entry.old_credits} ECTS
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {entry.new_credits} ECTS
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={diff >= 0 ? `+${diff}` : diff.toString()}
                              size="small"
                              color={diff >= 0 ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {entry.changed_by}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {entry.reason ? (
                              <Tooltip title={entry.reason}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {entry.reason}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                Non spécifiée
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
