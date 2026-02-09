'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

import { useProcesVerbal } from '../hooks/useProcesVerbal';
import { SemesterSelector } from './SemesterSelector';

import type { PVType, PVTemplate, PVGenerationLog, PVTemplateFormData } from '../../types/procesVerbal.types';

const PV_TYPE_LABELS: Record<PVType, string> = {
  session1: 'Session 1',
  rattrapage: 'Rattrapage',
  final: 'Final Année',
};

const PV_TYPE_COLORS: Record<PVType, 'primary' | 'warning' | 'success'> = {
  session1: 'primary',
  rattrapage: 'warning',
  final: 'success',
};

interface TemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PVTemplateFormData) => void;
  template?: PVTemplate;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({ open, onClose, onSave, template }) => {
  const [formData, setFormData] = useState<PVTemplateFormData>({
    name: template?.name || '',
    type: template?.type || 'session1',
    institution_name: template?.institution_name || '',
    institution_address: template?.institution_address || '',
    footer_text: template?.footer_text || '',
    is_default: template?.is_default || false,
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {template ? 'Modifier Template PV' : 'Nouveau Template PV'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nom du template"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Type de PV</InputLabel>
            <Select
              value={formData.type}
              label="Type de PV"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PVType })}
            >
              <MenuItem value="session1">Session 1</MenuItem>
              <MenuItem value="rattrapage">Rattrapage</MenuItem>
              <MenuItem value="final">Final Année</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Nom de l'établissement"
            fullWidth
            value={formData.institution_name}
            onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
          />
          <TextField
            label="Adresse de l'établissement"
            fullWidth
            multiline
            rows={2}
            value={formData.institution_address}
            onChange={(e) => setFormData({ ...formData, institution_address: e.target.value })}
          />
          <TextField
            label="Texte de pied de page"
            fullWidth
            multiline
            rows={2}
            value={formData.footer_text}
            onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
            }
            label="Template par défaut"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name || !formData.institution_name}
        >
          {template ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PVDeliberationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PVTemplate | undefined>();
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  const {
    pvLogs,
    templates,
    loading,
    generating,
    filters,
    setFilters,
    generatePV,
    downloadPV,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useProcesVerbal();

  const filteredLogs = pvLogs.filter(log => {
    if (selectedSemesterId && log.session.semester.id !== selectedSemesterId) return false;
    if (filters.type && log.session.type !== filters.type) return false;

    return true;
  });

  const handleSaveTemplate = async (data: PVTemplateFormData) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
    } else {
      await createTemplate(data);
    }

    setEditingTemplate(undefined);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/admin" underline="hover" color="inherit">Admin</Link>
        <Link href="/admin/grades" underline="hover" color="inherit">Notes</Link>
        <Typography color="text.primary">Procès-Verbaux de Délibération</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Procès-Verbaux de Délibération
      </Typography>

      <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Archive PV" />
        <Tab label="Templates" />
      </Tabs>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tab 0: PV Archive */}
      {activeTab === 0 && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <SemesterSelector
                    selectedSemesterId={selectedSemesterId}
                    onSemesterChange={setSelectedSemesterId}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Type de PV</InputLabel>
                    <Select
                      value={filters.type || ''}
                      label="Type de PV"
                      onChange={(e) => setFilters({ ...filters, type: (e.target.value || undefined) as PVType | undefined })}
                    >
                      <MenuItem value=""><em>Tous</em></MenuItem>
                      <MenuItem value="session1">Session 1</MenuItem>
                      <MenuItem value="rattrapage">Rattrapage</MenuItem>
                      <MenuItem value="final">Final Année</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Année académique"
                    placeholder="2024-2025"
                    value={filters.year || ''}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value || undefined })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {pvLogs.length}
                  </Typography>
                  <Typography color="text.secondary">Total PV générés</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {pvLogs.filter(l => l.session.type === 'session1').length}
                  </Typography>
                  <Typography color="text.secondary">PV Session 1</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {pvLogs.filter(l => l.session.type === 'rattrapage').length}
                  </Typography>
                  <Typography color="text.secondary">PV Rattrapage</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* PV Logs Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Archive des PV ({filteredLogs.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Semestre</TableCell>
                      <TableCell>Année Académique</TableCell>
                      <TableCell align="center">Type</TableCell>
                      <TableCell>Filière</TableCell>
                      <TableCell>Généré par</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            Aucun PV trouvé
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log: PVGenerationLog) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            {new Date(log.generated_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>{log.session.semester.name}</TableCell>
                          <TableCell>{log.session.semester.academic_year}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={PV_TYPE_LABELS[log.session.type]}
                              size="small"
                              color={PV_TYPE_COLORS[log.session.type]}
                            />
                          </TableCell>
                          <TableCell>{log.session.program_name || '-'}</TableCell>
                          <TableCell>{log.generated_by_name}</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => downloadPV(log.id, `PV-${log.session.semester.code}-${log.session.type}.pdf`)}
                            >
                              Télécharger
                            </Button>
                            {log.file_url && (
                              <Button
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => window.open(log.file_url, '_blank')}
                              >
                                Voir
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab 1: Templates */}
      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTemplate(undefined);
                setTemplateDialogOpen(true);
              }}
            >
              Nouveau Template
            </Button>
          </Box>

          <Grid container spacing={2}>
            {templates.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                      Aucun template configuré
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Créez un template pour générer des PV de délibération
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              templates.map((template) => (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{template.name}</Typography>
                        {template.is_default && (
                          <Chip label="Par défaut" size="small" color="primary" />
                        )}
                      </Box>
                      <Chip
                        label={PV_TYPE_LABELS[template.type]}
                        size="small"
                        color={PV_TYPE_COLORS[template.type]}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {template.institution_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.institution_address}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setEditingTemplate(template);
                            setTemplateDialogOpen(true);
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          Supprimer
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <TemplateDialog
            open={templateDialogOpen}
            onClose={() => {
              setTemplateDialogOpen(false);
              setEditingTemplate(undefined);
            }}
            onSave={handleSaveTemplate}
            template={editingTemplate}
          />
        </>
      )}
    </Box>
  );
};
