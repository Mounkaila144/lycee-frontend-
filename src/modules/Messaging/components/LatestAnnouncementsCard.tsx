'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

import { announcementService } from '../services/announcementService';
import type { Announcement } from '../types/announcement.types';
import { AnnouncementList } from './AnnouncementList';

interface Props {
  limit?: number;
}

/**
 * Encart « Dernières annonces » des pages d'accueil (Élève, Professeur…).
 */
export function LatestAnnouncementsCard({ limit = 5 }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    announcementService
      .feed(limit)
      .then(setAnnouncements)
      .catch(() => setError('Impossible de charger les annonces.'))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <Card>
      <CardHeader title='📢 Dernières annonces' subheader="Informations de l'établissement" />
      <CardContent>
        {loading && <CircularProgress size={24} />}
        {error && <Alert severity='error'>{error}</Alert>}
        {!loading && !error && <AnnouncementList announcements={announcements} compact />}
      </CardContent>
    </Card>
  );
}
