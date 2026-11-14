'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Announcement } from '../types/announcement.types';

interface Props {
  announcements: Announcement[];

  /** Tronque le contenu (encarts d'accueil). */
  compact?: boolean;
  emptyMessage?: string;
}

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString('fr-FR') : '—');

/**
 * Liste d'annonces en lecture seule (page Parent, encarts d'accueil).
 */
export function AnnouncementList({ announcements, compact = false, emptyMessage = 'Aucune annonce pour le moment.' }: Props) {
  if (announcements.length === 0) {
    return <Typography color='text.secondary'>{emptyMessage}</Typography>;
  }

  return (
    <Stack divider={<Divider flexItem />} spacing={2}>
      {announcements.map((announcement) => (
        <Box key={announcement.id}>
          <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
            {announcement.is_pinned && <Chip label='Épinglée' size='small' color='warning' variant='tonal' />}
            <Typography variant='subtitle1' fontWeight={600}>
              {announcement.title}
            </Typography>
            {announcement.classe && <Chip label={announcement.classe.name} size='small' variant='outlined' />}
          </Stack>
          <Typography variant='caption' color='text.secondary'>
            Publiée le {formatDate(announcement.published_at)}
            {announcement.author ? ` · ${announcement.author.full_name}` : ''}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              mt: 1,
              whiteSpace: 'pre-line',
              ...(compact && {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {announcement.body}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
