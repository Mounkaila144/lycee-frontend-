'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import type { ImportPreviewRow } from '../services/gradeImportService';

interface ImportPreviewTableProps {
  data: ImportPreviewRow[];
  count: number;
}

export default function ImportPreviewTable({ data, count }: ImportPreviewTableProps) {
  const getStatusChip = (note: string | number | null) => {
    if (note === null || note === '' || note === 'ABS') {
      return (
        <Chip
          icon={<i className='ri-alert-line' />}
          label="Absent"
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    }

    const numericNote = typeof note === 'string' ? parseFloat(note.replace(',', '.')) : note;

    if (isNaN(numericNote) || numericNote < 0 || numericNote > 20) {
      return (
        <Chip
          icon={<i className='ri-error-warning-line' />}
          label="Invalide"
          size="small"
          color="error"
          variant="outlined"
        />
      );
    }

    if (numericNote < 5) {
      return (
        <Chip
          icon={<i className='ri-alert-line' />}
          label="Faible"
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    }

    return (
      <Chip
        icon={<i className='ri-checkbox-circle-line' />}
        label="Valide"
        size="small"
        color="success"
        variant="outlined"
      />
    );
  };

  const validCount = data.filter((row) => {
    const numericNote = typeof row.note === 'string'
      ? parseFloat(row.note.replace(',', '.'))
      : row.note;
    return row.note !== null &&
           row.note !== '' &&
           row.note !== 'ABS' &&
           !isNaN(numericNote as number) &&
           (numericNote as number) >= 0 &&
           (numericNote as number) <= 20;
  }).length;

  const warningCount = data.filter((row) => {
    const numericNote = typeof row.note === 'string'
      ? parseFloat(row.note.replace(',', '.'))
      : row.note;
    return (row.note === null || row.note === '' || row.note === 'ABS') ||
           (!isNaN(numericNote as number) && (numericNote as number) < 5);
  }).length;

  const errorCount = data.filter((row) => {
    if (row.note === null || row.note === '' || row.note === 'ABS') return false;
    const numericNote = typeof row.note === 'string'
      ? parseFloat(row.note.replace(',', '.'))
      : row.note;
    return isNaN(numericNote as number) ||
           (numericNote as number) < 0 ||
           (numericNote as number) > 20;
  }).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip
          icon={<i className='ri-checkbox-circle-line' />}
          label={`${validCount} valides`}
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<i className='ri-alert-line' />}
          label={`${warningCount} avertissements`}
          color="warning"
          variant="outlined"
        />
        <Chip
          icon={<i className='ri-error-warning-line' />}
          label={`${errorCount} erreurs`}
          color="error"
          variant="outlined"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Affichage de {data.length} sur {count} lignes
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Matricule</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Prénom</strong></TableCell>
              <TableCell><strong>Note</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>{row.matricule}</TableCell>
                <TableCell>{row.nom}</TableCell>
                <TableCell>{row.prenom}</TableCell>
                <TableCell>
                  {row.note === null || row.note === '' ? '-' : row.note}
                </TableCell>
                <TableCell>{getStatusChip(row.note)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
