'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';

import type {
  TimetableNotification,
  NotificationPreferences,
  NotificationFrequency,
} from '../../types';
import { NOTIFICATION_PRIORITY_CONFIG, NOTIFICATION_TYPE_CONFIG } from '../../types';

// ──── Relative Time Helper ────

const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

// ──── Demo Data ────

const now = new Date();

const makeDate = (hoursAgo: number): string => {
  const d = new Date(now.getTime() - hoursAgo * 3600000);

  return d.toISOString();
};

const DEMO_NOTIFICATIONS: TimetableNotification[] = [
  {
    id: 1, user_id: 1, type: 'cancellation', priority: 'urgent',
    title: 'Cours Algorithmes annule - Lundi 08:00',
    message: 'Le cours d\'Algorithmes CM du Dr. Dupont prevu lundi 10 fevrier de 08:00 a 10:00 en Amphi A est annule. Raison: Enseignant en deplacement professionnel. Aucune seance de rattrapage n\'est prevue pour le moment.',
    data: { module: 'Algorithmes', teacher: 'Dr. Dupont', room: 'Amphi A', group: 'L3 Info G1' },
    read_at: null, delivered_at: makeDate(0.5), created_at: makeDate(0.5), updated_at: makeDate(0.5),
  },
  {
    id: 2, user_id: 1, type: 'room_change', priority: 'important',
    title: 'Changement de salle - Reseaux TP',
    message: 'Le TP de Reseaux du mardi 11 fevrier (08:00-10:00) est deplace du Labo Info-1 vers la Salle TD-102. Raison: maintenance du laboratoire informatique.',
    data: { module: 'Reseaux', old_room: 'Labo Info-1', new_room: 'Salle TD-102', teacher: 'Dr. Bernard' },
    read_at: null, delivered_at: makeDate(2), created_at: makeDate(2), updated_at: makeDate(2),
  },
  {
    id: 3, user_id: 1, type: 'teacher_replacement', priority: 'important',
    title: 'Remplacement enseignant - Systemes d\'exploitation',
    message: 'Le cours de Systemes d\'exploitation du mardi 11 fevrier (14:00-16:00) sera assure par Dr. Leroy en remplacement de Prof. Petit (conge maladie).',
    data: { module: 'SE', original_teacher: 'Prof. Petit', replacement_teacher: 'Dr. Leroy' },
    read_at: null, delivered_at: makeDate(3), created_at: makeDate(3), updated_at: makeDate(3),
  },
  {
    id: 4, user_id: 1, type: 'time_change', priority: 'normal',
    title: 'Changement d\'horaire - BDD TD',
    message: 'Le TD de Bases de Donnees initialement prevu lundi de 10:00 a 12:00 est deplace a 14:00-16:00 le meme jour. Salle inchangee (TD-101).',
    data: { module: 'BDD', old_time: '10:00-12:00', new_time: '14:00-16:00' },
    read_at: makeDate(1), delivered_at: makeDate(5), created_at: makeDate(5), updated_at: makeDate(5),
  },
  {
    id: 5, user_id: 1, type: 'exceptional_session', priority: 'normal',
    title: 'Seance exceptionnelle - Programmation Web',
    message: 'Une seance exceptionnelle de Programmation Web est ajoutee le samedi 15 fevrier de 09:00 a 12:00 en Labo Info-1 avec Dr. Dupont. Seance de rattrapage obligatoire.',
    data: { module: 'Programmation Web', date: '2025-02-15', time: '09:00-12:00' },
    read_at: null, delivered_at: makeDate(8), created_at: makeDate(8), updated_at: makeDate(8),
  },
  {
    id: 6, user_id: 1, type: 'cancellation', priority: 'urgent',
    title: 'Cours IA annule - Mercredi 14:00',
    message: 'Le cours d\'Intelligence Artificielle du mercredi 12 fevrier (14:00-16:00) est annule en raison d\'une greve du personnel. Report prevu la semaine suivante.',
    data: { module: 'Intelligence Artificielle', teacher: 'Prof. Durand', reason: 'Greve' },
    read_at: makeDate(6), delivered_at: makeDate(18), created_at: makeDate(18), updated_at: makeDate(18),
  },
  {
    id: 7, user_id: 1, type: 'reminder', priority: 'normal',
    title: 'Rappel - Examen partiel demain',
    message: 'Rappel: l\'examen partiel d\'Algorithmes aura lieu demain jeudi 13 fevrier de 08:00 a 10:00 en Amphi A. N\'oubliez pas votre carte etudiante.',
    data: { module: 'Algorithmes', type: 'examen' },
    read_at: makeDate(4), delivered_at: makeDate(24), created_at: makeDate(24), updated_at: makeDate(24),
  },
  {
    id: 8, user_id: 1, type: 'date_change', priority: 'important',
    title: 'Report de cours - Mathematiques',
    message: 'Le cours de Mathematiques Discretes prevu vendredi 14 fevrier est reporte au lundi 17 fevrier meme horaire (10:00-12:00). Salle: Amphi B.',
    data: { module: 'Mathematiques Discretes', old_date: '14/02', new_date: '17/02' },
    read_at: null, delivered_at: makeDate(30), created_at: makeDate(30), updated_at: makeDate(30),
  },
  {
    id: 9, user_id: 1, type: 'slot_updated', priority: 'normal',
    title: 'Modification emploi du temps - Reseaux CM',
    message: 'Le CM de Reseaux du jeudi a ete mis a jour: nouvel horaire 10:00-12:00 (au lieu de 08:00-10:00). Salle inchangee.',
    data: { module: 'Reseaux', change: 'horaire' },
    read_at: makeDate(20), delivered_at: makeDate(72), created_at: makeDate(72), updated_at: makeDate(72),
  },
  {
    id: 10, user_id: 1, type: 'restoration', priority: 'normal',
    title: 'Cours retabli - Programmation Web',
    message: 'Le cours de Programmation Web initialement annule le mercredi 5 fevrier est finalement maintenu. Horaire et salle inchanges.',
    data: { module: 'Programmation Web' },
    read_at: makeDate(48), delivered_at: makeDate(120), created_at: makeDate(120), updated_at: makeDate(120),
  },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  channels: { in_app: true, email: true, push: true, sms: false },
  frequency: 'instant',
  do_not_disturb: { enabled: false, start_time: '22:00', end_time: '07:00' },
  types: {
    cancellation: true,
    room_change: true,
    teacher_replacement: true,
    time_change: true,
    date_change: true,
    exceptional_session: true,
    reminder: true,
  },
};

// ──── Summary Card ────

const SummaryCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <Card variant="outlined" sx={{ textAlign: 'center', py: 2, borderTop: `3px solid ${color}` }}>
    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 0.5 }}>{icon}</Typography>
    <Typography variant="h4" fontWeight="bold" sx={{ color }}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
  </Card>
);

// ──── Notification Card ────

interface NotificationCardProps {
  notification: TimetableNotification;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkRead: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, isExpanded, onToggle, onMarkRead }) => {
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type] || { label: notification.type, icon: 'i', color: '#9e9e9e' };
  const priorityConfig = NOTIFICATION_PRIORITY_CONFIG[notification.priority];
  const isUnread = !notification.read_at;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        borderLeft: `4px solid ${typeConfig.color}`,
        bgcolor: isUnread ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
      }}
      onClick={() => {
        onToggle();

        if (isUnread) onMarkRead(notification.id);
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Icon Avatar */}
          <Avatar sx={{ bgcolor: typeConfig.color, width: 40, height: 40, fontSize: '1.2rem' }}>
            {typeConfig.icon}
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={isUnread ? 'bold' : 'normal'} noWrap sx={{ flex: 1 }}>
                {notification.title}
              </Typography>
              <Chip
                label={priorityConfig.label}
                size="small"
                sx={{ bgcolor: priorityConfig.color, color: '#fff', height: 22, fontSize: '0.7rem' }}
              />
              {isUnread && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip label={typeConfig.label} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', borderColor: typeConfig.color, color: typeConfig.color }} />
              <Typography variant="caption" color="text.secondary">
                {getRelativeTime(notification.created_at)}
              </Typography>
            </Box>

            {/* Expanded details */}
            <Collapse in={isExpanded}>
              <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                  {notification.message}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {!!notification.data.module && (
                    <Typography variant="caption" color="text.secondary">
                      Module: <strong>{String(notification.data.module)}</strong>
                    </Typography>
                  )}
                  {!!notification.data.teacher && (
                    <Typography variant="caption" color="text.secondary">
                      Enseignant: <strong>{String(notification.data.teacher)}</strong>
                    </Typography>
                  )}
                  {!!notification.data.room && (
                    <Typography variant="caption" color="text.secondary">
                      Salle: <strong>{String(notification.data.room)}</strong>
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Recu le {new Date(notification.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ──── Main Component ────

export const NotificationCenterDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  // State
  const [notifications, setNotifications] = useState<TimetableNotification[]>(DEMO_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Computed values
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);
  const urgentCount = useMemo(() => notifications.filter((n) => n.priority === 'urgent').length, [notifications]);

  const todayCount = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return notifications.filter((n) => n.created_at.slice(0, 10) === todayStr).length;
  }, [notifications]);

  // Filter logic
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Tab filter
    if (activeTab === 1) result = result.filter((n) => !n.read_at);
    if (activeTab === 2) result = result.filter((n) => n.priority === 'urgent');

    // Dropdown filters
    if (filterType !== 'all') result = result.filter((n) => n.type === filterType);
    if (filterPriority !== 'all') result = result.filter((n) => n.priority === filterPriority);

    // Sort by date descending
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [notifications, activeTab, filterType, filterPriority]);

  // Grouped by date label
  const groupedNotifications = useMemo(() => {
    const groups: { label: string; items: TimetableNotification[] }[] = [];
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    filteredNotifications.forEach((n) => {
      const dateStr = n.created_at.slice(0, 10);
      let label: string;

      if (dateStr === today) label = "Aujourd'hui";
      else if (dateStr === yesterday) label = 'Hier';
      else label = new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

      const existing = groups.find((g) => g.label === label);

      if (existing) existing.items.push(n);
      else groups.push({ label, items: [n] });
    });

    return groups;
  }, [filteredNotifications]);

  // Handlers
  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (!n.read_at ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const handleToggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleToggleChannel = (channel: keyof NotificationPreferences['channels']) => {
    setPreferences((prev) => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel] },
    }));
  };

  const handleToggleType = (type: keyof NotificationPreferences['types']) => {
    setPreferences((prev) => ({
      ...prev,
      types: { ...prev.types, [type]: !prev.types[type] },
    }));
  };

  const handleSavePreferences = () => {
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Centre de Notifications</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight="bold">Centre de Notifications</Typography>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Typography variant="h5">🔔</Typography>
          </Badge>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>⚠️</span>} onClick={() => router.push(`/${lang}/admin/timetable/exceptions`)}>
            Exceptions
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <SummaryCard title="Total" value={notifications.length} icon="📬" color="#2196f3" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard title="Non lues" value={unreadCount} icon="📩" color="#ff9800" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard title="Urgentes" value={urgentCount} icon="🔴" color="#f44336" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard title="Aujourd'hui" value={todayCount} icon="📅" color="#4caf50" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Toutes (${notifications.length})`} />
        <Tab label={`Non lues (${unreadCount})`} />
        <Tab label={`Urgentes (${urgentCount})`} />
        <Tab label="Preferences" />
      </Tabs>

      {/* Content for tabs 0-2: notification list */}
      {activeTab <= 2 && (
        <Grid container spacing={3}>
          {/* Left: Notification list */}
          <Grid item xs={12} md={8}>
            {/* Filters bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Type</InputLabel>
                <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                  <MenuItem value="all">Tous les types</MenuItem>
                  {Object.entries(NOTIFICATION_TYPE_CONFIG).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>{cfg.icon} {cfg.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Priorite</InputLabel>
                <Select value={filterPriority} label="Priorite" onChange={(e) => setFilterPriority(e.target.value)}>
                  <MenuItem value="all">Toutes</MenuItem>
                  {Object.entries(NOTIFICATION_PRIORITY_CONFIG).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>{cfg.icon} {cfg.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ flex: 1 }} />

              <Tooltip title="Marquer toutes les notifications comme lues">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  Tout marquer comme lu
                </Button>
              </Tooltip>
            </Box>

            {/* Notification groups */}
            {filteredNotifications.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucune notification ne correspond aux filtres selectionnes.
              </Alert>
            ) : (
              groupedNotifications.map((group) => (
                <Box key={group.label} sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1, pl: 1 }}>
                    {group.label} ({group.items.length})
                  </Typography>
                  {group.items.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      isExpanded={expandedId === notification.id}
                      onToggle={() => handleToggleExpand(notification.id)}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </Box>
              ))
            )}

            {/* History note */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              Historique disponible sur les 30 derniers jours
            </Typography>
          </Grid>

          {/* Right: Quick preferences */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Preferences rapides</Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Canaux de notification</Typography>
                {(Object.keys(preferences.channels) as (keyof NotificationPreferences['channels'])[]).map((channel) => {
                  const channelLabels: Record<string, string> = {
                    in_app: 'In-App',
                    email: 'Email',
                    push: 'Push',
                    sms: 'SMS',
                  };

                  const channelIcons: Record<string, string> = {
                    in_app: '🖥️',
                    email: '📧',
                    push: '📱',
                    sms: '💬',
                  };

                  return (
                    <Box key={channel} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{channelIcons[channel]}</Typography>
                        <Typography variant="body2">{channelLabels[channel]}</Typography>
                      </Box>
                      <Switch
                        size="small"
                        checked={preferences.channels[channel]}
                        onChange={() => handleToggleChannel(channel)}
                      />
                    </Box>
                  );
                })}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Frequence</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select
                    value={preferences.frequency}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, frequency: e.target.value as NotificationFrequency }))}
                  >
                    <MenuItem value="instant">Instantanee</MenuItem>
                    <MenuItem value="daily_digest">Resume quotidien</MenuItem>
                    <MenuItem value="weekly_digest">Resume hebdomadaire</MenuItem>
                  </Select>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Ne pas deranger</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={preferences.do_not_disturb.enabled}
                      onChange={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          do_not_disturb: { ...prev.do_not_disturb, enabled: !prev.do_not_disturb.enabled },
                        }))
                      }
                    />
                  }
                  label={<Typography variant="body2">Activer le mode silencieux</Typography>}
                />
                {preferences.do_not_disturb.enabled && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      label="Debut"
                      type="time"
                      value={preferences.do_not_disturb.start_time}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          do_not_disturb: { ...prev.do_not_disturb, start_time: e.target.value },
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      label="Fin"
                      type="time"
                      value={preferences.do_not_disturb.end_time}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          do_not_disturb: { ...prev.do_not_disturb, end_time: e.target.value },
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Statistiques</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Notifications cette semaine: <strong>7</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Taux de lecture: <strong>50%</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Temps moyen de lecture: <strong>15 min</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Full Preferences Panel */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Canaux de notification</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Choisissez comment vous souhaitez recevoir vos notifications.
                </Typography>

                {(Object.keys(preferences.channels) as (keyof NotificationPreferences['channels'])[]).map((channel) => {
                  const channelLabels: Record<string, string> = {
                    in_app: 'Notifications In-App',
                    email: 'Notifications par Email',
                    push: 'Notifications Push',
                    sms: 'Notifications SMS',
                  };

                  const channelDescriptions: Record<string, string> = {
                    in_app: 'Recevez les notifications directement dans l\'application.',
                    email: 'Recevez un email pour chaque notification ou resume.',
                    push: 'Notifications push sur votre appareil mobile.',
                    sms: 'Alertes SMS pour les notifications urgentes uniquement.',
                  };

                  return (
                    <Box key={channel} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="subtitle2">{channelLabels[channel]}</Typography>
                        <Typography variant="caption" color="text.secondary">{channelDescriptions[channel]}</Typography>
                      </Box>
                      <Switch
                        checked={preferences.channels[channel]}
                        onChange={() => handleToggleChannel(channel)}
                      />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Types de notifications</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Selectionnez les types de notifications que vous souhaitez recevoir.
                </Typography>

                {(Object.keys(preferences.types) as (keyof NotificationPreferences['types'])[]).map((type) => {
                  const typeConfig = NOTIFICATION_TYPE_CONFIG[type];

                  return (
                    <Box key={type} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{typeConfig?.icon}</Typography>
                        <Typography variant="body2">{typeConfig?.label || type}</Typography>
                      </Box>
                      <Switch
                        size="small"
                        checked={preferences.types[type]}
                        onChange={() => handleToggleType(type)}
                      />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Frequence de livraison</Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Frequence</InputLabel>
                  <Select
                    value={preferences.frequency}
                    label="Frequence"
                    onChange={(e) => setPreferences((prev) => ({ ...prev, frequency: e.target.value as NotificationFrequency }))}
                  >
                    <MenuItem value="instant">Instantanee - Recevoir immediatement</MenuItem>
                    <MenuItem value="daily_digest">Resume quotidien - Une fois par jour</MenuItem>
                    <MenuItem value="weekly_digest">Resume hebdomadaire - Une fois par semaine</MenuItem>
                  </Select>
                </FormControl>

                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                  Les notifications urgentes sont toujours envoyees immediatement, quel que soit le reglage de frequence.
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Mode Ne pas deranger</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.do_not_disturb.enabled}
                          onChange={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              do_not_disturb: { ...prev.do_not_disturb, enabled: !prev.do_not_disturb.enabled },
                            }))
                          }
                        />
                      }
                      label="Activer le mode silencieux"
                    />
                  </Grid>
                  {preferences.do_not_disturb.enabled && (
                    <>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Heure de debut"
                          type="time"
                          value={preferences.do_not_disturb.start_time}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              do_not_disturb: { ...prev.do_not_disturb, start_time: e.target.value },
                            }))
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Heure de fin"
                          type="time"
                          value={preferences.do_not_disturb.end_time}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              do_not_disturb: { ...prev.do_not_disturb, end_time: e.target.value },
                            }))
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {prefsSaved && <Alert severity="success" sx={{ flex: 1 }}>Preferences enregistrees avec succes !</Alert>}
              <Button variant="contained" size="large" onClick={handleSavePreferences}>
                Enregistrer les preferences
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
