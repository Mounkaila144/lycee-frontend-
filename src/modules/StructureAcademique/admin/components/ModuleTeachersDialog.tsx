'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Autocomplete,
} from '@mui/material';
import { useModuleTeachers } from '../hooks/useModuleTeachers';
import { useTeachers } from '../hooks/useTeachers';
import type { Module } from '../../types/module.types';
import type { TeachingType, AssignTeacherRequest } from '../../types/moduleTeacher.types';
import {
  getTeachingTypeLabel,
  getTeachingTypeBadgeColor,
  getAcademicYears,
  getCurrentAcademicYear,
} from '../../types/moduleTeacher.types';

interface ModuleTeachersDialogProps {
  open: boolean;
  onClose: () => void;
  module: Module | null;
}

const TEACHING_TYPES: TeachingType[] = ['CM', 'TD', 'TP'];

const ModuleTeachersDialog: React.FC<ModuleTeachersDialogProps> = ({ open, onClose, module }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeachingType, setSelectedTeachingType] = useState<TeachingType>('CM');
  const [hoursAssigned, setHoursAssigned] = useState<number>(0);
  const [adding, setAdding] = useState(false);

  const { teachers, loading, error, selectedYear, setSelectedYear, assignTeacher, removeAssignment } =
    useModuleTeachers(module?.id || 0);

  const { teachers: availableTeachers, loading: teachersLoading } = useTeachers();

  const academicYears = getAcademicYears();

  if (!module) return null;

  // Calculate total hours by type
  const totalHoursByType = teachers.reduce(
    (acc, t) => {
      acc[t.teaching_type] = (acc[t.teaching_type] || 0) + t.hours_assigned;
      return acc;
    },
    {} as Record<TeachingType, number>
  );

  // Get max hours from module
  const maxHours = {
    CM: module.hours_cm || 0,
    TD: module.hours_td || 0,
    TP: module.hours_tp || 0,
  };

  const handleAdd = async () => {
    if (!selectedTeacherId || hoursAssigned <= 0 || !module) return;

    try {
      setAdding(true);
      
      // Vérifier que le module a un programme
      if (!module.programmes && !module.programs) {
        alert('Ce module n\'a pas de programme associé. Veuillez d\'abord associer un programme au module.');
        setAdding(false);
        return;
      }
      
      const programmes = module.programmes || module.programs || [];
      if (programmes.length === 0) {
        alert('Ce module n\'a pas de programme associé. Veuillez d\'abord associer un programme au module.');
        setAdding(false);
        return;
      }
      
      // Construire le payload selon le format exact du backend
      const payload: AssignTeacherRequest = {
        teacher_id: selectedTeacherId,
        module_id: module.id,
        programme_id: programmes[0].id,
        level: module.level,
        semester_id: parseInt(module.semester.replace('S', '')), // S1 -> 1, S2 -> 2, etc.
        type: selectedTeachingType,
        hours_allocated: hoursAssigned,
        group_id: null, // Toujours null pour l'instant
      };
      
      console.log('Payload to send:', payload);
      
      await assignTeacher(payload);
      setSelectedTeacherId(null);
      setHoursAssigned(0);
    } catch (error) {
      console.error('Error assigning teacher:', error);
      // Afficher l'erreur à l'utilisateur
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'affectation';
        alert(errorMessage);
        console.error('Backend error:', axiosError.response?.data);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (confirm('Êtes-vous sûr de vouloir retirer cette affectation ?')) {
      try {
        await removeAssignment(assignmentId);
      } catch (error) {
        console.error('Error removing assignment:', error);
      }
    }
  };

  // Group teachers by teaching type
  const teachersByType = teachers.reduce(
    (acc, t) => {
      if (!acc[t.teaching_type]) acc[t.teaching_type] = [];
      acc[t.teaching_type].push(t);
      return acc;
    },
    {} as Record<TeachingType, typeof teachers>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5">Affectation des Enseignants</Typography>
            <Typography variant="body2" color="text.secondary">
              {module.code} - {module.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Academic Year Selector */}
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Année Académique"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            size="small"
          >
            {academicYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
                {year === getCurrentAcademicYear() && ' (Actuelle)'}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Volume Horaire Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Volume horaire du module:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {maxHours.CM > 0 && (
              <Chip
                label={`CM: ${totalHoursByType.CM || 0}/${maxHours.CM}h`}
                size="small"
                color={totalHoursByType.CM === maxHours.CM ? 'success' : 'default'}
              />
            )}
            {maxHours.TD > 0 && (
              <Chip
                label={`TD: ${totalHoursByType.TD || 0}/${maxHours.TD}h`}
                size="small"
                color={totalHoursByType.TD === maxHours.TD ? 'success' : 'default'}
              />
            )}
            {maxHours.TP > 0 && (
              <Chip
                label={`TP: ${totalHoursByType.TP || 0}/${maxHours.TP}h`}
                size="small"
                color={totalHoursByType.TP === maxHours.TP ? 'success' : 'default'}
              />
            )}
          </Box>
        </Alert>

        {/* Add Section */}
        <Box sx={{ mb: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Affecter un Enseignant
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
              <Autocomplete
                options={availableTeachers}
                getOptionLabel={(option) => `${option.name}${option.department ? ` (${option.department})` : ''}`}
                value={availableTeachers.find((t) => t.id === selectedTeacherId) || null}
                onChange={(_, newValue) => setSelectedTeacherId(newValue?.id || null)}
                renderInput={(params) => (
                  <TextField {...params} label="Enseignant" placeholder="Sélectionner un enseignant" size="small" />
                )}
                disabled={adding || teachersLoading}
                loading={teachersLoading}
              />
            </Box>
            <Box sx={{ flex: '0 1 120px', minWidth: 100 }}>
              <TextField
                select
                fullWidth
                label="Type"
                value={selectedTeachingType}
                onChange={(e) => setSelectedTeachingType(e.target.value as TeachingType)}
                disabled={adding}
                size="small"
              >
                {TEACHING_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: '0 1 100px', minWidth: 80 }}>
              <TextField
                type="number"
                fullWidth
                label="Heures"
                value={hoursAssigned}
                onChange={(e) => setHoursAssigned(Number(e.target.value))}
                disabled={adding}
                size="small"
                slotProps={{ htmlInput: { min: 0, max: maxHours[selectedTeachingType] } }}
              />
            </Box>
            <Box sx={{ flex: '0 1 120px', minWidth: 100 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAdd}
                disabled={!selectedTeacherId || hoursAssigned <= 0 || adding}
                startIcon={adding ? <CircularProgress size={16} /> : <i className="ri-add-line" />}
              >
                Ajouter
              </Button>
            </Box>
          </Box>
        </Box>

        {/* List Section */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : teachers.length === 0 ? (
          <Alert severity="warning">Aucun enseignant affecté pour cette année académique.</Alert>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enseignants Affectés ({selectedYear})
            </Typography>
            {TEACHING_TYPES.map((type) => {
              const typeTeachers = teachersByType[type] || [];
              if (typeTeachers.length === 0) return null;

              return (
                <Box key={type} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {getTeachingTypeLabel(type)} ({totalHoursByType[type] || 0}/{maxHours[type]}h)
                  </Typography>
                  <List dense>
                    {typeTeachers.map((assignment, index) => (
                      <React.Fragment key={assignment.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemove(assignment.id)}
                              color="error"
                            >
                              <i className="ri-delete-bin-line" />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {assignment.teacher?.name || 'Enseignant inconnu'}
                                </Typography>
                                <Chip
                                  label={`${assignment.hours_assigned}h`}
                                  size="small"
                                  color={getTeachingTypeBadgeColor(assignment.teaching_type)}
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {assignment.teacher?.email || 'N/A'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleTeachersDialog;
