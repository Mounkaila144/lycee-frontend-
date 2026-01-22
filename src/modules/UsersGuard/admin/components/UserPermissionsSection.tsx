'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper
} from '@mui/material';
import { ManagePermissionsDialog } from './ManagePermissionsDialog';
import type { User } from '../../types/user.types';

interface UserPermissionsSectionProps {
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
  readOnly?: boolean;
}

export const UserPermissionsSection: React.FC<UserPermissionsSectionProps> = ({
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
        <Typography variant="h6">Permissions</Typography>
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

      {user.permissions && user.permissions.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {user.permissions.map((permission) => (
            <Chip
              key={permission}
              label={permission}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucune permission directe assignée
        </Typography>
      )}

      {!readOnly && (
        <ManagePermissionsDialog
          user={user}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </Paper>
  );
};
