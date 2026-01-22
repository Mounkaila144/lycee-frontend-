'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Alert,
  Grid,
  Button,
} from '@mui/material';
import type { AvailableModule, ModuleSelection, EnrollmentResult } from '../../types/pedagogicalEnrollment.types';

interface EnrollmentSummaryProps {
  selectedModules: AvailableModule[];
  moduleSelections: ModuleSelection[];
  totalCredits: number;
  minCredits: number;
  maxCredits: number;
  studentInfo?: {
    matricule: string;
    firstname: string;
    lastname: string;
  };
  programInfo?: {
    code: string;
    name: string;
  };
  semesterInfo?: {
    name: string;
    code: string;
  };
  enrollmentResult?: EnrollmentResult | null;
  onGeneratePdf?: () => void;
  isConfirmation?: boolean;
  isExistingEnrollment?: boolean;
  translations: {
    summary: string;
    student: string;
    program: string;
    semester: string;
    selectedModules: string;
    totalCredits: string;
    mandatory: string;
    optional: string;
    moduleCode: string;
    moduleName: string;
    credits: string;
    type: string;
    group: string;
    noGroup: string;
    enrollmentSuccess: string;
    existingEnrollment?: string;
    enrollmentId: string;
    downloadPdf: string;
    print: string;
    warnings: string;
  };
}

/**
 * Enrollment Summary Component
 */
export const EnrollmentSummary: React.FC<EnrollmentSummaryProps> = ({
  selectedModules,
  moduleSelections,
  totalCredits,
  minCredits,
  maxCredits,
  studentInfo,
  programInfo,
  semesterInfo,
  enrollmentResult,
  onGeneratePdf,
  isConfirmation = false,
  isExistingEnrollment = false,
  translations,
}) => {
  const mandatoryModules = selectedModules.filter(m => m.type === 'mandatory');
  const optionalModules = selectedModules.filter(m => m.type === 'optional');

  const getGroupName = (moduleId: number): string => {
    const selection = moduleSelections.find(s => s.module_id === moduleId);
    const module = selectedModules.find(m => m.id === moduleId);

    if (!selection?.group_id || !module?.groups) {
      return translations.noGroup;
    }

    const group = module.groups.find(g => g.id === selection.group_id);

    return group?.name || translations.noGroup;
  };

  const creditStatus = totalCredits >= minCredits && totalCredits <= maxCredits;

  return (
    <Box>
      {/* Message for existing enrollment */}
      {isConfirmation && isExistingEnrollment && enrollmentResult?.success && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          icon={<i className="ri-information-fill" style={{ fontSize: 22 }} />}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {translations.existingEnrollment || 'Inscription pédagogique existante'}
          </Typography>
          <Typography variant="body2">
            {translations.enrollmentId}: #{enrollmentResult.enrollment.id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Cette inscription a été créée le {new Date(enrollmentResult.enrollment.created_at).toLocaleDateString('fr-FR')}
          </Typography>
        </Alert>
      )}

      {/* Success Message for new enrollment */}
      {isConfirmation && !isExistingEnrollment && enrollmentResult?.success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          icon={<i className="ri-checkbox-circle-fill" style={{ fontSize: 22 }} />}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {translations.enrollmentSuccess}
          </Typography>
          <Typography variant="body2">
            {translations.enrollmentId}: #{enrollmentResult.enrollment.id}
          </Typography>
        </Alert>
      )}

      {/* Warnings */}
      {enrollmentResult?.warnings && enrollmentResult.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {translations.warnings}
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {enrollmentResult.warnings.map((warning, index) => (
              <li key={index}>
                <Typography variant="body2">{warning}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Student & Program Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {studentInfo && (
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  {translations.student}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {studentInfo.firstname} {studentInfo.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {studentInfo.matricule}
                </Typography>
              </Grid>
            )}
            {programInfo && (
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  {translations.program}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {programInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {programInfo.code}
                </Typography>
              </Grid>
            )}
            {semesterInfo && (
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  {translations.semester}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {semesterInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {semesterInfo.code}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Credit Summary */}
      <Card sx={{ mb: 3, bgcolor: creditStatus ? 'success.50' : 'warning.50' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <i className="ri-graduation-cap-fill" style={{ fontSize: 40, color: creditStatus ? '#4caf50' : '#ed6c02' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {totalCredits} ECTS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translations.totalCredits} (min: {minCredits}, max: {maxCredits})
                </Typography>
              </Box>
            </Box>
            <Box textAlign="right">
              <Typography variant="body2">
                {mandatoryModules.length} {translations.mandatory}
              </Typography>
              <Typography variant="body2">
                {optionalModules.length} {translations.optional}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translations.selectedModules} ({selectedModules.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>{translations.moduleCode}</TableCell>
                  <TableCell>{translations.moduleName}</TableCell>
                  <TableCell align="center">{translations.credits}</TableCell>
                  <TableCell align="center">{translations.type}</TableCell>
                  <TableCell>{translations.group}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedModules.map((module) => (
                  <TableRow key={module.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {module.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{module.name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${module.credits_ects} ECTS`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={module.type === 'mandatory' ? translations.mandatory : translations.optional}
                        size="small"
                        color={module.type === 'mandatory' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {getGroupName(module.id)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions for Confirmation */}
      {isConfirmation && (
        <Box display="flex" gap={2} justifyContent="center">
          {onGeneratePdf && (
            <Button
              variant="contained"
              startIcon={<i className="ri-file-pdf-line" />}
              onClick={onGeneratePdf}
            >
              {translations.downloadPdf}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<i className="ri-printer-line" />}
            onClick={() => window.print()}
          >
            {translations.print}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EnrollmentSummary;
