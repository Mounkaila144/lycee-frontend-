'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
// Icons are using Remix Icon classes (ri-*)
import type { OptionChoice, OptionAssignment, Option } from '../../types/option.types';

interface OptionChoiceConfirmationProps {
  choices: OptionChoice[];
  assignment: OptionAssignment | null;
  options: Option[];
  studentInfo?: {
    matricule: string;
    firstname: string;
    lastname: string;
  };
  onPrint?: () => void;
  translations?: {
    title: string;
    subtitle: string;
    student: string;
    yourChoices: string;
    rank: string;
    option: string;
    status: string;
    pending: string;
    validated: string;
    rejected: string;
    assignmentTitle: string;
    assignedOption: string;
    choiceObtained: string;
    method: string;
    automatic: string;
    manual: string;
    assignedAt: string;
    waitingAssignment: string;
    waitingDescription: string;
    print: string;
    firstChoice: string;
    secondChoice: string;
    thirdChoice: string;
  };
}

// Default translations
const defaultTranslations: NonNullable<OptionChoiceConfirmationProps['translations']> = {
  title: 'Confirmation de vos vœux',
  subtitle: 'Récapitulatif de vos choix d\'options',
  student: 'Étudiant',
  yourChoices: 'Vos vœux enregistrés',
  rank: 'Rang',
  option: 'Option',
  status: 'Statut',
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Rejeté',
  assignmentTitle: 'Résultat de l\'affectation',
  assignedOption: 'Option attribuée',
  choiceObtained: 'Vœu obtenu',
  method: 'Méthode',
  automatic: 'Automatique',
  manual: 'Manuelle',
  assignedAt: 'Date d\'affectation',
  waitingAssignment: 'En attente d\'affectation',
  waitingDescription: 'Vos vœux ont été enregistrés. L\'affectation sera effectuée selon le calendrier académique.',
  print: 'Imprimer',
  firstChoice: '1er vœu',
  secondChoice: '2ème vœu',
  thirdChoice: '3ème vœu',
};

/**
 * Get rank label
 */
const getRankLabel = (rank: string, translations: NonNullable<OptionChoiceConfirmationProps['translations']>): string => {
  switch (rank) {
    case '1':
      return translations.firstChoice;
    case '2':
      return translations.secondChoice;
    case '3':
      return translations.thirdChoice;
    default:
      return `Vœu ${rank}`;
  }
};

/**
 * Get status chip
 */
const getStatusChip = (status: string, translations: NonNullable<OptionChoiceConfirmationProps['translations']>) => {
  switch (status) {
    case 'Validated':
      return <Chip label={translations.validated} size="small" color="success" />;
    case 'Rejected':
      return <Chip label={translations.rejected} size="small" color="error" />;
    default:
      return <Chip label={translations.pending} size="small" color="warning" />;
  }
};

/**
 * Option Choice Confirmation Component
 * Displays confirmation of submitted choices and assignment result
 */
export const OptionChoiceConfirmation: React.FC<OptionChoiceConfirmationProps> = ({
  choices,
  assignment,
  options,
  studentInfo,
  onPrint,
  translations: propTranslations,
}) => {
  const translations = { ...defaultTranslations, ...propTranslations };

  const getOptionByChoice = (choice: OptionChoice): Option | undefined => {
    return options.find(o => o.id === choice.option_id);
  };

  const sortedChoices = [...choices].sort((a, b) => Number(a.choice_rank) - Number(b.choice_rank));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Success Alert */}
      <Alert
        severity="success"
        icon={<i className="ri-checkbox-circle-line" />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {translations.title}
        </Typography>
        <Typography variant="body2">
          {translations.subtitle}
        </Typography>
      </Alert>

      {/* Student Info */}
      {studentInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {translations.student}
            </Typography>
            <Typography variant="h6">
              {studentInfo.firstname} {studentInfo.lastname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {studentInfo.matricule}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Choices Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <i className="ri-star-line" style={{ color: 'var(--mui-palette-primary-main)' }} />
            {translations.yourChoices}
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>{translations.rank}</TableCell>
                  <TableCell>{translations.option}</TableCell>
                  <TableCell align="center">{translations.status}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedChoices.map((choice) => {
                  const option = getOptionByChoice(choice);

                  return (
                    <TableRow key={choice.id} hover>
                      <TableCell>
                        <Chip
                          icon={<i className="ri-star-fill" />}
                          label={getRankLabel(choice.choice_rank, translations)}
                          size="small"
                          color={
                            choice.choice_rank === '1'
                              ? 'primary'
                              : choice.choice_rank === '2'
                              ? 'secondary'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {option?.code} - {option?.name}
                        </Typography>
                        {choice.motivation && (
                          <Typography variant="caption" color="text.secondary">
                            {choice.motivation}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(choice.status, translations)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Assignment Result or Waiting */}
      {assignment ? (
        <Card sx={{ mb: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <i className="ri-file-list-3-line" style={{ color: 'var(--mui-palette-success-main)' }} />
              {translations.assignmentTitle}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {translations.assignedOption}
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  {options.find(o => o.id === assignment.option_id)?.code} -{' '}
                  {options.find(o => o.id === assignment.option_id)?.name}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" gap={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {translations.choiceObtained}
                  </Typography>
                  <Typography variant="body1">
                    {getRankLabel(String(assignment.choice_rank_obtained), translations)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {translations.method}
                  </Typography>
                  <Typography variant="body1">
                    {assignment.assignment_method === 'Automatic'
                      ? translations.automatic
                      : translations.manual}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {translations.assignedAt}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(assignment.assigned_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <i className="ri-hourglass-line" style={{ fontSize: '48px', color: 'var(--mui-palette-warning-main)' }} />
              <Box>
                <Typography variant="h6">{translations.waitingAssignment}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {translations.waitingDescription}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Print Button */}
      <Box display="flex" justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<i className="ri-printer-line" />}
          onClick={onPrint || (() => window.print())}
        >
          {translations.print}
        </Button>
      </Box>
    </Box>
  );
};

export default OptionChoiceConfirmation;
