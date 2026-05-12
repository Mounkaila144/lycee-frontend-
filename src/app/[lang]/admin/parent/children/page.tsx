'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';
import type { ChildSummary } from '@/modules/PortailParent/types/portail-parent.types';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import { useParams, useRouter } from 'next/navigation';

export default function ChildrenListPage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  return (
    <ScaffoldPage<ChildSummary[]>
      title='Mes enfants'
      subtitle='Story Parent 01 — Liste'
      loader={() => parentService.myChildren()}
      emptyMessage='Aucun enfant n’est associé à votre compte. Contactez l’administration.'
      render={(children) => (
        <Grid container spacing={4}>
          {children.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea
                  onClick={() => router.push(`/${lang}/admin/parent/children/${c.id}`)}
                >
                  <CardContent>
                    <Typography variant='h6'>{c.full_name}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {c.matricule ?? 'Matricule en attente'} — {c.status}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    />
  );
}
