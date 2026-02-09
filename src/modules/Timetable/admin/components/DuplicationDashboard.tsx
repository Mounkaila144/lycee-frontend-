'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

import type { DuplicationMode } from '../../types';

const STEPS = ['Source', 'Configuration', 'Prévisualisation', 'Résultat'];

const DEMO_MODULES = [
  { id: 1, name: 'Algorithmes', selected: true },
  { id: 2, name: 'Base de données', selected: true },
  { id: 3, name: 'Réseaux', selected: true },
  { id: 4, name: 'Systèmes d\'exploitation', selected: true },
  { id: 5, name: 'Programmation Web', selected: true },
  { id: 6, name: 'Mathématiques', selected: true },
];

interface DemoSlot {
  id: number;
  module: string;
  day: string;
  time: string;
  type: string;
  teacher: string;
  room: string;
  status: 'ok' | 'incomplete' | 'conflict';
  issue?: string;
}

const DEMO_DUPLICATED: DemoSlot[] = [
  { id: 1, module: 'Algorithmes', day: 'Lundi', time: '08:00-10:00', type: 'CM', teacher: 'Dr. Dupont', room: 'Amphi A', status: 'ok' },
  { id: 2, module: 'BDD', day: 'Lundi', time: '10:00-12:00', type: 'TD', teacher: 'Prof. Martin', room: 'TD-101', status: 'ok' },
  { id: 3, module: 'Réseaux', day: 'Mardi', time: '08:00-10:00', type: 'TP', teacher: 'Dr. Bernard', room: 'Labo Info-1', status: 'ok' },
  { id: 4, module: 'SE', day: 'Mardi', time: '14:00-16:00', type: 'CM', teacher: 'Prof. Petit', room: 'Amphi A', status: 'ok' },
  { id: 5, module: 'Web', day: 'Mercredi', time: '10:00-12:00', type: 'TP', teacher: '-', room: 'Labo Info-1', status: 'incomplete', issue: 'Enseignant non réaffecté' },
  { id: 6, module: 'Maths', day: 'Mercredi', time: '14:00-16:00', type: 'CM', teacher: 'Prof. Martin', room: '-', status: 'incomplete', issue: 'Salle indisponible' },
  { id: 7, module: 'Algo TD', day: 'Jeudi', time: '08:00-10:00', type: 'TD', teacher: 'Dr. Dupont', room: 'TD-101', status: 'ok' },
  { id: 8, module: 'BDD TP', day: 'Jeudi', time: '14:00-16:00', type: 'TP', teacher: 'Prof. Martin', room: 'Labo Info-2', status: 'conflict', issue: 'Conflit salle avec M1 Info' },
];

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  ok: { label: 'OK', color: 'success' },
  incomplete: { label: 'À compléter', color: 'warning' },
  conflict: { label: 'Conflit', color: 'error' },
};

export const DuplicationDashboard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [sourceSchedule, setSourceSchedule] = useState(1);
  const [targetSemester, setTargetSemester] = useState(2);
  const [targetGroup, setTargetGroup] = useState(1);
  const [mode, setMode] = useState<DuplicationMode>('full');
  const [duplicateRooms, setDuplicateRooms] = useState(true);
  const [selectedModules, setSelectedModules] = useState<Record<number, boolean>>(
    Object.fromEntries(DEMO_MODULES.map((m) => [m.id, true])),
  );

  const toggleModule = (id: number) => {
    setSelectedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = Object.values(selectedModules).filter(Boolean).length;
  const okCount = DEMO_DUPLICATED.filter((s) => s.status === 'ok').length;
  const incompleteCount = DEMO_DUPLICATED.filter((s) => s.status === 'incomplete').length;
  const conflictCount = DEMO_DUPLICATED.filter((s) => s.status === 'conflict').length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Duplication Semestre</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" gutterBottom>Duplication d'Emploi du Temps</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* Step 0: Source Selection */}
      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Sélection de la source</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semestre source</InputLabel>
                  <Select value={sourceSchedule} label="Semestre source" onChange={(e) => setSourceSchedule(e.target.value as number)}>
                    <MenuItem value={1}>S1 2024-2025 (L3 Info G1)</MenuItem>
                    <MenuItem value={2}>S1 2024-2025 (L3 Info G2)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semestre cible</InputLabel>
                  <Select value={targetSemester} label="Semestre cible" onChange={(e) => setTargetSemester(e.target.value as number)}>
                    <MenuItem value={2}>S2 2024-2025</MenuItem>
                    <MenuItem value={3}>S1 2025-2026</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Groupe cible</InputLabel>
                  <Select value={targetGroup} label="Groupe cible" onChange={(e) => setTargetGroup(e.target.value as number)}>
                    <MenuItem value={1}>L3 Info - G1</MenuItem>
                    <MenuItem value={2}>L3 Info - G2</MenuItem>
                    <MenuItem value={3}>M1 Info - G1</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Card variant="outlined" sx={{ mt: 3, bgcolor: 'action.hover' }}>
              <CardContent>
                <Typography variant="subtitle2">Aperçu source</Typography>
                <Typography variant="body2">9 séances | 4 enseignants | 4 salles | 6 modules</Typography>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" onClick={() => setActiveStep(1)}>Suivant</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Configuration */}
      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Configuration de la duplication</Typography>

            <Typography variant="subtitle2" gutterBottom>Mode de duplication</Typography>
            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as DuplicationMode)} sx={{ mb: 2 }}>
              <FormControlLabel value="full" control={<Radio />} label={<Box><Typography variant="body2" fontWeight="bold">Mode complet</Typography><Typography variant="caption" color="text.secondary">Dupliquer tous les attributs (enseignants, salles)</Typography></Box>} />
              <FormControlLabel value="structure" control={<Radio />} label={<Box><Typography variant="body2" fontWeight="bold">Mode structure</Typography><Typography variant="caption" color="text.secondary">Dupliquer uniquement jour/heure/module (enseignant/salle à réaffecter)</Typography></Box>} />
            </RadioGroup>

            <FormControlLabel control={<Checkbox checked={duplicateRooms} onChange={(e) => setDuplicateRooms(e.target.checked)} />} label="Dupliquer les affectations de salles" sx={{ mb: 2, display: 'block' }} />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Modules à dupliquer ({selectedCount}/{DEMO_MODULES.length})</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              {DEMO_MODULES.map((m) => (
                <FormControlLabel key={m.id} control={<Checkbox size="small" checked={!!selectedModules[m.id]} onChange={() => toggleModule(m.id)} />} label={<Typography variant="body2">{m.name}</Typography>} sx={{ width: '48%' }} />
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setActiveStep(0)}>Précédent</Button>
              <Button variant="contained" onClick={() => setActiveStep(2)}>Suivant</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {activeStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Prévisualisation</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              {DEMO_DUPLICATED.length} séances seront dupliquées. Mode: {mode === 'full' ? 'Complet' : 'Structure'}.
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Module</TableCell>
                    <TableCell>Jour</TableCell>
                    <TableCell>Heure</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Enseignant</TableCell>
                    <TableCell>Salle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_DUPLICATED.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.module}</TableCell>
                      <TableCell>{s.day}</TableCell>
                      <TableCell>{s.time}</TableCell>
                      <TableCell><Chip label={s.type} size="small" /></TableCell>
                      <TableCell>{mode === 'structure' ? <Typography color="warning.main" variant="body2">À réaffecter</Typography> : s.teacher}</TableCell>
                      <TableCell>{mode === 'structure' || !duplicateRooms ? <Typography color="warning.main" variant="body2">À réaffecter</Typography> : s.room}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setActiveStep(1)}>Précédent</Button>
              <Button variant="contained" onClick={() => setActiveStep(3)}>Dupliquer</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Result */}
      {activeStep === 3 && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">{okCount}</Typography>
                <Typography variant="caption">Dupliquées avec succès</Typography>
              </CardContent></Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">{incompleteCount}</Typography>
                <Typography variant="caption">Enseignants manquants</Typography>
              </CardContent></Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">{incompleteCount}</Typography>
                <Typography variant="caption">Salles manquantes</Typography>
              </CardContent></Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">{conflictCount}</Typography>
                <Typography variant="caption">Conflits</Typography>
              </CardContent></Card>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  <TableCell>Jour</TableCell>
                  <TableCell>Heure</TableCell>
                  <TableCell>Enseignant</TableCell>
                  <TableCell>Salle</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_DUPLICATED.map((s) => {
                  const st = STATUS_CHIP[s.status];

                  return (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.module}</TableCell>
                      <TableCell>{s.day}</TableCell>
                      <TableCell>{s.time}</TableCell>
                      <TableCell>{s.teacher === '-' ? <Typography color="warning.main" variant="body2">À réaffecter</Typography> : s.teacher}</TableCell>
                      <TableCell>{s.room === '-' ? <Typography color="warning.main" variant="body2">À réaffecter</Typography> : s.room}</TableCell>
                      <TableCell align="center"><Chip label={st.label} size="small" color={st.color} /></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{s.issue || '-'}</Typography></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={() => setActiveStep(0)}>Nouvelle duplication</Button>
            <Button variant="contained" disabled={conflictCount > 0}>
              {conflictCount > 0 ? 'Résoudre les conflits d\'abord' : 'Publier'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
