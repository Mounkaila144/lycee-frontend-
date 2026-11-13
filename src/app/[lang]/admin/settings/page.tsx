'use client';

import Link from 'next/link';

import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

/**
 * Index des paramètres. Ne liste que les écrans réellement implémentés
 * (les anciennes entrées auth / password-policy / sessions / menus
 * pointaient vers des pages ou endpoints inexistants).
 */
const settingsCategories = [
  {
    title: "Réglages de l'établissement",
    description: "Paramètres clé/valeur du lycée (réservé à l'administrateur)",
    icon: '⚙️',
    path: '/admin/settings/tenant',
  },
];

export default function SettingsPage() {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Paramètres</Typography>
      </Grid>
      {settingsCategories.map((category) => (
        <Grid key={category.path} size={{ xs: 12, md: 6, lg: 4 }}>
          <Card>
            <CardActionArea component={Link} href={category.path}>
              <CardContent sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                <Typography variant='h3' component='span'>
                  {category.icon}
                </Typography>
                <div>
                  <Typography variant='h6'>{category.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {category.description}
                  </Typography>
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
