'use client';

import React, { useState, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import type { CoefficientTemplate } from '../../types/coefficient.types';

/**
 * Props for CoefficientTemplatesDialog
 */
interface CoefficientTemplatesDialogProps {
  open: boolean;
  templates: CoefficientTemplate[];
  loading: boolean;
  saving: boolean;
  hasGrades: boolean;
  onClose: () => void;
  onApply: (templateId: number) => Promise<boolean>;
}

/**
 * CoefficientTemplatesDialog Component
 * Dialog for selecting and applying coefficient templates
 */
export const CoefficientTemplatesDialog: React.FC<CoefficientTemplatesDialogProps> = ({
  open,
  templates,
  loading,
  saving,
  hasGrades,
  onClose,
  onApply,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);

  /**
   * Handle template selection
   */
  const handleSelect = useCallback((templateId: number) => {
    setSelectedTemplate(templateId);
  }, []);

  /**
   * Handle apply click
   */
  const handleApplyClick = useCallback(() => {
    if (selectedTemplate) {
      setConfirmDialog(true);
    }
  }, [selectedTemplate]);

  /**
   * Handle confirm apply
   */
  const handleConfirmApply = useCallback(async () => {
    if (selectedTemplate) {
      const success = await onApply(selectedTemplate);

      if (success) {
        setConfirmDialog(false);
        setSelectedTemplate(null);
        onClose();
      }
    }
  }, [selectedTemplate, onApply, onClose]);

  /**
   * Get total coefficient from template
   */
  const getTotalCoefficient = (template: CoefficientTemplate): number => {
    return template.evaluations.reduce((sum, ev) => sum + ev.coefficient, 0);
  };

  /**
   * Separate system and custom templates
   */
  const systemTemplates = templates.filter((t) => t.is_system);
  const customTemplates = templates.filter((t) => !t.is_system);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <i className="ri-file-copy-line" />
            Templates de coefficients
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Warning if has grades */}
          {hasGrades && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Attention:</strong> Ce module contient déjà des notes. L'application d'un template
                supprimera les évaluations existantes et n'est pas autorisée.
              </Typography>
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : templates.length === 0 ? (
            <Alert severity="info">
              Aucun template de coefficients disponible.
            </Alert>
          ) : (
            <>
              {/* System templates */}
              {systemTemplates.length > 0 && (
                <Box mb={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Templates prédéfinis
                  </Typography>
                  <Grid container spacing={2}>
                    {systemTemplates.map((template) => (
                      <Grid item xs={12} sm={6} key={template.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: hasGrades ? 'not-allowed' : 'pointer',
                            opacity: hasGrades ? 0.5 : 1,
                            borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                            borderWidth: selectedTemplate === template.id ? 2 : 1,
                            backgroundColor: selectedTemplate === template.id ? 'action.selected' : 'background.paper',
                          }}
                          onClick={() => !hasGrades && handleSelect(template.id)}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {template.name}
                              </Typography>
                              <Chip label="Système" size="small" color="info" variant="outlined" />
                            </Box>
                            {template.description && (
                              <Typography variant="body2" color="text.secondary" mb={2}>
                                {template.description}
                              </Typography>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {template.evaluations.map((ev, index) => (
                                <Chip
                                  key={index}
                                  label={`${ev.type}: ${ev.coefficient}`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                            <Typography variant="body2" color="primary" fontWeight="bold" mt={1}>
                              Total: {getTotalCoefficient(template)}
                            </Typography>
                          </CardContent>
                          {selectedTemplate === template.id && (
                            <CardActions>
                              <Chip label="Sélectionné" color="primary" size="small" />
                            </CardActions>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Custom templates */}
              {customTemplates.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Templates personnalisés
                  </Typography>
                  <Grid container spacing={2}>
                    {customTemplates.map((template) => (
                      <Grid item xs={12} sm={6} key={template.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: hasGrades ? 'not-allowed' : 'pointer',
                            opacity: hasGrades ? 0.5 : 1,
                            borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                            borderWidth: selectedTemplate === template.id ? 2 : 1,
                            backgroundColor: selectedTemplate === template.id ? 'action.selected' : 'background.paper',
                          }}
                          onClick={() => !hasGrades && handleSelect(template.id)}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {template.name}
                              </Typography>
                              <Chip label="Personnalisé" size="small" color="secondary" variant="outlined" />
                            </Box>
                            {template.description && (
                              <Typography variant="body2" color="text.secondary" mb={2}>
                                {template.description}
                              </Typography>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {template.evaluations.map((ev, index) => (
                                <Chip
                                  key={index}
                                  label={`${ev.type}: ${ev.coefficient}`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                            <Typography variant="body2" color="primary" fontWeight="bold" mt={1}>
                              Total: {getTotalCoefficient(template)}
                            </Typography>
                          </CardContent>
                          {selectedTemplate === template.id && (
                            <CardActions>
                              <Chip label="Sélectionné" color="primary" size="small" />
                            </CardActions>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyClick}
            disabled={!selectedTemplate || hasGrades || saving}
            startIcon={saving ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
          >
            Appliquer le template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="xs">
        <DialogTitle>Confirmer l'application</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Cette action va remplacer toutes les évaluations existantes du module par celles du template sélectionné.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Êtes-vous sûr de vouloir continuer ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmApply}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
          >
            {saving ? 'Application...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
