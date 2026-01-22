'use client';

import React from 'react';
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
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { useModuleDependencyGraph } from '../hooks/useModulePrerequisites';
import type { Module } from '../../types/module.types';

interface ModuleDependencyGraphDialogProps {
  open: boolean;
  onClose: () => void;
  module: Module | null;
}

const ModuleDependencyGraphDialog: React.FC<ModuleDependencyGraphDialogProps> = ({ open, onClose, module }) => {
  const { dependencyGraph, loading, error } = useModuleDependencyGraph(module?.id || 0);

  if (!module) return null;

  const hasCriticalPath = dependencyGraph && dependencyGraph.critical_path && dependencyGraph.critical_path.length > 0;
  const hasDependentModules = dependencyGraph && dependencyGraph.dependent_modules && dependencyGraph.dependent_modules.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5">Graphe de Dépendances</Typography>
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
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Ce graphe affiche tous les prérequis du module (chemin critique) et les modules qui dépendent de celui-ci.
          </Typography>
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : dependencyGraph ? (
          <Box>
            {/* Critical Path (Prerequisites) */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-arrow-up-line" />
                Prérequis (Chemin Critique)
              </Typography>
              {!hasCriticalPath ? (
                <Alert severity="info">Ce module n'a aucun prérequis défini.</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dependencyGraph.critical_path.map((prereq, index) => (
                    <Box key={prereq.id}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderLeft: 4,
                          borderColor: index === 0 ? 'error.main' : 'warning.main',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {prereq.code}
                          </Typography>
                          <Chip label={prereq.level} size="small" color="primary" />
                          <Chip label={prereq.semester} size="small" color="secondary" />
                          {index === 0 && (
                            <Chip label="Prérequis Direct" size="small" color="error" variant="outlined" />
                          )}
                          {index > 0 && (
                            <Chip label={`Niveau ${index + 1}`} size="small" color="warning" variant="outlined" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {prereq.name}
                        </Typography>
                        {index > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            ↑ Prérequis indirect (prérequis du prérequis)
                          </Typography>
                        )}
                      </Paper>
                      {index < dependencyGraph.critical_path.length - 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                          <i className="ri-arrow-up-line" style={{ fontSize: '24px', color: '#999' }} />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Dependent Modules */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-arrow-down-line" />
                Modules Dépendants
              </Typography>
              {!hasDependentModules ? (
                <Alert severity="info">Aucun module ne dépend de celui-ci.</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dependencyGraph.dependent_modules.map((dependent) => (
                    <Paper
                      key={dependent.id}
                      elevation={2}
                      sx={{
                        p: 2,
                        borderLeft: 4,
                        borderColor: 'success.main',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {dependent.code}
                        </Typography>
                        <Chip label={dependent.level} size="small" color="primary" />
                        <Chip label={dependent.semester} size="small" color="secondary" />
                        <Chip label="Dépend de ce module" size="small" color="success" variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {dependent.name}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleDependencyGraphDialog;
