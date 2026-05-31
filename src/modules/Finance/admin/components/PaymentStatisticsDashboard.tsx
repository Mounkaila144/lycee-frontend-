'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

interface Option { id: number; name: string }
interface Bucket {
  class_id?: number;
  class_name?: string;
  total_students: number;
  paid: number;
  partial: number;
  unpaid: number;
  not_billed: number;
  amount_billed: number;
  amount_collected: number;
  amount_outstanding: number;
  payment_rate: number;
}
interface StatsData { academic_year_id: number; global: Bucket; classes: Bucket[] }

const money = (v: number): string => `${Number(v || 0).toLocaleString('fr-FR')} FCFA`;

const KpiCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: color ?? 'text.primary' }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </CardContent>
  </Card>
);

export const PaymentStatisticsDashboard: React.FC = () => {
  const [yearId, setYearId] = useState('');

  const { data: yearsResp } = useQuery({ queryKey: ['academic-years'], queryFn: async () => (await api().get('/admin/academic-years')).data });
  const years = useMemo(() => toArray<Option>(yearsResp), [yearsResp]);

  const { data: statsResp, isLoading, isError } = useQuery({
    queryKey: ['payment-statistics', yearId],
    queryFn: async () => (await api().get('/admin/finance/reports/payment-statistics', { params: { academic_year_id: yearId || undefined } })).data,
  });
  const stats = (statsResp as { data?: StatsData })?.data;
  const g = stats?.global;

  // Drill-down dialog: students who still owe money.
  const [drill, setDrill] = useState<{ classId?: number; classLabel: string } | null>(null);
  const { data: drillResp, isFetching: drillLoading } = useQuery({
    queryKey: ['outstanding-students', yearId, drill?.classId ?? 'all'],
    queryFn: async () => (await api().get('/admin/finance/reports/outstanding-students', {
      params: { academic_year_id: yearId || undefined, class_id: drill?.classId, status: 'with_balance' },
    })).data,
    enabled: drill !== null,
  });
  const drillData = (drillResp as { data?: { count: number; total_outstanding: number; students: any[] } })?.data;

  const statusChip = (s: string) => {
    if (s === 'partial') return <Chip size="small" color="warning" label="Partiel" />;
    if (s === 'not_billed') return <Chip size="small" label="Non facturé" />;
    return <Chip size="small" color="error" label="Impayé" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Statistiques de paiement (scolarité)</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Année</InputLabel>
          <Select label="Année" value={yearId} onChange={e => setYearId(String(e.target.value))}>
            <MenuItem value="">Année active</MenuItem>
            {years.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Suivi du paiement des frais (scolarité + inscription) par élève, globalement et par classe.
      </Typography>

      {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
      {isError && <Alert severity="error">Erreur lors du chargement des statistiques.</Alert>}

      {!isLoading && !isError && g && (
        <>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="À jour (payé)" value={g.paid} color="#2e7d32" /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Partiel" value={g.partial} color="#ed6c02" /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Impayé" value={g.unpaid} color="#d32f2f" /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Non facturé" value={g.not_billed} color="#757575" /></Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}><KpiCard label="Total facturé" value={money(g.amount_billed)} color="#1976d2" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><KpiCard label="Total encaissé" value={money(g.amount_collected)} color="#2e7d32" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><KpiCard label="Reste à recouvrer" value={money(g.amount_outstanding)} color="#d32f2f" /></Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Button variant="contained" color="error" startIcon={<i className="ri-error-warning-line" />}
              onClick={() => setDrill({ classLabel: 'toutes les classes' })}>
              Voir les restants à payer
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Par classe</Typography>
              {stats!.classes.length === 0 ? <Alert severity="info">Aucune classe pour cette année.</Alert> : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Classe</TableCell>
                        <TableCell align="center">Élèves</TableCell>
                        <TableCell align="center">Payé</TableCell>
                        <TableCell align="center">Partiel</TableCell>
                        <TableCell align="center">Impayé</TableCell>
                        <TableCell align="center">Non facturé</TableCell>
                        <TableCell align="right">Encaissé</TableCell>
                        <TableCell align="right">Reste dû</TableCell>
                        <TableCell align="center" sx={{ minWidth: 140 }}>Taux</TableCell>
                        <TableCell align="center">Restants</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats!.classes.map(c => (
                        <TableRow key={c.class_id} hover>
                          <TableCell>{c.class_name}</TableCell>
                          <TableCell align="center">{c.total_students}</TableCell>
                          <TableCell align="center"><Chip size="small" color="success" label={c.paid} /></TableCell>
                          <TableCell align="center">{c.partial > 0 ? <Chip size="small" color="warning" label={c.partial} /> : 0}</TableCell>
                          <TableCell align="center">{c.unpaid > 0 ? <Chip size="small" color="error" label={c.unpaid} /> : 0}</TableCell>
                          <TableCell align="center">{c.not_billed || 0}</TableCell>
                          <TableCell align="right">{money(c.amount_collected)}</TableCell>
                          <TableCell align="right">{money(c.amount_outstanding)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress variant="determinate" value={c.payment_rate} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                              <Typography variant="caption">{c.payment_rate}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" variant="outlined" color="error"
                              disabled={(c.partial + c.unpaid + c.not_billed) === 0}
                              onClick={() => setDrill({ classId: c.class_id, classLabel: c.class_name ?? '' })}>
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={drill !== null} onClose={() => setDrill(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Restants à payer — {drill?.classLabel}
          {drillData && (
            <Typography variant="body2" color="text.secondary">
              {drillData.count} élève(s) · {money(drillData.total_outstanding)} à recouvrer
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {drillLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {!drillLoading && drillData && drillData.students.length === 0 && (
            <Alert severity="success">Tous les élèves sont à jour 🎉</Alert>
          )}
          {!drillLoading && drillData && drillData.students.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Élève</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell align="right">Facturé</TableCell>
                    <TableCell align="right">Payé</TableCell>
                    <TableCell align="right">Reste à payer</TableCell>
                    <TableCell align="center">Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drillData.students.map((s: any) => (
                    <TableRow key={s.student_id} hover>
                      <TableCell>{s.matricule}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.class_name}</TableCell>
                      <TableCell align="right">{money(s.billed)}</TableCell>
                      <TableCell align="right">{money(s.paid)}</TableCell>
                      <TableCell align="right" style={{ fontWeight: 600, color: '#d32f2f' }}>{money(s.outstanding)}</TableCell>
                      <TableCell align="center">{statusChip(s.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrill(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
