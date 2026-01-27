'use client';

import { createContext, useContext, useState, useCallback } from 'react';

import Grid from '@mui/material/Grid2';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

import GroupListTable from './GroupListTable';
import GroupFormDialog from './GroupFormDialog';
import GroupDeleteDialog from './GroupDeleteDialog';
import GroupAssignmentDialog from './GroupAssignmentDialog';
import { GroupAssignmentDashboard } from './GroupAssignmentDashboard';
import { GroupExportDialog } from './GroupExportDialog';

import { useGroups, type PaginationMeta } from '../hooks/useGroups';

import type { Group, GroupFormData, GroupQueryParams } from '../../types/group.types';

// Context for sharing group data between components
interface GroupsContextType {
  groups: Group[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  params: GroupQueryParams;
  updateParams: (newParams: Partial<GroupQueryParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  refresh: () => void;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  onViewAssignments: (group: Group) => void;
  onViewDashboard: (group: Group) => void;
  onExport: (group: Group) => void;
  onCreate: () => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const useGroupsContext = () => {
  const context = useContext(GroupsContext);

  if (!context) {
    throw new Error('useGroupsContext must be used within GroupList');
  }

  return context;
};

interface GroupListProps {
  onViewAssignments?: (group: Group) => void;
}

/**
 * GroupList Component
 * Main component for displaying and managing groups
 */
export const GroupList = ({ onViewAssignments }: GroupListProps) => {
  const groupsData = useGroups();
  const { createGroup, updateGroup, deleteGroup, refresh } = groupsData;

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedGroup(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = useCallback((group: Group) => {
    setSelectedGroup(group);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  }, []);

  const handleViewAssignments = useCallback(
    (group: Group) => {
      setSelectedGroup(group);
      setAssignmentDialogOpen(true);
    },
    []
  );

  const handleViewDashboard = useCallback(
    (group: Group) => {
      setSelectedGroup(group);
      setDashboardDialogOpen(true);
    },
    []
  );

  const handleExport = useCallback(
    (group: Group) => {
      setSelectedGroup(group);
      setExportDialogOpen(true);
    },
    []
  );

  const handleExportClose = useCallback(() => {
    setExportDialogOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleExportSuccess = useCallback(() => {
    setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
  }, []);

  const handleAssignmentClose = useCallback(() => {
    setAssignmentDialogOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleDashboardClose = useCallback(() => {
    setDashboardDialogOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleSave = useCallback(
    async (data: GroupFormData) => {
      try {
        if (selectedGroup) {
          await updateGroup(selectedGroup.id, data);
          setSnackbar({ open: true, message: 'Groupe modifié avec succès', severity: 'success' });
        } else {
          await createGroup(data);
          setSnackbar({ open: true, message: 'Groupe créé avec succès', severity: 'success' });
        }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Une erreur est survenue';
        setSnackbar({ open: true, message, severity: 'error' });
        throw err;
      }
    },
    [selectedGroup, createGroup, updateGroup]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      await deleteGroup(selectedGroup.id);
      setSnackbar({ open: true, message: 'Groupe supprimé avec succès', severity: 'success' });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setSnackbar({ open: true, message, severity: 'error' });
      throw err;
    }
  }, [selectedGroup, deleteGroup]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <GroupsContext.Provider
      value={{
        ...groupsData,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onViewAssignments: handleViewAssignments,
        onViewDashboard: handleViewDashboard,
        onExport: handleExport,
        onCreate: handleCreate,
      }}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <GroupListTable />
        </Grid>
      </Grid>

      {/* Form Dialog */}
      <GroupFormDialog
        open={formDialogOpen}
        group={selectedGroup}
        onClose={handleFormClose}
        onSave={handleSave}
      />

      {/* Delete Dialog */}
      <GroupDeleteDialog
        open={deleteDialogOpen}
        group={selectedGroup}
        onClose={handleDeleteClose}
        onConfirm={handleConfirmDelete}
      />

      {/* Assignment Dialog */}
      <GroupAssignmentDialog
        open={assignmentDialogOpen}
        group={selectedGroup}
        onClose={handleAssignmentClose}
        onRefresh={refresh}
      />

      {/* Export Dialog */}
      <GroupExportDialog
        open={exportDialogOpen}
        group={selectedGroup}
        onClose={handleExportClose}
        onSuccess={handleExportSuccess}
      />

      {/* Dashboard Dialog */}
      <Dialog
        open={dashboardDialogOpen}
        onClose={handleDashboardClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            m: 3,
            borderRadius: 2,
          },
        }}
      >
        <IconButton
          onClick={handleDashboardClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <i className="ri-close-line" />
        </IconButton>
        <DialogContent sx={{ p: 3, overflow: 'auto', height: '100%' }}>
          {selectedGroup && dashboardDialogOpen && (
            <GroupAssignmentDashboard
              initialGroup={selectedGroup}
              moduleId={selectedGroup.module_id}
              level={selectedGroup.level}
              academicYearId={selectedGroup.academic_year_id}
              onBack={handleDashboardClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GroupsContext.Provider>
  );
};

export default GroupList;
