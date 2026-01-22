'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper
} from '@mui/material';
import { ManageRolesDialog } from './ManageRolesDialog';
import type { User } from '../../types/user.types';

interface UserRolesSectionProps {
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
  readOnly?: boolean;
}

export const UserRolesSection: React.FC<UserRolesSectionProps> = ({
  user,
  onUserUpdate,
  readOnly = false
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSuccess = (updatedUser: User) => {
    onUserUpdate?.(updatedUser);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Rôles</Typography>
        {!readOnly && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDialogOpen(true)}
          >
            Gérer
          </Button>
        )}
      </Box>

      {user.roles && user.roles.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {user.roles.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              color="secondary"
              variant="filled"
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucun rôle assigné
        </Typography>
      )}

      {!readOnly && (
        <ManageRolesDialog
          user={user}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </Paper>
  );
};
