'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { usePermissionsList } from '../hooks/usePermissions';
import { useUserPermissionsMutations } from '../hooks/useUserPermissionsMutations';
import type { User } from '../../types/user.types';

interface ManagePermissionsDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSuccess?: (updatedUser: User) => void;
}

export const ManagePermissionsDialog: React.FC<ManagePermissionsDialogProps> = ({
  user,
  open,
  onClose,
  onSuccess
}) => {
  const { permissions: availablePermissions, loading: loadingPermissions } = usePermissionsList();
  const { syncPermissions, loading: syncing, error } = useUserPermissionsMutations(user.id);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions || []);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update selected permissions when user changes
  useEffect(() => {
    setSelectedPermissions(user.permissions || []);
  }, [user.permissions]);

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleSave = async () => {
    try {
      const updatedUser = await syncPermissions(selectedPermissions);
      if (updatedUser) {
        onSuccess?.(updatedUser);
        onClose();
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to save permissions:', err);
    }
  };

  const handleCancel = () => {
    setSelectedPermissions(user.permissions || []);
    setSearchQuery('');
    onClose();
  };

  // Filter permissions based on search query
  const filteredPermissions = availablePermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        Gérer les Permissions - {user.full_name}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Rechercher une permission..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          disabled={syncing}
        />

        {loadingPermissions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPermissions.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {searchQuery ? 'Aucune permission trouvée' : 'Aucune permission disponible'}
          </Typography>
        ) : (
          <FormGroup>
            {filteredPermissions.map((permission) => (
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission.name)}
                    onChange={() => handleTogglePermission(permission.name)}
                    disabled={syncing}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      {permission.display_name || permission.name}
                    </Typography>
                    {permission.description && (
                      <Typography variant="caption" color="text.secondary">
                        {permission.description}
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          {selectedPermissions.length} permission(s) sélectionnée(s)
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={syncing}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={syncing || loadingPermissions}
        >
          {syncing ? <CircularProgress size={20} /> : 'Sauvegarder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
