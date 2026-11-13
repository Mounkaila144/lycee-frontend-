'use client';

import React, { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { LyceeSlot } from '../../types/lycee.types';
import { DAYS } from '../../types';

interface WeeklyTimetableGridProps {
  slots: LyceeSlot[];

  /** Ce qu'il faut afficher en 2e ligne de chaque séance. */
  secondaryInfo?: 'teacher' | 'classe';
  onSlotClick?: (slot: LyceeSlot) => void;
  emptyMessage?: string;
}

const SUBJECT_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#d32f2f', '#5d4037', '#00796b'];

const colorFor = (key: string): string => {
  let hash = 0;

  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 997;
  }

  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
};

/**
 * Grille hebdomadaire (Lundi → Samedi). Les lignes sont construites à partir des
 * plages horaires réellement présentes dans les créneaux.
 */
export const WeeklyTimetableGrid: React.FC<WeeklyTimetableGridProps> = ({
  slots,
  secondaryInfo = 'teacher',
  onSlotClick,
  emptyMessage = 'Aucun créneau planifié.',
}) => {
  const timeRanges = useMemo(() => {
    const ranges = new Map<string, { start: string; end: string }>();

    slots.forEach((slot) => {
      ranges.set(`${slot.start_time}-${slot.end_time}`, { start: slot.start_time, end: slot.end_time });
    });

    return Array.from(ranges.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, ...value }));
  }, [slots]);

  if (slots.length === 0) {
    return (
      <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
        <Typography color='text.secondary'>{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant='outlined' sx={{ overflow: 'auto' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '110px repeat(6, minmax(140px, 1fr))', minWidth: 950 }}>
        <Box sx={{ p: 1, borderBottom: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Typography variant='caption' fontWeight='bold'>
            Horaire
          </Typography>
        </Box>
        {DAYS.map((day) => (
          <Box
            key={day}
            sx={{ p: 1, borderBottom: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'action.hover', textAlign: 'center' }}
          >
            <Typography variant='subtitle2' fontWeight='bold'>
              {day}
            </Typography>
          </Box>
        ))}

        {timeRanges.map((range) => (
          <React.Fragment key={range.key}>
            <Box sx={{ p: 1, borderBottom: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant='caption' fontWeight='bold'>
                {range.start}
                <br />
                {range.end}
              </Typography>
            </Box>
            {DAYS.map((day) => {
              const cellSlots = slots.filter(
                (slot) => slot.day_of_week === day && slot.start_time === range.start && slot.end_time === range.end,
              );

              return (
                <Box key={`${day}-${range.key}`} sx={{ p: 0.5, borderBottom: 1, borderRight: 1, borderColor: 'divider', minHeight: 80 }}>
                  {cellSlots.map((slot) => {
                    const subjectName = slot.subject?.name ?? slot.module?.name ?? 'Matière';
                    const secondary = secondaryInfo === 'classe' ? slot.classe?.name : slot.teacher?.name;

                    return (
                      <Card
                        key={slot.id}
                        onClick={onSlotClick ? () => onSlotClick(slot) : undefined}
                        sx={{
                          mb: 0.5,
                          cursor: onSlotClick ? 'pointer' : 'default',
                          borderLeft: `4px solid ${colorFor(subjectName)}`,
                          '&:hover': onSlotClick ? { boxShadow: 4 } : undefined,
                        }}
                      >
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant='subtitle2' fontWeight='bold' noWrap>
                            {subjectName}
                          </Typography>
                          {secondary && (
                            <Typography variant='caption' display='block' color='text.secondary' noWrap>
                              {secondary}
                            </Typography>
                          )}
                          {(slot.room?.name ?? slot.classe?.classroom) && (
                            <Typography variant='caption' display='block' color='text.secondary' noWrap>
                              {slot.room?.name ?? slot.classe?.classroom}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};
