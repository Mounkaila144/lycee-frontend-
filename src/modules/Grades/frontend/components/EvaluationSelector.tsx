'use client';

import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import type { Evaluation, EvaluationType } from '../../types/grade.types';

/**
 * Props for EvaluationSelector
 */
interface EvaluationSelectorProps {
  evaluations: Evaluation[];
  selectedEvaluation: Evaluation | null;
  loading: boolean;
  onSelectEvaluation: (evaluation: Evaluation) => void;
}

/**
 * Get color for evaluation type
 */
const getTypeColor = (type: EvaluationType): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' => {
  switch (type) {
    case 'Examen':
      return 'error';
    case 'CC':
    case 'CC1':
    case 'CC2':
      return 'primary';
    case 'TP':
    case 'TD':
      return 'info';
    case 'Projet':
      return 'success';
    case 'Rattrapage':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Format date for display
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Non planifiée';

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * EvaluationSelector Component
 * List of evaluations for a module
 */
export const EvaluationSelector: React.FC<EvaluationSelectorProps> = ({
  evaluations = [],
  selectedEvaluation,
  loading,
  onSelectEvaluation,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (evaluations.length === 0) {
    return (
      <Box p={2}>
        <Typography color="text.secondary" textAlign="center">
          Aucune évaluation configurée pour ce module.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      <Box px={2} py={1} bgcolor="grey.50">
        <Typography variant="subtitle2" fontWeight="bold">
          Évaluations ({evaluations.length})
        </Typography>
      </Box>
      <Divider />
      <List dense disablePadding>
        {evaluations.map((evaluation, index) => {
          const isSelected = selectedEvaluation?.id === evaluation.id;
          const gradesProgress =
            evaluation.students_count && evaluation.grades_count !== undefined
              ? Math.round((evaluation.grades_count / evaluation.students_count) * 100)
              : 0;

          return (
            <React.Fragment key={evaluation.id}>
              {index > 0 && <Divider />}
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelectEvaluation(evaluation)}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.lighter',
                    borderLeft: '3px solid',
                    borderLeftColor: 'primary.main',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {evaluation.is_published ? (
                    <i className="ri-send-plane-fill" style={{ color: '#4caf50' }} />
                  ) : (
                    <i className="ri-file-list-3-line" style={{ color: '#9e9e9e' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {evaluation.name}
                      </Typography>
                      <Chip
                        label={evaluation.type}
                        size="small"
                        color={getTypeColor(evaluation.type)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <i className="ri-time-line" style={{ fontSize: 14, color: '#9e9e9e' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(evaluation.date)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Coef: {evaluation.coefficient}
                      </Typography>
                      {evaluation.students_count && (
                        <Typography variant="caption" color="text.secondary">
                          {evaluation.grades_count || 0}/{evaluation.students_count} notes
                        </Typography>
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
                {/* Progress indicator */}
                {evaluation.students_count && evaluation.students_count > 0 && (
                  <Box sx={{ ml: 1 }}>
                    {gradesProgress === 100 ? (
                      <i className="ri-checkbox-circle-fill" style={{ color: '#4caf50', fontSize: 20 }} />
                    ) : (
                      <Box position="relative" display="inline-flex">
                        <CircularProgress
                          variant="determinate"
                          value={gradesProgress}
                          size={24}
                          thickness={5}
                          sx={{
                            color: gradesProgress > 50 ? 'success.main' : 'warning.main',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                            {gradesProgress}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </ListItemButton>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};
