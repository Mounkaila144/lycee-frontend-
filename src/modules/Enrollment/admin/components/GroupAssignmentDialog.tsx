'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Grid from '@mui/material/Grid2';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import { useGroupAssignments } from '../hooks/useGroups';
import { useTenant } from '@/shared/lib/tenant-context';
import { groupService } from '../services/groupService';

import type { Group, GroupAssignment } from '../../types/group.types';

interface GroupAssignmentDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onRefresh?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

/**
 * GroupAssignmentDialog Component
 * Modal for managing student assignments to a specific group
 */
export const GroupAssignmentDialog = ({ open, group, onClose, onRefresh }: GroupAssignmentDialogProps) => {
  const { tenantId } = useTenant();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<GroupAssignment | null>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loadingAvailableGroups, setLoadingAvailableGroups] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Get assignments for selected group
  const {
    assignments,
    statistics,
    loading: loadingAssignments,
    assignStudent,
    removeStudent,
    moveStudent,
    exportStudents,
    refresh: refreshAssignments,
  } = useGroupAssignments(group?.id || null);

  // Load available groups when move dialog opens
  useEffect(() => {
    const loadAvailableGroups = async () => {
      if (!group || !moveDialogOpen) {
        setAvailableGroups([]);
        return;
      }

      setLoadingAvailableGroups(true);

      try {
        const response = await groupService.getGroups(tenantId || undefined, {
          module_id: group.module_id,
          level: group.level,
          academic_year_id: group.academic_year_id,
          status: 'Active',
          per_page: 50,
        });

        setAvailableGroups(response.data);
      } catch (err) {
        console.error('Error loading available groups:', err);
        setAvailableGroups([]);
      } finally {
        setLoadingAvailableGroups(false);
      }
    };

    loadAvailableGroups();
  }, [group, moveDialogOpen, tenantId]);

  // Load available students when tab changes to "Affecter"
  useEffect(() => {
    const loadAvailableStudents = async () => {
      if (!group || tabValue !== 1) return;

      setLoadingStudents(true);

      try {
        const response = await groupService.getUnassignedStudents(
          group.module_id,
          group.level,
          group.academic_year_id,
          tenantId || undefined,
          group.program_id || group.program?.id
        );

        setAvailableStudents(response.data || []);
      } catch (err) {
        console.error('Error loading unassigned students:', err);
        setAvailableStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadAvailableStudents();
  }, [group, tabValue, tenantId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTabValue(0);
      setSearchQuery('');
      setSelectedAssignment(null);
      setMoveDialogOpen(false);
    }
  }, [open]);

  // Handlers
  const handleAssignStudent = async (studentId: number) => {
    if (!group) return;

    try {
      await assignStudent({ student_id: studentId, group_id: group.id });
      setAvailableStudents(prev => prev.filter(s => s.id !== studentId));
      setSnackbar({ open: true, message: 'Etudiant affecte avec succes', severity: 'success' });
      onRefresh?.();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Erreur lors de l'affectation",
        severity: 'error',
      });
    }
  };

  const handleRemoveStudent = async (assignment: GroupAssignment) => {
    try {
      await removeStudent(assignment.id);
      // Add student back to available list
      if (assignment.student) {
        setAvailableStudents(prev => [
          ...prev,
          {
            id: assignment.student_id,
            matricule: assignment.student.matricule,
            firstname: assignment.student.firstname,
            lastname: assignment.student.lastname,
          },
        ]);
      }
      setSnackbar({ open: true, message: 'Etudiant retire du groupe', severity: 'success' });
      onRefresh?.();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors du retrait',
        severity: 'error',
      });
    }
  };

  const handleOpenMoveDialog = (assignment: GroupAssignment) => {
    setSelectedAssignment(assignment);
    setMoveDialogOpen(true);
  };

  const handleMoveStudent = async (newGroupId: number) => {
    if (!selectedAssignment || !selectedAssignment.student_id) return;

    try {
      await moveStudent(selectedAssignment.student_id, newGroupId);
      setMoveDialogOpen(false);
      setSelectedAssignment(null);
      setSnackbar({ open: true, message: 'Etudiant deplace avec succes', severity: 'success' });
      onRefresh?.();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors du deplacement',
        severity: 'error',
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportStudents();
      setSnackbar({ open: true, message: 'Export telecharge', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: "Erreur lors de l'export", severity: 'error' });
    }
  };

  // Filter assignments by search
  const filteredAssignments = assignments.filter(a => {
    if (!searchQuery) return true;
    const student = a.student;
    const query = searchQuery.toLowerCase();

    return (
      student?.firstname?.toLowerCase().includes(query) ||
      student?.lastname?.toLowerCase().includes(query) ||
      student?.matricule?.toLowerCase().includes(query)
    );
  });

  // Filter available students by search
  const filteredStudents = availableStudents.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    return (
      s.firstname?.toLowerCase().includes(query) ||
      s.lastname?.toLowerCase().includes(query) ||
      s.matricule?.toLowerCase().includes(query)
    );
  });

  // Get capacity color
  const getCapacityColor = (): 'error' | 'warning' | 'success' => {
    if (!group) return 'success';
    const count = group.current_count || assignments.length;

    if (count < group.capacity_min) return 'warning';
    if (count > group.capacity_max) return 'error';

    return 'success';
  };

  const getFillRate = (): number => {
    if (!group) return 0;
    const count = group.current_count || assignments.length;

    return Math.min((count / group.capacity_max) * 100, 100);
  };

  if (!group) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Gestion des affectations</Typography>
              <Typography variant="body2" color="text.secondary">
                {group.code} - {group.name}
              </Typography>
            </Box>
            <Chip label={group.type} color="primary" size="small" />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Statistics */}
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Effectif
                </Typography>
                <Typography variant="h6">
                  {assignments.length}/{group.capacity_max}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Taux de remplissage
                </Typography>
                <Typography variant="h6">{getFillRate().toFixed(1)}%</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Capacite min/max
                </Typography>
                <Typography variant="h6">
                  {group.capacity_min} / {group.capacity_max}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Statut
                </Typography>
                <Chip
                  label={
                    assignments.length < group.capacity_min
                      ? 'Sous capacite'
                      : assignments.length > group.capacity_max
                        ? 'Sur capacite'
                        : 'Normal'
                  }
                  color={getCapacityColor()}
                  size="small"
                />
              </Grid>
            </Grid>
            <LinearProgress
              variant="determinate"
              value={getFillRate()}
              color={getCapacityColor()}
              sx={{ mt: 2, height: 8, borderRadius: 1 }}
            />
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label={`Etudiants (${assignments.length})`} />
              <Tab label={`Affecter (${availableStudents.length})`} />
            </Tabs>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un etudiant..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ my: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              ),
            }}
          />

          {/* Tab Panel: Current Students */}
          <TabPanel value={tabValue} index={0}>
            {loadingAssignments ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredAssignments.length === 0 ? (
              <Alert severity="info">Aucun etudiant dans ce groupe</Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredAssignments.map(assignment => (
                  <ListItem key={assignment.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemAvatar>
                      <Avatar>{assignment.student?.firstname?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${assignment.student?.firstname} ${assignment.student?.lastname}`}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {assignment.student?.matricule}
                          </Typography>
                          <Chip
                            label={assignment.assignment_method === 'Automatic' ? 'Auto' : 'Manuel'}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Deplacer vers un autre groupe">
                        <IconButton size="small" onClick={() => handleOpenMoveDialog(assignment)}>
                          <i className="ri-arrow-left-right-line" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Retirer du groupe">
                        <IconButton size="small" color="error" onClick={() => handleRemoveStudent(assignment)}>
                          <i className="ri-user-unfollow-line" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>

          {/* Tab Panel: Available Students to Assign */}
          <TabPanel value={tabValue} index={1}>
            {loadingStudents ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredStudents.length === 0 ? (
              <Alert severity="info">Aucun etudiant disponible pour affectation</Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredStudents.map(student => (
                  <ListItem
                    key={student.id}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                    onClick={() => handleAssignStudent(student.id)}
                  >
                    <ListItemAvatar>
                      <Avatar>{student.firstname?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${student.firstname} ${student.lastname}`} secondary={student.matricule} />
                    <ListItemSecondaryAction>
                      <Tooltip title="Affecter a ce groupe">
                        <IconButton size="small" color="primary" onClick={() => handleAssignStudent(student.id)}>
                          <i className="ri-user-add-line" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<i className="ri-download-line" />} onClick={handleExport} disabled={assignments.length === 0}>
            Exporter
          </Button>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Move Student Dialog */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deplacer l'etudiant</DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2">
                {selectedAssignment.student?.firstname} {selectedAssignment.student?.lastname}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedAssignment.student?.matricule}
              </Typography>
            </Box>
          )}
          <FormControl fullWidth>
            <InputLabel>Nouveau groupe</InputLabel>
            <Select
              label="Nouveau groupe"
              onChange={e => handleMoveStudent(e.target.value as number)}
              disabled={loadingAvailableGroups}
            >
              {availableGroups
                .filter(g => g.id !== group?.id)
                .map(g => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.code} - {g.name} ({g.current_count || 0}/{g.capacity_max})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GroupAssignmentDialog;
