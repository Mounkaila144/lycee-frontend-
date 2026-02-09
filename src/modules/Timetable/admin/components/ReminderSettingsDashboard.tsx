'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormGroup from '@mui/material/FormGroup';

import type { WeeklySummary, WeeklySummaryDay, ReminderPreferences } from '../../types';
import { SESSION_TYPE_COLORS } from '../../types';

// ──── Demo Data ────

const DEMO_GROUPS = [
  { id: 1, name: 'L3 Informatique - G1' },
  { id: 2, name: 'L3 Informatique - G2' },
  { id: 3, name: 'M1 Réseaux - G1' },
];

const DEMO_PREFERENCES: ReminderPreferences = {
  enabled: true,
  timings: ['1h', '15min'],
  channels: { push: true, email: true, sms: false },
  do_not_disturb: { enabled: true, start_time: '22:00', end_time: '07:00' },
  weekly_summary: true,
  daily_summary: false,
};

const TIMING_OPTIONS: { value: ReminderPreferences['timings'][number]; label: string }[] = [
  { value: '15min', label: '15 minutes avant' },
  { value: '30min', label: '30 minutes avant' },
  { value: '1h', label: '1 heure avant' },
  { value: '2h', label: '2 heures avant' },
  { value: '24h', label: '24 heures avant' },
];

const DEMO_WEEKLY_SUMMARY: WeeklySummary = {
  week_label: 'Semaine du 10 au 14 Février 2025',
  days: [
    {
      day: 'Lundi', date: '2025-02-10', total_hours: 6,
      slots: [
        { module: 'Algorithmes', type: 'CM', start_time: '08:00', end_time: '10:00', room: 'Amphi A', teacher: 'Dr. Dupont', has_exception: false },
        { module: 'Base de Données', type: 'TD', start_time: '10:00', end_time: '12:00', room: 'Salle TD-101', teacher: 'Prof. Martin', has_exception: false },
        { module: 'Programmation Web', type: 'TP', start_time: '14:00', end_time: '16:00', room: 'Labo Info-1', teacher: 'Dr. Dupont', has_exception: false },
      ],
    },
    {
      day: 'Mardi', date: '2025-02-11', total_hours: 4,
      slots: [
        { module: 'Réseaux', type: 'TP', start_time: '08:00', end_time: '10:00', room: 'Salle TD-102', teacher: 'Dr. Bernard', has_exception: true, exception_type: 'room_change' },
        { module: 'Systèmes d\'exploitation', type: 'CM', start_time: '14:00', end_time: '16:00', room: 'Amphi A', teacher: 'Dr. Leroy', has_exception: true, exception_type: 'teacher_replacement' },
      ],
    },
    {
      day: 'Mercredi', date: '2025-02-12', total_hours: 4,
      slots: [
        { module: 'Programmation Web', type: 'CM', start_time: '10:00', end_time: '12:00', room: 'Amphi B', teacher: 'Dr. Dupont', has_exception: false },
        { module: 'Intelligence Artificielle', type: 'TD', start_time: '14:00', end_time: '16:00', room: 'Salle TD-201', teacher: 'Prof. Moreau', has_exception: false },
      ],
    },
    {
      day: 'Jeudi', date: '2025-02-13', total_hours: 6,
      slots: [
        { module: 'Algorithmes', type: 'TD', start_time: '08:00', end_time: '10:00', room: 'Salle TD-101', teacher: 'Dr. Dupont', has_exception: false },
        { module: 'Base de Données', type: 'TP', start_time: '10:00', end_time: '12:00', room: 'Labo Info-2', teacher: 'Prof. Martin', has_exception: false },
        { module: 'Réseaux', type: 'CM', start_time: '14:00', end_time: '16:00', room: 'Amphi A', teacher: 'Dr. Bernard', has_exception: false },
      ],
    },
    {
      day: 'Vendredi', date: '2025-02-14', total_hours: 4,
      slots: [
        { module: 'Systèmes d\'exploitation', type: 'TD', start_time: '08:00', end_time: '10:00', room: 'Salle TD-102', teacher: 'Prof. Petit', has_exception: false },
        { module: 'Intelligence Artificielle', type: 'TP', start_time: '10:00', end_time: '12:00', room: 'Labo Info-1', teacher: 'Prof. Moreau', has_exception: false },
      ],
    },
  ],
  total_hours: 24,
  total_sessions: 12,
  exceptions_count: 2,
};

// ──── Main Component ────

export const ReminderSettingsDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  // Reminder preferences state
  const [preferences, setPreferences] = useState<ReminderPreferences>(DEMO_PREFERENCES);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto summaries
  const [dailySummary, setDailySummary] = useState(DEMO_PREFERENCES.daily_summary);
  const [weeklySummary, setWeeklySummary] = useState(DEMO_PREFERENCES.weekly_summary);

  // Manual reminder state
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [manualMessage, setManualMessage] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Weekly summary data
  const [summary] = useState<WeeklySummary>(DEMO_WEEKLY_SUMMARY);

  const handleTimingToggle = (timing: ReminderPreferences['timings'][number]) => {
    setPreferences((prev) => ({
      ...prev,
      timings: prev.timings.includes(timing)
        ? prev.timings.filter((t) => t !== timing)
        : [...prev.timings, timing],
    }));
  };

  const handleChannelToggle = (channel: 'push' | 'email' | 'sms') => {
    setPreferences((prev) => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel] },
    }));
  };

  const handleDndToggle = () => {
    setPreferences((prev) => ({
      ...prev,
      do_not_disturb: { ...prev.do_not_disturb, enabled: !prev.do_not_disturb.enabled },
    }));
  };

  const handleDndTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      do_not_disturb: { ...prev.do_not_disturb, [field]: value },
    }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendManualReminder = () => {
    setSendSuccess(true);
    setManualMessage('');
    setSelectedGroup(0);
    setTimeout(() => setSendSuccess(false), 4000);
  };

  const getTimingLabel = (): string => {
    const labels: Record<string, string> = { '15min': '15 min', '30min': '30 min', '1h': '1h', '2h': '2h', '24h': '24h' };

    return preferences.timings.map((t) => labels[t] || t).join(', ');
  };

  const getExceptionChip = (slot: WeeklySummaryDay['slots'][number]) => {
    if (!slot.has_exception) return null;

    const config: Record<string, { label: string; color: string }> = {
      room_change: { label: 'Salle modifiee', color: '#ff9800' },
      teacher_replacement: { label: 'Remplacement', color: '#9c27b0' },
      cancellation: { label: 'Annule', color: '#f44336' },
      time_change: { label: 'Horaire modifie', color: '#2196f3' },
    };

    const c = config[slot.exception_type || ''] || { label: 'Modification', color: '#607d8b' };

    return <Chip label={c.label} size="small" sx={{ ml: 1, bgcolor: c.color, color: '#fff', height: 20, fontSize: '0.7rem' }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Rappels et Notifications</Typography>
      </Breadcrumbs>

      {/* Title + Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Rappels de Cours</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>&#128197;</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>&#128276;</span>} onClick={() => router.push(`/${lang}/admin/timetable/notifications`)}>
            Notifications
          </Button>
        </Box>
      </Box>

      {/* Two-column layout */}
      <Grid container spacing={3}>
        {/* ──── LEFT COLUMN: Settings ──── */}
        <Grid item xs={12} md={6}>
          {/* Reminder Settings Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Parametres des rappels</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enabled}
                      onChange={() => setPreferences((prev) => ({ ...prev, enabled: !prev.enabled }))}
                      color="primary"
                    />
                  }
                  label="Activer les rappels"
                  labelPlacement="start"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Timing Selection */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Quand me rappeler
              </Typography>
              <FormGroup sx={{ mb: 2 }}>
                {TIMING_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={preferences.timings.includes(option.value)}
                        onChange={() => handleTimingToggle(option.value)}
                        disabled={!preferences.enabled}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{option.label}</Typography>}
                  />
                ))}
              </FormGroup>

              <Divider sx={{ mb: 2 }} />

              {/* Channel Preferences */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Canaux de notification
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Notifications Push</Typography>
                    <Typography variant="caption" color="text.secondary">Notifications sur votre appareil mobile et navigateur</Typography>
                  </Box>
                  <Switch checked={preferences.channels.push} onChange={() => handleChannelToggle('push')} disabled={!preferences.enabled} size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Email</Typography>
                    <Typography variant="caption" color="text.secondary">Rappels envoyes par email avant chaque cours</Typography>
                  </Box>
                  <Switch checked={preferences.channels.email} onChange={() => handleChannelToggle('email')} disabled={!preferences.enabled} size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>SMS</Typography>
                    <Typography variant="caption" color="text.secondary">Rappels par SMS (limite a 3 par jour)</Typography>
                  </Box>
                  <Switch checked={preferences.channels.sms} onChange={() => handleChannelToggle('sms')} disabled={!preferences.enabled} size="small" />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Do Not Disturb */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Ne pas deranger
              </Typography>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={preferences.do_not_disturb.enabled} onChange={handleDndToggle} disabled={!preferences.enabled} size="small" />}
                  label={<Typography variant="body2">Activer le mode Ne pas deranger</Typography>}
                />
                {preferences.do_not_disturb.enabled && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <TextField
                      size="small"
                      label="Debut"
                      type="time"
                      value={preferences.do_not_disturb.start_time}
                      onChange={(e) => handleDndTimeChange('start_time', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      disabled={!preferences.enabled}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      label="Fin"
                      type="time"
                      value={preferences.do_not_disturb.end_time}
                      onChange={(e) => handleDndTimeChange('end_time', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      disabled={!preferences.enabled}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                )}
              </Box>

              {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Parametres enregistres avec succes !</Alert>}

              <Button variant="contained" fullWidth onClick={handleSave} disabled={!preferences.enabled}>
                Enregistrer les parametres
              </Button>
            </CardContent>
          </Card>

          {/* Auto Summaries Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Resumes automatiques</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>Resume quotidien</Typography>
                  <Typography variant="caption" color="text.secondary">Email a 20h avec les cours du lendemain</Typography>
                </Box>
                <Switch checked={dailySummary} onChange={() => setDailySummary(!dailySummary)} size="small" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>Resume hebdomadaire</Typography>
                  <Typography variant="caption" color="text.secondary">Email dimanche 18h avec les cours de la semaine</Typography>
                </Box>
                <Switch checked={weeklySummary} onChange={() => setWeeklySummary(!weeklySummary)} size="small" />
              </Box>
            </CardContent>
          </Card>

          {/* Manual Reminder Card (admin) */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Rappel manuel</Typography>
                <Chip label="Admin" size="small" color="error" />
              </Box>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Groupe cible</InputLabel>
                <Select value={selectedGroup} label="Groupe cible" onChange={(e) => setSelectedGroup(e.target.value as number)}>
                  <MenuItem value={0} disabled>Selectionner un groupe</MenuItem>
                  {DEMO_GROUPS.map((g) => (
                    <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Message du rappel"
                multiline
                rows={3}
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                placeholder="Ex: N'oubliez pas le cours de rattrapage demain a 14h..."
                sx={{ mb: 2 }}
              />

              {sendSuccess && <Alert severity="success" sx={{ mb: 2 }}>Rappel envoye avec succes a {DEMO_GROUPS.find((g) => g.id === selectedGroup)?.name || 'tous les etudiants'} !</Alert>}

              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={handleSendManualReminder}
                disabled={!selectedGroup || !manualMessage.trim()}
              >
                Envoyer le rappel
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ──── RIGHT COLUMN: Previews ──── */}
        <Grid item xs={12} md={6}>
          {/* Reminder Preview Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Apercu du rappel</Typography>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: SESSION_TYPE_COLORS.CM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>CM</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Algorithmes Avances</Typography>
                    <Typography variant="caption" color="text.secondary">Dr. Dupont</Typography>
                  </Box>
                  <Chip label={getTimingLabel()} size="small" color="primary" variant="outlined" />
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>Horaire:</Typography>
                    <Typography variant="body2" fontWeight={500}>08:00 - 10:00</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>Salle:</Typography>
                    <Typography variant="body2" fontWeight={500}>Amphi A</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>Batiment:</Typography>
                    <Typography variant="body2" fontWeight={500}>Bloc Sciences - RDC</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Alert severity="info" sx={{ py: 0.5, fontSize: '0.75rem' }}>
                  Votre cours commence dans {preferences.timings.includes('1h') ? '1 heure' : preferences.timings[0] || '15 min'}. Pensez a preparer vos affaires.
                </Alert>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                Cet apercu montre a quoi ressemblera la notification push envoyee aux etudiants.
                Les rappels sont envoyes selon les creneaux selectionnes ({getTimingLabel()}).
              </Typography>
            </CardContent>
          </Card>

          {/* Weekly Summary Card */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Resume hebdomadaire</Typography>
                {summary.exceptions_count > 0 && (
                  <Chip label={`${summary.exceptions_count} modification(s)`} size="small" color="warning" />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {summary.week_label}
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Jour</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Seances</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.days.map((day: WeeklySummaryDay) => (
                      <TableRow key={day.day} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{day.day}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`${day.slots.length}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {day.slots.map((slot, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: idx < day.slots.length - 1 ? 0.5 : 0 }}>
                              <Chip
                                label={slot.type}
                                size="small"
                                sx={{
                                  bgcolor: SESSION_TYPE_COLORS[slot.type as keyof typeof SESSION_TYPE_COLORS] || '#607d8b',
                                  color: '#fff',
                                  mr: 1,
                                  height: 20,
                                  fontSize: '0.7rem',
                                  minWidth: 30,
                                }}
                              />
                              <Typography variant="caption">
                                {slot.start_time}-{slot.end_time} {slot.module} ({slot.room})
                              </Typography>
                              {getExceptionChip(slot)}
                            </Box>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="center">
                        <Chip label={`${summary.total_sessions} seances`} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{summary.total_hours} heures</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                Ce resume est envoye chaque dimanche a 18h si le resume hebdomadaire est active.
                Les sessions modifiees sont signalees par un badge de couleur.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
