'use client';

import React from 'react';

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
import Alert from '@mui/material/Alert';

import type { RetakeModuleSummary } from '../../types/retake.types';

interface RetakeModulesTableProps {
  modules: RetakeModuleSummary[];
  loading: boolean;
  onSelectModule: (moduleId: number) => void;
  onExportModule?: (moduleId: number) => void;
}

export const RetakeModulesTable: React.FC<RetakeModulesTableProps> = ({
  modules,
  loading,
  onSelectModule,
  onExportModule,
}) => {
  if (loading) {
    return (
      <>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </>
    );
  }

  if (modules.length === 0) {
    return <Alert severity="info">Aucun module en rattrapage pour ce semestre.</Alert>;
  }

  // Sort by student count descending
  const sorted = [...modules].sort((a, b) => b.student_count - a.student_count);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Module</TableCell>
            <TableCell>Enseignant</TableCell>
            <TableCell align="center">Étudiants</TableCell>
            <TableCell align="center">Notes saisies</TableCell>
            <TableCell align="center">Moy. initiale</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map(mod => (
            <TableRow key={mod.module_id} hover sx={{ cursor: 'pointer' }} onClick={() => onSelectModule(mod.module_id)}>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">{mod.module_code}</Typography>
              </TableCell>
              <TableCell>{mod.module_name}</TableCell>
              <TableCell>
                {mod.teacher ? `${mod.teacher.firstname} ${mod.teacher.lastname}` : '-'}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={mod.student_count}
                  size="small"
                  color={mod.student_count > 10 ? 'error' : mod.student_count > 5 ? 'warning' : 'default'}
                />
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" color={mod.graded_count === mod.student_count ? 'success.main' : 'text.secondary'}>
                  {mod.graded_count}/{mod.student_count}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">
                  {mod.avg_original_grade?.toFixed(2) ?? '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Voir détail">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelectModule(mod.module_id); }}>
                    <i className="ri-eye-line" />
                  </IconButton>
                </Tooltip>
                {onExportModule && (
                  <Tooltip title="Exporter">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onExportModule(mod.module_id); }}>
                      <i className="ri-download-line" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
