'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import CustomAvatar from '@core/components/mui/Avatar';
import type { ThemeColor } from '@core/types';

import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import { superAdminDashboardService } from '../services/dashboardService';
import type { SuperAdminDashboardData } from '../types/dashboard.types';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color: ThemeColor;
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => (
  <Card className='bs-full'>
    <CardContent className='flex items-center gap-4'>
      <CustomAvatar variant='rounded' skin='light' color={color} size={48}>
        <i className={icon} />
      </CustomAvatar>
      <div>
        <Typography variant='h4'>{value}</Typography>
        <Typography color='text.primary'>{title}</Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary'>
            {subtitle}
          </Typography>
        )}
      </div>
    </CardContent>
  </Card>
);

const formatCount = (value: number | null): string => (value === null ? '—' : value.toLocaleString('fr-FR'));

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const SuperAdminDashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDashboard(await superAdminDashboardService.getDashboard());
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les statistiques du tableau de bord.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, loadDashboard]);

  if (authLoading || (loading && !dashboard && !error)) {
    return (
      <div className='flex justify-center p-12'>
        <CircularProgress />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h4' gutterBottom>
                Tableau de bord Super Admin
              </Typography>
              <Typography color='text.secondary'>
                Vue d&apos;ensemble des établissements hébergés sur la plateforme.
              </Typography>
            </div>
            <Button
              variant='outlined'
              startIcon={<i className='ri-refresh-line' />}
              onClick={loadDashboard}
              disabled={loading}
            >
              Actualiser
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error'>{error}</Alert>
        </Grid>
      )}

      {dashboard && (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title='Écoles'
              value={dashboard.tenants.total}
              subtitle={`${dashboard.tenants.active} active(s) · ${dashboard.tenants.inactive} inactive(s)`}
              icon='ri-building-line'
              color='primary'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title='Élèves'
              value={formatCount(dashboard.totals.students)}
              subtitle='Toutes écoles confondues'
              icon='ri-graduation-cap-line'
              color='success'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title='Professeurs'
              value={formatCount(dashboard.totals.teachers)}
              subtitle={`${formatCount(dashboard.totals.users)} utilisateurs au total`}
              icon='ri-user-star-line'
              color='info'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title='Domaines'
              value={dashboard.domains.total}
              subtitle={
                dashboard.totals.unavailable_schools > 0
                  ? `${dashboard.totals.unavailable_schools} base(s) inaccessible(s)`
                  : 'Toutes les bases sont accessibles'
              }
              icon='ri-global-line'
              color={dashboard.totals.unavailable_schools > 0 ? 'warning' : 'secondary'}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardHeader title='Écoles' subheader='Chiffres lus dans la base de chaque établissement' />
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>École</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align='right'>Élèves</TableCell>
                      <TableCell align='right'>Professeurs</TableCell>
                      <TableCell align='right'>Utilisateurs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard.schools.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align='center'>
                          Aucune école enregistrée.
                        </TableCell>
                      </TableRow>
                    )}
                    {dashboard.schools.map(school => (
                      <TableRow key={school.id}>
                        <TableCell>
                          <Typography color='text.primary' className='font-medium'>
                            {school.company_name || school.id}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {school.domains.join(', ') || 'Aucun domaine'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            <Chip
                              size='small'
                              variant='tonal'
                              color={school.is_active ? 'success' : 'secondary'}
                              label={school.is_active ? 'Active' : 'Inactive'}
                            />
                            {!school.available && (
                              <Tooltip title={`${school.error ?? 'Base indisponible'} (${school.database})`}>
                                <Chip size='small' variant='tonal' color='error' label='Base indisponible' />
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell align='right'>{formatCount(school.students)}</TableCell>
                        <TableCell align='right'>{formatCount(school.teachers)}</TableCell>
                        <TableCell align='right'>{formatCount(school.users)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card className='bs-full'>
              <CardHeader title='Dernières écoles créées' />
              <CardContent className='flex flex-col gap-4'>
                {dashboard.recent_tenants.length === 0 && (
                  <Typography color='text.secondary'>Aucune école pour le moment.</Typography>
                )}
                {dashboard.recent_tenants.map(tenant => (
                  <div key={tenant.id} className='flex items-center justify-between gap-2'>
                    <div>
                      <Typography color='text.primary' className='font-medium'>
                        {tenant.company_name || tenant.id}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {tenant.domains[0] ?? 'Aucun domaine'}
                      </Typography>
                    </div>
                    <Typography variant='body2' color='text.secondary'>
                      {formatDate(tenant.created_at)}
                    </Typography>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default SuperAdminDashboard;
