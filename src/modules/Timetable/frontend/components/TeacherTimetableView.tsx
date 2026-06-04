'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import { createApiClient } from '@/shared/lib/api-client';
import { useAuth } from '@/modules/UsersGuard/admin/hooks/useAuth';

const api = () => createApiClient();
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

interface Slot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_name: string | null;
  classe?: { id: number; name: string } | null;
  subject?: { id: number; name: string; code?: string } | null;
  teacher?: { id: number; name: string } | null;
}

interface TeacherOption { id: number; name: string }

/**
 * Read-only weekly timetable for a single teacher (secondary school).
 * A Professeur sees their own schedule; Admin/Manager pick a teacher.
 */
export const TeacherTimetableView: React.FC = () => {
  const { user } = useAuth();
  const roles: string[] = (user as any)?.roles ?? [];
  const isPureTeacher = roles.includes('Professeur') && !roles.includes('Administrator') && !roles.includes('Manager');
  const selfId = (user as any)?.id ? Number((user as any).id) : null;

  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // Admins/Managers can choose any teacher; a Professeur is locked to themselves.
  const { data: teachersResp } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await api().get('/admin/teachers')).data,
    enabled: !isPureTeacher,
  });
  const teachers = useMemo<TeacherOption[]>(
    () => toArray<any>(teachersResp).map(t => ({ id: t.id, name: t.full_name || `${t.firstname ?? ''} ${t.lastname ?? ''}`.trim() || t.username })),
    [teachersResp],
  );

  const teacherId = isPureTeacher ? selfId : (selectedTeacher ? Number(selectedTeacher) : null);

  const { data: slotsResp, isLoading } = useQuery({
    queryKey: ['teacher-class-slots', teacherId],
    queryFn: async () => (await api().get('/admin/timetable/class-slots', { params: { teacher_id: teacherId } })).data,
    enabled: !!teacherId,
  });
  const slots = useMemo(() => toArray<Slot>(slotsResp), [slotsResp]);

  const slotsByDay = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    DAYS.forEach(d => { map[d] = []; });
    slots.forEach(s => { (map[s.day_of_week] ??= []).push(s); });
    Object.values(map).forEach(arr => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return map;
  }, [slots]);

  const stats = useMemo(() => {
    const classes = new Set<number>();
    const subjects = new Set<number>();
    slots.forEach(s => {
      if (s.classe?.id) classes.add(s.classe.id);
      if (s.subject?.id) subjects.add(s.subject.id);
    });
    return { total: slots.length, classes: classes.size, subjects: subjects.size };
  }, [slots]);

  const teacherName = isPureTeacher
    ? ((user as any)?.full_name || (user as any)?.username || 'Mon emploi du temps')
    : teachers.find(t => t.id === teacherId)?.name;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">EDT Enseignant</Typography>
        {!isPureTeacher && (
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Enseignant</InputLabel>
            <Select label="Enseignant" value={selectedTeacher} onChange={e => setSelectedTeacher(String(e.target.value))}>
              {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Box>

      {!teacherId && (
        <Alert severity="info">
          {isPureTeacher ? 'Impossible de déterminer votre compte enseignant.' : 'Sélectionnez un enseignant pour afficher son emploi du temps.'}
        </Alert>
      )}

      {teacherId && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mr: 2 }}>{teacherName}</Typography>
              <Chip label={`${stats.total} cours / semaine`} color="primary" />
              <Chip label={`${stats.classes} classe(s)`} variant="outlined" />
              <Chip label={`${stats.subjects} matière(s)`} variant="outlined" />
            </CardContent>
          </Card>

          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}

          {!isLoading && stats.total === 0 && (
            <Alert severity="warning">Aucun créneau n'est programmé pour cet enseignant. Les créneaux se créent dans « Planification ».</Alert>
          )}

          {!isLoading && stats.total > 0 && (
            <Grid container spacing={2}>
              {DAYS.map(day => (
                <Grid key={day} size={{ xs: 12, sm: 6, md: 2 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" align="center" sx={{ mb: 1 }}>{day}</Typography>
                      <Divider sx={{ mb: 1 }} />
                      {slotsByDay[day].length === 0 && (
                        <Typography variant="caption" color="text.secondary" align="center" display="block">—</Typography>
                      )}
                      {slotsByDay[day].map(s => (
                        <Box key={s.id} sx={{ p: 1, mb: 1, borderRadius: 1, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" color="primary" fontWeight="bold" display="block">{s.start_time}–{s.end_time}</Typography>
                          <Typography variant="body2" fontWeight="medium">{s.subject?.name ?? '—'}</Typography>
                          {s.classe?.name && <Chip size="small" label={s.classe.name} color="info" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                          {s.room_name && <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>Salle : {s.room_name}</Typography>}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};
