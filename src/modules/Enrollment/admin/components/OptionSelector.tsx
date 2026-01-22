'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { OptionCard } from './OptionCard';
import { useOptionSelection } from '../hooks/useOptions';
import type { ChoiceRank, Option } from '../../types/option.types';

interface OptionSelectorProps {
  studentId: number;
  academicYearId: number;
  onSubmitSuccess?: () => void;
  translations?: {
    title: string;
    subtitle: string;
    available: string;
    yourChoices: string;
    firstChoice: string;
    secondChoice: string;
    thirdChoice: string;
    noSelection: string;
    submit: string;
    periodInfo: string;
    daysRemaining: string;
    periodClosed: string;
    alreadyAssigned: string;
    assignedOption: string;
    capacity: string;
    enrolled: string;
    remaining: string;
    full: string;
    closed: string;
    prerequisites: string;
    select: string;
    deselect: string;
    openUntil: string;
    prerequisiteNotMet: string;
    loadError: string;
    submitError: string;
    submitSuccess: string;
  };
}

// Default translations (French)
const defaultTranslations: NonNullable<OptionSelectorProps['translations']> = {
  title: 'Choix des Options',
  subtitle: 'Sélectionnez vos options pour personnaliser votre parcours',
  available: 'Options disponibles',
  yourChoices: 'Vos vœux',
  firstChoice: '1er vœu',
  secondChoice: '2ème vœu',
  thirdChoice: '3ème vœu',
  noSelection: 'Non sélectionné',
  submit: 'Enregistrer mes vœux',
  periodInfo: 'Période de choix',
  daysRemaining: 'jours restants',
  periodClosed: 'La période de choix est fermée',
  alreadyAssigned: 'Vous êtes déjà affecté à une option',
  assignedOption: 'Option attribuée',
  capacity: 'Capacité',
  enrolled: 'Inscrits',
  remaining: 'Places restantes',
  full: 'Complet',
  closed: 'Fermé',
  prerequisites: 'Prérequis',
  select: 'Sélectionner',
  deselect: 'Retirer',
  openUntil: 'Ouvert jusqu\'au',
  prerequisiteNotMet: 'Prérequis non remplis',
  loadError: 'Erreur lors du chargement des options',
  submitError: 'Erreur lors de l\'enregistrement',
  submitSuccess: 'Vœux enregistrés avec succès !',
};

/**
 * Choice Summary Card Component
 */
const ChoiceSummaryCard: React.FC<{
  rank: ChoiceRank;
  option: Option | undefined;
  label: string;
  onClear?: () => void;
  disabled?: boolean;
}> = ({ rank, option, label, onClear, disabled }) => {
  const rankColors = {
    '1': 'primary.main',
    '2': 'secondary.main',
    '3': 'grey.600',
  };

  const rankColorValues = {
    '1': '#1976d2',
    '2': '#9c27b0',
    '3': '#757575',
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderLeft: '4px solid',
        borderLeftColor: option ? rankColors[rank] : 'grey.300',
        bgcolor: option ? 'background.paper' : 'grey.50',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-star-fill" style={{ color: option ? rankColorValues[rank] : '#bdbdbd', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
        </Box>
        {option && !disabled && (
          <Chip
            label="×"
            size="small"
            onClick={onClear}
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Box>
      {option ? (
        <Box mt={1}>
          <Typography variant="body2" fontWeight={500}>
            {option.code} - {option.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {option.remaining_capacity} places restantes
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" mt={1}>
          Non sélectionné
        </Typography>
      )}
    </Card>
  );
};

/**
 * Option Selector Component
 * Main interface for students to select their option choices
 */
export const OptionSelector: React.FC<OptionSelectorProps> = ({
  studentId,
  academicYearId,
  onSubmitSuccess,
  translations: propTranslations,
}) => {
  const translations = { ...defaultTranslations, ...propTranslations };

  const {
    availableOptions,
    draftChoices,
    choicePeriod,
    studentAssignment,
    loading,
    submitting,
    error,
    success,
    canModifyChoices,
    selectedCount,
    hasChanges,
    loadOptions,
    setChoice,
    clearChoice,
    submitChoices,
    getOptionById,
    getChoiceRankForOption,
  } = useOptionSelection(studentId, academicYearId);

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleSubmit = async () => {
    const result = await submitChoices();

    if (result) {
      onSubmitSuccess?.();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !availableOptions.length) {
    return (
      <Alert severity="error">
        {translations.loadError}: {error.message}
      </Alert>
    );
  }

  // Already assigned state
  if (studentAssignment) {
    const assignedOption = getOptionById(studentAssignment.option_id);

    return (
      <Card>
        <CardContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {translations.alreadyAssigned}
            </Typography>
          </Alert>

          <Box textAlign="center" py={2}>
            <i className="ri-checkbox-circle-fill" style={{ fontSize: 64, color: '#4caf50', marginBottom: 16, display: 'block' }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {translations.assignedOption}
            </Typography>
            <Typography variant="h6" color="primary.main">
              {assignedOption?.code} - {assignedOption?.name}
            </Typography>
            <Chip
              label={`Vœu ${studentAssignment.choice_rank_obtained}`}
              color="primary"
              sx={{ mt: 2 }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {translations.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {translations.subtitle}
        </Typography>
      </Box>

      {/* Period Info */}
      {choicePeriod && (
        <Alert
          severity={choicePeriod.is_open ? 'info' : 'warning'}
          icon={<i className="ri-calendar-line" style={{ fontSize: 22 }} />}
          sx={{ mb: 3 }}
        >
          {choicePeriod.is_open ? (
            <>
              {translations.periodInfo}: {new Date(choicePeriod.start_date).toLocaleDateString()} -{' '}
              {new Date(choicePeriod.end_date).toLocaleDateString()}
              {choicePeriod.days_remaining !== undefined && (
                <Chip
                  label={`${choicePeriod.days_remaining} ${translations.daysRemaining}`}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </>
          ) : (
            translations.periodClosed
          )}
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {translations.submitSuccess}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {translations.submitError}: {error.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left: Available Options */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {translations.available} ({availableOptions.length})
          </Typography>
          <Grid container spacing={2}>
            {availableOptions.map(option => (
              <Grid item xs={12} sm={6} key={option.id}>
                <OptionCard
                  option={option}
                  selectedRank={getChoiceRankForOption(option.id)}
                  onSelect={(rank) => setChoice(rank, option.id)}
                  onDeselect={() => {
                    const rank = getChoiceRankForOption(option.id);

                    if (rank) clearChoice(rank);
                  }}
                  disabled={!canModifyChoices}
                  translations={translations}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right: Choices Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translations.yourChoices}
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <ChoiceSummaryCard
                  rank="1"
                  option={draftChoices.get('1') ? getOptionById(draftChoices.get('1')!) : undefined}
                  label={translations.firstChoice}
                  onClear={() => clearChoice('1')}
                  disabled={!canModifyChoices}
                />
                <ChoiceSummaryCard
                  rank="2"
                  option={draftChoices.get('2') ? getOptionById(draftChoices.get('2')!) : undefined}
                  label={translations.secondChoice}
                  onClear={() => clearChoice('2')}
                  disabled={!canModifyChoices}
                />
                <ChoiceSummaryCard
                  rank="3"
                  option={draftChoices.get('3') ? getOptionById(draftChoices.get('3')!) : undefined}
                  label={translations.thirdChoice}
                  onClear={() => clearChoice('3')}
                  disabled={!canModifyChoices}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!canModifyChoices || selectedCount === 0 || submitting || !hasChanges}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <i className="ri-checkbox-circle-line" />}
              >
                {translations.submit}
              </Button>

              {!canModifyChoices && choicePeriod && !choicePeriod.is_open && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="caption">{translations.periodClosed}</Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OptionSelector;
