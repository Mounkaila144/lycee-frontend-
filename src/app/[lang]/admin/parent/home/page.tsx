'use client';

import { useParams, useRouter } from 'next/navigation';

import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';
import type { ParentProfile } from '@/modules/PortailParent/types/portail-parent.types';

function ParentProfileDetails({ profile }: { profile: ParentProfile }) {
  const lines: [string, string][] = [
    ['Nom complet', profile.full_name],
    ['Lien de parenté', profile.relationship],
    ['Téléphone', profile.phone],
    ['Email', profile.email ?? '—'],
    ['Profession', profile.profession ?? '—'],
    ['Adresse', profile.address ?? '—'],
    ['Enfants', String(profile.children_count ?? 0)],
  ];

  return (
    <Stack spacing={1}>
      {lines.map(([label, value]) => (
        <Stack key={label} direction='row' spacing={2}>
          <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
            {label}
          </Typography>
          <Typography variant='body2'>{value}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default function ParentHomePage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Mon profil parent'
          subtitle='Accueil'
          loader={() => parentService.me()}
          render={(profile) => <ParentProfileDetails profile={profile} />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Mes enfants'
          subtitle='Vue rapide'
          loader={() => parentService.myChildren()}
          emptyMessage='Aucun enfant associé à votre compte.'
          render={(children) => (
            <List disablePadding>
              {children.map((child) => (
                <ListItemButton
                  key={child.id}
                  onClick={() => router.push(`/${lang}/admin/parent/children/${child.id}`)}
                >
                  <ListItemText
                    primary={child.full_name}
                    secondary={child.matricule ?? 'Matricule en attente'}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        />
      </Grid>
    </Grid>
  );
}
