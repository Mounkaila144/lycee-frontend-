'use client';

import { useState, useCallback, useEffect } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid2';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import {
  useGroups,
  useGroupAssignments,
  useAutoAssignment,
  useUnassignedStudents,
} from '../hooks/useGroups';

import type { Group, GroupAssignment, AutoAssignmentStrategy } from '../../types/group.types';

interface GroupAssignmentDashboardProps {
  initialGroup?: Group | null;
  moduleId?: number;
  level?: string;
  academicYearId?: number;
  onBack?: () => void;
}

/**
 * GroupAssignmentDashboard Component
 * Dashboard for managing student assignments to groups
 */
export const GroupAssignmentDashboard = ({
  initialGroup,
  moduleId,
  level,
  academicYearId,
  onBack,
}: GroupAssignmentDashboardProps) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(initialGroup || null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<GroupAssignment | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Get groups for the module
  const { groups, loading: loadingGroups } = useGroups({
    module_id: moduleId,
    level,
    academic_year_id: academicYearId,
    status: 'Active',
    per_page: 50,
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
  } = useGroupAssignments(selectedGroup?.id || null);

  // Auto assignment
  const {
    preview,
    loading: loadingAutoAssign,
    previewAutoAssign,
    executeAutoAssign,
    clearPreview,
  } = useAutoAssignment();

  // Unassigned students
  const {
    students: unassignedStudents,
    loading: loadingUnassigned,
    refresh: refreshUnassigned,
  } = useUnassignedStudents(moduleId || null, level || null, academicYearId || null);

  // Auto-select first group or initial group
  useEffect(() => {
    if (initialGroup) {
      setSelectedGroup(initialGroup);
    } else if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, initialGroup, selectedGroup]);

  // Handlers
  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleAssignStudent = async (studentId: number) => {
    if (!selectedGroup) return;

    try {
      await assignStudent({ student_id: studentId, group_id: selectedGroup.id });
      refreshUnassigned();
      setSnackbar({ open: true, message: 'Étudiant affecté avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de l\'affectation',
        severity: 'error',
      });
    }
  };

  const handleRemoveStudent = async (assignment: GroupAssignment) => {
    try {
      await removeStudent(assignment.id);
      refreshUnassigned();
      setSnackbar({ open: true, message: 'Étudiant retiré du groupe', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors du retrait',
        severity: 'error',
      });
    }
  };

  const handleMoveStudent = async (newGroupId: number) => {
    if (!selectedAssignment || !selectedAssignment.student_id) return;

    try {
      await moveStudent(selectedAssignment.student_id, newGroupId);
      refreshAssignments();
      setMoveDialogOpen(false);
      setSelectedAssignment(null);
      setSnackbar({ open: true, message: 'Étudiant déplacé avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors du déplacement',
        severity: 'error',
      });
    }
  };

  const handleOpenMoveDialog = (assignment: GroupAssignment) => {
    setSelectedAssignment(assignment);
    setMoveDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      await exportStudents();
      setSnackbar({ open: true, message: 'Export téléchargé', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'export', severity: 'error' });
    }
  };

  // Get fill rate color
  const getCapacityColor = (group: Group): 'error' | 'warning' | 'success' => {
    const count = group.current_count || 0;

    if (count < group.capacity_min) return 'warning';
    if (count > group.capacity_max) return 'error';

    return 'success';
  };

  const getFillRate = (group: Group): number => {
    const count = group.current_count || 0;

    return Math.min((count / group.capacity_max) * 100, 100);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onBack && (
            <IconButton onClick={onBack}>
              <i className="ri-arrow-left-line" />
            </IconButton>
          )}
          <Typography variant="h5">Gestion des Affectations</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<i className="ri-magic-line" />}
            onClick={() => setAutoAssignDialogOpen(true)}
            disabled={groups.length === 0 || unassignedStudents.length === 0}
          >
            Affectation automatique
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Groups List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Groupes" subheader={`${groups.length} groupe(s)`} />
            <Divider />
            <CardContent sx={{ p: 0, maxHeight: 500, overflow: 'auto' }}>
              {loadingGroups ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List disablePadding>
                  {groups.map(group => (
                    <ListItem
                      key={group.id}
                      button
                      selected={selectedGroup?.id === group.id}
                      onClick={() => handleGroupSelect(group)}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{group.code}</Typography>
                            <Chip label={group.type} size="small" color="primary" />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" display="block">
                              {group.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption">
                                {group.current_count || 0}/{group.capacity_max}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={getFillRate(group)}
                                color={getCapacityColor(group)}
                                sx={{ flex: 1, height: 4, borderRadius: 1 }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Group Details & Assignments */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selectedGroup ? (
            <Card>
              <CardHeader
                title={selectedGroup.code}
                subheader={selectedGroup.name}
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<i className="ri-user-add-line" />}
                      onClick={() => setAssignDialogOpen(true)}
                    >
                      Affecter
                    </Button>
                    <Button
                      size="small"
                      startIcon={<i className="ri-download-line" />}
                      onClick={handleExport}
                    >
                      Exporter
                    </Button>
                  </Box>
                }
              />
              <Divider />

              {/* Statistics */}
              {statistics && (
                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Effectif
                      </Typography>
                      <Typography variant="h6">
                        {statistics.current_count}/{selectedGroup.capacity_max}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Taux de remplissage
                      </Typography>
                      <Typography variant="h6">{statistics.fill_rate.toFixed(1)}%</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Capacité min
                      </Typography>
                      <Typography variant="h6">{selectedGroup.capacity_min}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Statut
                      </Typography>
                      <Chip
                        label={
                          statistics.is_below_minimum
                            ? 'Sous capacité'
                            : statistics.is_above_maximum
                              ? 'Sur capacité'
                              : 'Normal'
                        }
                        color={getCapacityColor(selectedGroup)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Divider />

              {/* Students List */}
              <CardContent sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
                {loadingAssignments ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : assignments.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aucun étudiant dans ce groupe</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {assignments.map(assignment => (
                      <ListItem
                        key={assignment.id}
                        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                      >
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
                          <Tooltip title="Déplacer">
                            <IconButton size="small" onClick={() => handleOpenMoveDialog(assignment)}>
                              <i className="ri-arrow-left-right-line" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Retirer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveStudent(assignment)}
                            >
                              <i className="ri-user-unfollow-line" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary" align="center">
                  Sélectionnez un groupe pour voir les détails
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Assign Student Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Affecter un étudiant</DialogTitle>
        <DialogContent>
          {loadingUnassigned ? (
            <CircularProgress />
          ) : unassignedStudents.length === 0 ? (
            <Alert severity="info">Tous les étudiants sont déjà affectés à un groupe.</Alert>
          ) : (
            <List>
              {unassignedStudents.slice(0, 20).map(student => (
                <ListItem
                  key={student.id}
                  button
                  onClick={() => handleAssignStudent(student.id)}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                >
                  <ListItemAvatar>
                    <Avatar>{student.firstname.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${student.firstname} ${student.lastname}`}
                    secondary={student.matricule}
                  />
                </ListItem>
              ))}
              {unassignedStudents.length > 20 && (
                <Typography variant="caption" color="text.secondary" sx={{ p: 2, display: 'block' }}>
                  Et {unassignedStudents.length - 20} autres étudiants...
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Move Student Dialog */}
      <MoveStudentDialog
        open={moveDialogOpen}
        assignment={selectedAssignment}
        groups={groups.filter(g => g.id !== selectedGroup?.id)}
        onClose={() => {
          setMoveDialogOpen(false);
          setSelectedAssignment(null);
        }}
        onMove={handleMoveStudent}
      />

      {/* Auto-Assign Dialog */}
      <AutoAssignDialog
        open={autoAssignDialogOpen}
        groups={groups}
        unassignedStudents={unassignedStudents}
        preview={preview}
        loading={loadingAutoAssign}
        onClose={() => {
          setAutoAssignDialogOpen(false);
          clearPreview();
        }}
        onPreview={previewAutoAssign}
        onExecute={async data => {
          const result = await executeAutoAssign(data);
          setSnackbar({
            open: true,
            message: `${result.assigned} étudiant(s) affecté(s) avec succès`,
            severity: 'success',
          });
          refreshAssignments();
          refreshUnassigned();
          setAutoAssignDialogOpen(false);
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Move Student Dialog Component
interface MoveStudentDialogProps {
  open: boolean;
  assignment: GroupAssignment | null;
  groups: Group[];
  onClose: () => void;
  onMove: (newGroupId: number) => void;
}

const MoveStudentDialog = ({ open, assignment, groups, onClose, onMove }: MoveStudentDialogProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');

  useEffect(() => {
    if (!open) {
      setSelectedGroupId('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Déplacer l'étudiant</DialogTitle>
      <DialogContent>
        {assignment && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              {assignment.student?.firstname} {assignment.student?.lastname}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {assignment.student?.matricule}
            </Typography>
          </Box>
        )}
        <FormControl fullWidth>
          <InputLabel>Nouveau groupe</InputLabel>
          <Select
            value={selectedGroupId}
            label="Nouveau groupe"
            onChange={e => setSelectedGroupId(e.target.value as number)}
          >
            {groups.map(group => (
              <MenuItem key={group.id} value={group.id}>
                {group.code} - {group.name} ({group.current_count || 0}/{group.capacity_max})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={() => selectedGroupId && onMove(selectedGroupId as number)}
          disabled={!selectedGroupId}
        >
          Déplacer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Auto-Assign Dialog Component
interface AutoAssignDialogProps {
  open: boolean;
  groups: Group[];
  unassignedStudents: any[];
  preview: any;
  loading: boolean;
  onClose: () => void;
  onPreview: (data: any) => void;
  onExecute: (data: any) => void;
}

const AutoAssignDialog = ({
  open,
  groups,
  unassignedStudents,
  preview,
  loading,
  onClose,
  onPreview,
  onExecute,
}: AutoAssignDialogProps) => {
  const [method, setMethod] = useState<AutoAssignmentStrategy>('balanced');

  const handlePreview = () => {
    if (groups.length === 0 || unassignedStudents.length === 0) return;

    const student_ids = unassignedStudents.map(s => s.id);
    const group_ids = groups.map(g => g.id);

    onPreview({ student_ids, group_ids, method });
  };

  const handleExecute = () => {
    if (groups.length === 0 || unassignedStudents.length === 0) return;

    const student_ids = unassignedStudents.map(s => s.id);
    const group_ids = groups.map(g => g.id);

    onExecute({ student_ids, group_ids, method });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Affectation automatique</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {unassignedStudents.length} étudiant(s) non affecté(s) • {groups.length} groupe(s) disponible(s)
            </Alert>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label="Méthode d'affectation"
              value={method}
              onChange={e => setMethod(e.target.value as AutoAssignmentStrategy)}
            >
              <MenuItem value="balanced">Équilibrée</MenuItem>
              <MenuItem value="alphabetic">Alphabétique (A-K, L-Z)</MenuItem>
              <MenuItem value="random">Aléatoire</MenuItem>
              <MenuItem value="option">Par option/spécialité</MenuItem>
            </TextField>
          </Grid>

          {preview && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {preview.total_students} étudiants seront répartis dans {preview.total_groups} groupes
              </Alert>

              {preview.warnings?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {preview.warnings.join(', ')}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {preview.preview?.map((group: any) => (
                  <Paper key={group.group_id} sx={{ p: 2, minWidth: 200 }}>
                    <Typography variant="subtitle2">{group.group_code}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {group.current_count} → {group.projected_count} étudiants
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(group.projected_count / 35) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        {!preview ? (
          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={loading || groups.length === 0 || unassignedStudents.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Prévisualiser'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleExecute} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Exécuter l'affectation"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GroupAssignmentDashboard;
