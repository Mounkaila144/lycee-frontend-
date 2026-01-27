'use client';

import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import type { ImportReport } from '../services/gradeImportService';

interface ImportProgressProps {
  report: ImportReport;
}

export default function ImportProgress({ report }: ImportProgressProps) {
  const successRate =
    report.total_processed > 0
      ? ((report.imported + report.updated) / report.total_processed) * 100
      : 0;

  return (
    <Box>
      <Alert severity={report.errors.length === 0 ? 'success' : 'warning'} sx={{ mb: 3 }}>
        <AlertTitle>
          {report.errors.length === 0 ? 'Import réussi!' : 'Import terminé avec des erreurs'}
        </AlertTitle>
        <Typography variant="body2">
          {report.imported + report.updated} notes importées sur {report.total_processed} lignes
          traitées
        </Typography>
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progression
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {successRate.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={successRate} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip
          icon={<i className='ri-checkbox-circle-line' />}
          label={`${report.imported} nouvelles notes`}
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<i className='ri-checkbox-circle-line' />}
          label={`${report.updated} notes mises à jour`}
          color="info"
          variant="outlined"
        />
        {report.errors.length > 0 && (
          <Chip
            icon={<i className='ri-error-warning-line' />}
            label={`${report.errors.length} erreurs`}
            color="error"
            variant="outlined"
          />
        )}
      </Box>

      {report.errors.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
            <Typography>
              Détails des erreurs ({report.errors.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Ligne</strong></TableCell>
                    <TableCell><strong>Matricule</strong></TableCell>
                    <TableCell><strong>Note</strong></TableCell>
                    <TableCell><strong>Erreur</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{error.row?.matricule || '-'}</TableCell>
                      <TableCell>{error.row?.note || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error">
                          {error.error}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
