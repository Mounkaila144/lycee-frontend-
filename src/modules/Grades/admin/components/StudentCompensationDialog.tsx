'use client';

import React, { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import type { CompensableModule } from '../../types/compensation.types';

interface StudentCompensationDialogProps {
  open: boolean;
  onClose: () => void;
  studentId: number | null;
  studentName?: string;
  onLoadModules: (studentId: number) => Promise<CompensableModule[]>;
  onApply: (studentId: number) => Promise<boolean>;
  onRemove: (studentId: number, moduleId: number) => Promise<boolean>;
}

export const StudentCompensationDialog: React.FC<StudentCompensationDialogProps> = ({
  open,
  onClose,
  studentId,
  studentName,
  onLoadModules,
  onApply,
  onRemove,
}) => {
  const [modules, setModules] = useState<CompensableModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (open && studentId) {
      setLoading(true);
      onLoadModules(studentId)
        .then(setModules)
        .finally(() => setLoading(false));
    }
  }, [open, studentId, onLoadModules]);

  const handleApply = async () => {
    if (!studentId) return;

    setActionLoading(-1);
    const success = await onApply(studentId);

    if (success) {
      const updated = await onLoadModules(studentId);

      setModules(updated);
    }

    setActionLoading(null);
  };

  const handleRemove = async (moduleId: number) => {
    if (!studentId) return;

    setActionLoading(moduleId);
    const success = await onRemove(studentId, moduleId);

    if (success) {
      const updated = await onLoadModules(studentId);

      setModules(updated);
    }

    setActionLoading(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Compensation - {studentName || `Étudiant #${studentId}`}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : modules.length === 0 ? (
          <Typography color="text.secondary" py={3} textAlign="center">
            Aucun module compensable pour cet étudiant.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell align="center">Moyenne</TableCell>
                  <TableCell align="center">Crédits</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((mod) => (
                  <TableRow key={mod.module_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">{mod.module_code}</Typography>
                    </TableCell>
                    <TableCell>{mod.module_name}</TableCell>
                    <TableCell align="center">
                      {mod.module_average !== null ? (
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={mod.module_average >= 10 ? 'success.main' : 'error.main'}
                        >
                          {mod.module_average.toFixed(2)}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">{mod.credits}</TableCell>
                    <TableCell align="center">
                      {mod.is_compensated ? (
                        <Chip label="Compensé" size="small" color="success" />
                      ) : mod.can_compensate ? (
                        <Chip label="Compensable" size="small" color="warning" />
                      ) : (
                        <Tooltip title={mod.reason || ''}>
                          <Chip label="Non éligible" size="small" variant="outlined" />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {mod.is_compensated ? (
                        <Tooltip title="Retirer la compensation">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemove(mod.module_id)}
                            disabled={actionLoading === mod.module_id}
                          >
                            {actionLoading === mod.module_id ? <CircularProgress size={16} /> : <i className="ri-close-circle-line" />}
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        {modules.some(m => m.can_compensate && !m.is_compensated) && (
          <Button
            variant="contained"
            color="success"
            onClick={handleApply}
            disabled={actionLoading === -1}
            startIcon={actionLoading === -1 ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
          >
            Appliquer tout
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
