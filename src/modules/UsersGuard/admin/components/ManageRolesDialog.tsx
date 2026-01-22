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
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
// Using Iconify icons via CSS classes
import { useRolesList } from '../hooks/useRoles';
import { useUserRolesMutations } from '../hooks/useUserRolesMutations';
import type { User } from '../../types/user.types';

interface ManageRolesDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSuccess?: (updatedUser: User) => void;
}

export const ManageRolesDialog: React.FC<ManageRolesDialogProps> = ({
  user,
  open,
  onClose,
  onSuccess
}) => {
  const { roles: availableRoles, loading: loadingRoles } = useRolesList();
  const { syncRoles, loading: syncing, error } = useUserRolesMutations(user.id);

  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles || []);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update selected roles when user changes
  useEffect(() => {
    setSelectedRoles(user.roles || []);
  }, [user.roles]);

  const handleToggleRole = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSave = async () => {
    try {
      const updatedUser = await syncRoles(selectedRoles);
      if (updatedUser) {
        onSuccess?.(updatedUser);
        onClose();
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to save roles:', err);
    }
  };

  const handleCancel = () => {
    setSelectedRoles(user.roles || []);
    setSearchQuery('');
    onClose();
  };

  // Filter roles based on search query
  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        Gérer les Rôles - {user.full_name}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Rechercher un rôle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          disabled={syncing}
        />

        {loadingRoles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredRoles.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {searchQuery ? 'Aucun rôle trouvé' : 'Aucun rôle disponible'}
          </Typography>
        ) : (
          <Box>
            {filteredRoles.map((role) => (
              <Accordion key={role.id} disableGutters elevation={0}>
                <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => handleToggleRole(role.name)}
                        disabled={syncing}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {role.display_name || role.name}
                        </Typography>
                        {role.description && (
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        )}
                      </Box>
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </AccordionSummary>
                {role.permissions && role.permissions.length > 0 && (
                  <AccordionDetails>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Permissions incluses:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.permissions.map((permission) => (
                        <Chip
                          key={permission.id}
                          label={permission.display_name || permission.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                )}
              </Accordion>
            ))}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          {selectedRoles.length} rôle(s) sélectionné(s)
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={syncing}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={syncing || loadingRoles}
        >
          {syncing ? <CircularProgress size={20} /> : 'Sauvegarder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
