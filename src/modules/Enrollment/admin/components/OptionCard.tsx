'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import type { Option, ChoiceRank } from '../../types/option.types';

interface OptionCardProps {
  option: Option;
  selectedRank?: ChoiceRank | null;
  onSelect?: (rank: ChoiceRank) => void;
  onDeselect?: () => void;
  disabled?: boolean;
  showActions?: boolean;
  translations: {
    capacity: string;
    enrolled: string;
    remaining: string;
    full: string;
    closed: string;
    prerequisites: string;
    select: string;
    deselect: string;
    firstChoice: string;
    secondChoice: string;
    thirdChoice: string;
    openUntil: string;
    prerequisiteNotMet: string;
  };
}

/**
 * Get rank label
 */
const getRankLabel = (rank: ChoiceRank, translations: OptionCardProps['translations']): string => {
  switch (rank) {
    case '1':
      return translations.firstChoice;
    case '2':
      return translations.secondChoice;
    case '3':
      return translations.thirdChoice;
    default:
      return '';
  }
};

/**
 * Option Card Component
 * Displays an option/specialization with selection capability
 */
export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  selectedRank,
  onSelect,
  onDeselect,
  disabled = false,
  showActions = true,
  translations,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const isSelected = selectedRank !== null && selectedRank !== undefined;
  const isFull = option.is_full;
  const isClosed = option.status === 'Closed';
  const hasPrerequisiteIssue = option.prerequisite_modules?.some(p => !p.is_met);

  const canSelect = !disabled && !isFull && !isClosed && !hasPrerequisiteIssue && option.is_open;

  const capacityPercentage = option.capacity
    ? (option.enrolled_count / option.capacity) * 100
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusChip = () => {
    if (isClosed) {
      return <Chip label={translations.closed} size="small" color="error" />;
    }

    if (isFull) {
      return <Chip label={translations.full} size="small" color="warning" />;
    }

    if (hasPrerequisiteIssue) {
      return (
        <Tooltip title={translations.prerequisiteNotMet}>
          <Chip
            icon={<i className="ri-lock-fill" style={{ fontSize: 16 }} />}
            label={translations.prerequisites}
            size="small"
            color="error"
            variant="outlined"
          />
        </Tooltip>
      );
    }

    return null;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: !canSelect && !isSelected ? 0.7 : 1,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: canSelect ? 3 : 1,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box>
            <Typography variant="h6" component="div" fontWeight={600}>
              {option.code}
            </Typography>
            <Typography variant="body1" color="text.primary">
              {option.name}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
            {isSelected && (
              <Chip
                icon={<i className="ri-star-fill" style={{ fontSize: 16 }} />}
                label={getRankLabel(selectedRank!, translations)}
                size="small"
                color="primary"
              />
            )}
            {getStatusChip()}
          </Box>
        </Box>

        {/* Capacity Bar */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <i className="ri-group-line" style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.54)' }} />
              <Typography variant="body2" color="text.secondary">
                {option.enrolled_count} / {option.capacity}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {option.remaining_capacity} {translations.remaining}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={capacityPercentage}
            color={isFull ? 'error' : capacityPercentage >= 80 ? 'warning' : 'primary'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Period */}
        {option.choice_end_date && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <i className="ri-calendar-line" style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.54)' }} />
            <Typography variant="caption" color="text.secondary">
              {translations.openUntil}: {formatDate(option.choice_end_date)}
            </Typography>
          </Box>
        )}

        {/* Description Toggle */}
        {option.description && (
          <Box>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={<i className={expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />}
              sx={{ p: 0, minWidth: 'auto' }}
            >
              {expanded ? 'Masquer' : 'Voir plus'}
            </Button>
            <Collapse in={expanded}>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {option.description}
              </Typography>
            </Collapse>
          </Box>
        )}

        {/* Prerequisites Warning */}
        {hasPrerequisiteIssue && expanded && (
          <Box mt={2} p={1} bgcolor="error.50" borderRadius={1}>
            <Typography variant="caption" color="error.main" fontWeight={600}>
              {translations.prerequisites}:
            </Typography>
            {option.prerequisite_modules?.map(prereq => (
              <Box key={prereq.module_id} display="flex" alignItems="center" gap={0.5} ml={1}>
                {prereq.is_met ? (
                  <i className="ri-checkbox-circle-fill" style={{ fontSize: 14, color: '#4caf50' }} />
                ) : (
                  <i className="ri-error-warning-fill" style={{ fontSize: 14, color: '#f44336' }} />
                )}
                <Typography variant="caption">
                  {prereq.module_code} (min: {prereq.min_grade}/20)
                  {prereq.student_grade !== undefined && ` - Votre note: ${prereq.student_grade}/20`}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          {isSelected ? (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={onDeselect}
              startIcon={<i className="ri-star-fill" />}
            >
              {translations.deselect}
            </Button>
          ) : (
            <Box display="flex" gap={1} width="100%">
              {(['1', '2', '3'] as ChoiceRank[]).map(rank => (
                <Tooltip key={rank} title={getRankLabel(rank, translations)}>
                  <span style={{ flex: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={!canSelect}
                      onClick={() => onSelect?.(rank)}
                      startIcon={<i className="ri-star-line" />}
                    >
                      {rank}
                    </Button>
                  </span>
                </Tooltip>
              ))}
            </Box>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default OptionCard;
