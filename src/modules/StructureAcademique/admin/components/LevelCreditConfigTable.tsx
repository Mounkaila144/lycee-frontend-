'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import type { AcademicLevel, LevelCreditConfiguration } from '../../types/levelCredit.types';

interface LevelCreditConfigTableProps {
  configurations: LevelCreditConfiguration[];
  onEdit: (level: AcademicLevel, config?: LevelCreditConfiguration) => void;
  isGlobal?: boolean;
  levels?: AcademicLevel[]; // Optional: if not provided, shows all levels (for global config)
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  L1: 'Licence 1',
  L2: 'Licence 2',
  L3: 'Licence 3',
  M1: 'Master 1',
  M2: 'Master 2',
};

const ALL_LEVELS: AcademicLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2'];

const LevelCreditConfigTable: React.FC<LevelCreditConfigTableProps> = ({
  configurations,
  onEdit,
  isGlobal = false,
  levels,
}) => {
  // Use provided levels or default to ALL_LEVELS for global config
  const displayLevels = levels || ALL_LEVELS;

  // Create a map of existing configurations
  const configMap = new Map<AcademicLevel, LevelCreditConfiguration>();
  configurations.forEach((config) => {
    configMap.set(config.level, config);
  });

  const getBalanceStatus = (s1: number, s2: number): 'balanced' | 'unbalanced' => {
    return Math.abs(s1 - s2) <= 10 ? 'balanced' : 'unbalanced';
  };

  const getTotalStatus = (total: number): 'ok' | 'warning' => {
    return total === 60 ? 'ok' : 'warning';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Niveau</TableCell>
            <TableCell align="center">Semestre 1</TableCell>
            <TableCell align="center">Semestre 2</TableCell>
            <TableCell align="center">Total Annuel</TableCell>
            <TableCell align="center">Équilibre</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayLevels.map((level) => {
            const config = configMap.get(level);
            const s1 = config?.semester_1_credits ?? 30;
            const s2 = config?.semester_2_credits ?? 30;
            const total = s1 + s2;
            const balanceStatus = getBalanceStatus(s1, s2);
            const totalStatus = getTotalStatus(total);

            return (
              <TableRow key={level} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {LEVEL_LABELS[level]}
                  </Typography>
                  {!config && (
                    <Typography variant="caption" color="text.secondary">
                      (Valeurs par défaut)
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{s1} crédits</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{s2} crédits</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {total} crédits
                    </Typography>
                    {totalStatus === 'ok' ? (
                      <Chip label="LMD" size="small" color="success" />
                    ) : (
                      <Tooltip title="Le total devrait être de 60 crédits selon les normes LMD">
                        <Chip label="Non-LMD" size="small" color="warning" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {balanceStatus === 'balanced' ? (
                    <Chip label="Équilibré" size="small" color="success" variant="outlined" />
                  ) : (
                    <Tooltip title={`Différence: ${Math.abs(s1 - s2)} crédits`}>
                      <Chip label="Déséquilibré" size="small" color="info" variant="outlined" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={config ? 'Modifier' : 'Configurer'}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(level, config)}
                      color="primary"
                    >
                      <i className={config ? 'ri-edit-line' : 'ri-add-line'} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LevelCreditConfigTable;
