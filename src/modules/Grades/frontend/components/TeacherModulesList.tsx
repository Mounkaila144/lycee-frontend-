'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import type { TeacherModule } from '../../types/grade.types';

/**
 * Props for TeacherModulesList
 */
interface TeacherModulesListProps {
  modules: TeacherModule[];
  selectedModule: TeacherModule | null;
  loading: boolean;
  error: Error | null;
  onSelectModule: (module: TeacherModule) => void;
}

/**
 * Loading skeleton for module cards
 */
const ModuleCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="60%" height={28} />
      <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
      <Box display="flex" gap={1} mt={1}>
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * TeacherModulesList Component
 * Displays teacher's assigned modules for selection
 */
export const TeacherModulesList: React.FC<TeacherModulesListProps> = ({
  modules = [],
  selectedModule,
  loading,
  error,
  onSelectModule,
}) => {
  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Mes Modules
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <ModuleCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Erreur lors du chargement des modules: {error.message}
      </Alert>
    );
  }

  if (modules.length === 0) {
    return (
      <Alert severity="info">
        Aucun module ne vous est assigné pour ce semestre.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Mes Modules ({modules.length})
      </Typography>

      <Grid container spacing={2}>
        {modules.map((module) => {
          const isSelected = selectedModule?.id === module.id;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  border: isSelected ? '2px solid' : '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease',
                }}
              >
                <CardActionArea
                  onClick={() => onSelectModule(module)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    {/* Module Code */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {module.code}
                    </Typography>

                    {/* Module Name */}
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {module.name}
                    </Typography>

                    {/* Module Info */}
                    <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
                      {/* Semester */}
                      {module.semester && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <i className="ri-calendar-line" style={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {module.semester.name}
                          </Typography>
                        </Box>
                      )}

                      {/* Type */}
                      {module.type && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <i className="ri-book-open-line" style={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {module.type}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Stats */}
                    <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                      <Chip
                        icon={<i className="ri-file-list-3-line" style={{ fontSize: 14 }} />}
                        label={`${module.evaluation_count} éval.`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${module.credits} ECTS`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {module.hours_allocated > 0 && (
                        <Chip
                          icon={<i className="ri-time-line" style={{ fontSize: 14 }} />}
                          label={`${module.hours_allocated}h`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
