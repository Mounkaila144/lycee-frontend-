'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Slider from '@mui/material/Slider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import type { GenerationStrategy } from '../../types';
import { STRATEGY_LABELS, DAYS, TIME_SLOTS, SESSION_TYPE_COLORS } from '../../types';

const PHASES = ['Analyse', 'Génération', 'Optimisation', 'Vérification'];

const DEMO_GROUPS = [
  { id: 1, name: 'L3 Info - G1' },
  { id: 2, name: 'L3 Info - G2' },
  { id: 3, name: 'M1 Info - G1' },
];

interface DemoGeneratedSlot {
  module: string;
  teacher: string;
  room: string;
  day: string;
  time: string;
  type: string;
}

const DEMO_GENERATED: DemoGeneratedSlot[] = [
  { module: 'Algorithmes', teacher: 'Dr. Dupont', room: 'Amphi A', day: 'Lundi', time: '08:00-10:00', type: 'CM' },
  { module: 'BDD', teacher: 'Prof. Martin', room: 'TD-101', day: 'Lundi', time: '10:00-12:00', type: 'TD' },
  { module: 'Réseaux', teacher: 'Dr. Bernard', room: 'Labo Info-1', day: 'Mardi', time: '08:00-10:00', type: 'TP' },
  { module: 'SE', teacher: 'Prof. Petit', room: 'Amphi A', day: 'Mardi', time: '14:00-16:00', type: 'CM' },
  { module: 'Web', teacher: 'Dr. Dupont', room: 'Labo Info-1', day: 'Mercredi', time: '10:00-12:00', type: 'TP' },
  { module: 'Maths', teacher: 'Prof. Martin', room: 'Amphi A', day: 'Mercredi', time: '14:00-16:00', type: 'CM' },
  { module: 'Algo TD', teacher: 'Dr. Dupont', room: 'TD-101', day: 'Jeudi', time: '08:00-10:00', type: 'TD' },
  { module: 'BDD TP', teacher: 'Prof. Martin', room: 'Labo Info-2', day: 'Jeudi', time: '14:00-16:00', type: 'TP' },
  { module: 'Réseaux TD', teacher: 'Dr. Bernard', room: 'TD-102', day: 'Vendredi', time: '10:00-12:00', type: 'TD' },
  { module: 'SE TD', teacher: 'Prof. Petit', room: 'TD-101', day: 'Vendredi', time: '14:00-16:00', type: 'TD' },
  { module: 'Web TD', teacher: 'Dr. Dupont', room: 'TD-102', day: 'Samedi', time: '08:00-10:00', type: 'TD' },
  { module: 'Maths TD', teacher: 'Prof. Martin', room: 'TD-101', day: 'Samedi', time: '10:00-12:00', type: 'TD' },
];

// ──── Quality Score Circle ────

const QualityScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={score} size={120} thickness={5} sx={{ color }} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color }}>{score}</Typography>
        <Typography variant="caption" color="text.secondary">/100</Typography>
      </Box>
    </Box>
  );
};

// ──── Main ────

export const OptimizationDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [strategy, setStrategy] = useState<GenerationStrategy>('balanced');
  const [groupId, setGroupId] = useState<number>(1);
  const [maxHoursTeacher, setMaxHoursTeacher] = useState(6);
  const [maxConsecutiveStudents, setMaxConsecutiveStudents] = useState(6);
  const [respectPreferences, setRespectPreferences] = useState(true);
  const [minimizeRoomChanges, setMinimizeRoomChanges] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const simulateGeneration = useCallback(() => {
    setIsGenerating(true);
    setIsComplete(false);
    setIsFailed(false);
    setCurrentPhase(0);
    setProgress(0);

    let phase = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          phase++;
          if (phase >= 4) {
            clearInterval(interval);
            setIsGenerating(false);
            setIsComplete(true);

            return 100;
          }

          setCurrentPhase(phase);

          return 0;
        }

        return prev + 10;
      });
    }, 300);
  }, []);

  const handleAccept = () => {
    setIsComplete(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Optimisation Automatique</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Optimisation Automatique</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>👥</span>} onClick={() => router.push(`/${lang}/admin/timetable/group-view`)}>
            EDT Groupe
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Configuration */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Configuration</Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Semestre</InputLabel>
                <Select value={1} label="Semestre">
                  <MenuItem value={1}>S1 2024-2025</MenuItem>
                  <MenuItem value={2}>S2 2024-2025</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>Groupe</InputLabel>
                <Select value={groupId} label="Groupe" onChange={(e) => setGroupId(e.target.value as number)}>
                  {DEMO_GROUPS.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" gutterBottom>Stratégie de génération</Typography>
              <RadioGroup value={strategy} onChange={(e) => setStrategy(e.target.value as GenerationStrategy)}>
                {(Object.entries(STRATEGY_LABELS) as [GenerationStrategy, { label: string; description: string }][]).map(([key, val]) => (
                  <Paper key={key} variant="outlined" sx={{ p: 1.5, mb: 1, cursor: 'pointer', border: strategy === key ? '2px solid' : undefined, borderColor: strategy === key ? 'primary.main' : undefined }}>
                    <FormControlLabel
                      value={key}
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="subtitle2">{val.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{val.description}</Typography>
                        </Box>
                      }
                    />
                  </Paper>
                ))}
              </RadioGroup>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>Contraintes dures (obligatoires)</Typography>
              <Box sx={{ pl: 1, mb: 2 }}>
                <Typography variant="body2" color="success.main">&#10003; Aucun conflit enseignant/salle/groupe</Typography>
                <Typography variant="body2" color="success.main">&#10003; Respect capacités salles</Typography>
                <Typography variant="body2" color="success.main">&#10003; Enseignants habilités uniquement</Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>Contraintes souples</Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" gutterBottom>Max heures/jour enseignant: {maxHoursTeacher}h</Typography>
                <Slider value={maxHoursTeacher} onChange={(_, v) => setMaxHoursTeacher(v as number)} min={2} max={8} step={1} size="small" sx={{ mb: 1 }} />

                <Typography variant="body2" gutterBottom>Max heures consécutives étudiants: {maxConsecutiveStudents}h</Typography>
                <Slider value={maxConsecutiveStudents} onChange={(_, v) => setMaxConsecutiveStudents(v as number)} min={2} max={8} step={1} size="small" sx={{ mb: 1 }} />

                <FormControlLabel control={<Checkbox size="small" checked={respectPreferences} onChange={(e) => setRespectPreferences(e.target.checked)} />} label={<Typography variant="body2">Respecter préférences enseignants</Typography>} />
                <FormControlLabel control={<Checkbox size="small" checked={minimizeRoomChanges} onChange={(e) => setMinimizeRoomChanges(e.target.checked)} />} label={<Typography variant="body2">Minimiser changements de salle</Typography>} />
              </Box>

              <Button variant="contained" fullWidth size="large" sx={{ mt: 3 }} onClick={simulateGeneration} disabled={isGenerating}>
                {isGenerating ? 'Génération en cours...' : 'Générer l\'emploi du temps'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Results */}
        <Grid item xs={12} md={7}>
          {/* Generating state */}
          {isGenerating && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Génération en cours...</Typography>
                <Stepper activeStep={currentPhase} sx={{ mb: 3 }}>
                  {PHASES.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                  ))}
                </Stepper>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Phase: {PHASES[currentPhase]} ({progress}%)
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Complete state */}
          {isComplete && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <QualityScoreCircle score={87} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">Résultat de la génération</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="bold">&#10003; Contraintes dures respectées</Typography>
                      <Typography variant="body2" color="text.secondary">Contraintes souples violées: 2</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption">Sessions générées: <strong>12</strong></Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption">Enseignants: <strong>4</strong></Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption">Salles utilisées: <strong>6</strong></Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption">Trous détectés: <strong>2</strong></Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption">Préférences: <strong>8/10</strong></Typography></Grid>
                      </Grid>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Generated sessions preview */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Emploi du temps généré</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {DEMO_GENERATED.map((s, i) => (
                      <Chip
                        key={i}
                        label={`${s.day.slice(0, 3)} ${s.time} ${s.module}`}
                        size="small"
                        sx={{ bgcolor: SESSION_TYPE_COLORS[s.type as keyof typeof SESSION_TYPE_COLORS] || '#999', color: '#fff' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="success" onClick={handleAccept} fullWidth>Accepter</Button>
                <Button variant="outlined" onClick={simulateGeneration} fullWidth>Régénérer</Button>
                <Button variant="outlined" color="error" onClick={() => setIsComplete(false)} fullWidth>Annuler</Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                <Button size="small" variant="text" startIcon={<span>👥</span>} onClick={() => router.push(`/${lang}/admin/timetable/group-view`)}>
                  Consulter l'EDT Groupe
                </Button>
                <Button size="small" variant="text" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
                  Retour à la Planification
                </Button>
              </Box>
            </Box>
          )}

          {/* Idle state */}
          {!isGenerating && !isComplete && !isFailed && (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ mb: 2, opacity: 0.3 }}>🤖</Typography>
                <Typography variant="h6" color="text.secondary">Configurez les paramètres et lancez la génération</Typography>
                <Typography variant="body2" color="text.disabled">L'algorithme CSP trouvera la meilleure combinaison possible</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
