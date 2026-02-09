'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import type { EliminatoryModule } from '../../types/eliminatory.types';

interface EliminatoryModulesTableProps {
  modules: EliminatoryModule[];
  loading: boolean;
  onEditThreshold: (module: EliminatoryModule) => void;
}

export const EliminatoryModulesTable: React.FC<EliminatoryModulesTableProps> = ({
  modules,
  loading,
  onEditThreshold,
}) => {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (modules.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucun module éliminatoire configuré pour ce semestre.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Module</TableCell>
            <TableCell align="center">Crédits ECTS</TableCell>
            <TableCell align="center">Seuil éliminatoire</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modules.map((mod) => (
            <TableRow key={mod.id} hover>
              <TableCell>
                <Chip label={mod.code} size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {mod.name}
                </Typography>
              </TableCell>
              <TableCell align="center">{mod.credits_ects}</TableCell>
              <TableCell align="center">
                <Chip
                  label={`${mod.threshold}/20`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Modifier le seuil">
                  <IconButton size="small" onClick={() => onEditThreshold(mod)}>
                    <i className="ri-edit-line" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
