'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useParams, useRouter } from 'next/navigation';

import { parentService } from '@/modules/PortailParent/services/parentService';
import type { ChildSummary } from '@/modules/PortailParent/types/portail-parent.types';

export default function ChildrenListPage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    parentService
      .myChildren()
      .then(setChildren)
      .catch((e) =>
        setError(e?.response?.data?.message ?? 'Erreur de chargement.')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity='error'>{error}</Alert>;

  if (children.length === 0)
    return (
      <Alert severity='info'>
        Aucun enfant n’est associé à votre compte. Contactez l’administration.
      </Alert>
    );

  return (
    <Card>
      <CardHeader title='Mes enfants' subheader='Story Parent 01' />
      <CardContent>
        <Grid container spacing={4}>
          {children.map((child) => (
            <Grid key={child.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant='outlined'>
                <CardActionArea
                  onClick={() =>
                    router.push(`/${lang}/admin/parent/children/${child.id}`)
                  }
                >
                  <CardContent>
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Avatar
                        src={child.photo_url ?? undefined}
                        sx={{ width: 64, height: 64 }}
                      >
                        {child.firstname?.[0]}
                        {child.lastname?.[0]}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant='h6'>{child.full_name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {child.matricule ?? 'Matricule en attente'}
                        </Typography>
                        <Stack direction='row' spacing={1} mt={1}>
                          <Chip
                            label={child.status}
                            size='small'
                            color={child.status === 'Actif' ? 'success' : 'default'}
                          />
                          {child.pivot?.is_financial_responsible && (
                            <Chip label='Resp. financier' size='small' color='primary' />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
