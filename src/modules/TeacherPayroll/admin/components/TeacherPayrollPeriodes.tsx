'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

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

const fmtMoney = (n: any) => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');
const MOIS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const REGLEMENTS = ['ESPECES', 'MOBILE_MONEY', 'VIREMENT_BANCAIRE', 'CHEQUE', 'AUTRE'];

const PERIODE_COLORS: Record<string, any> = { OUVERTE: 'default', EN_CALCUL: 'info', VALIDEE: 'primary', PAYEE: 'success', CLOTUREE: 'secondary' };
const PAIE_COLORS: Record<string, any> = { BROUILLON: 'default', CALCULEE: 'info', VALIDEE: 'primary', PARTIELLEMENT_PAYEE: 'warning', PAYEE: 'success', ANNULEE: 'error' };

interface Periode { id: number; mois: number; annee: number; statut: string; est_vacances: boolean; paies_count?: number; }
interface Paie {
  id: number; professeur_id: number; mode_paiement: string; net_a_payer: string; montant_paye: string;
  montant_brut: string; total_primes: string; total_retenues: string; total_avances: string; statut: string;
  professeur?: { nom: string; prenom: string };
}

export const TeacherPayrollPeriodes: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [payFor, setPayFor] = useState<Paie | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const now = new Date();
  const [form, setForm] = useState({
    mois: now.getMonth() + 1, annee: now.getFullYear(),
    date_debut: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
    date_fin: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
    est_vacances: false,
  });
  const [payForm, setPayForm] = useState({ montant: '', mode_reglement: 'ESPECES', reference: '' });

  const { data: periodesResp, isLoading } = useQuery({
    queryKey: ['tp-periodes'],
    queryFn: async () => (await api().get('/admin/teacher-payroll/periodes')).data,
  });
  const periodes = useMemo(() => toArray<Periode>(periodesResp), [periodesResp]);
  const selectedPeriode = periodes.find(p => p.id === selected) ?? null;

  const { data: paiesResp, isLoading: paiesLoading } = useQuery({
    queryKey: ['tp-paies', selected],
    queryFn: async () => (await api().get('/admin/teacher-payroll/paies', { params: { periode_paie_id: selected } })).data,
    enabled: !!selected,
  });
  const paies = useMemo(() => toArray<Paie>(paiesResp), [paiesResp]);

  const totalNet = useMemo(() => paies.reduce((s, p) => s + Number(p.net_a_payer || 0), 0), [paies]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/teacher-payroll/periodes', form)).data,
    onSuccess: () => { setCreateOpen(false); notify('Période créée.'); qc.invalidateQueries({ queryKey: ['tp-periodes'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const calcMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/teacher-payroll/periodes/${id}/calculer`)).data,
    onSuccess: (d: any) => { notify(d?.message ?? 'Calcul terminé.'); qc.invalidateQueries({ queryKey: ['tp-periodes'] }); qc.invalidateQueries({ queryKey: ['tp-paies', selected] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const validatePeriodeMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/teacher-payroll/periodes/${id}/valider`)).data,
    onSuccess: (d: any) => { notify(d?.message ?? 'Période validée.'); qc.invalidateQueries({ queryKey: ['tp-periodes'] }); qc.invalidateQueries({ queryKey: ['tp-paies', selected] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const validatePaieMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/teacher-payroll/paies/${id}/valider`)).data,
    onSuccess: () => { notify('Paie validée.'); qc.invalidateQueries({ queryKey: ['tp-paies', selected] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const payMutation = useMutation({
    mutationFn: async () => (await api().post(`/admin/teacher-payroll/paies/${payFor!.id}/paiement`, {
      montant: Number(payForm.montant), mode_reglement: payForm.mode_reglement, reference: payForm.reference || null,
    })).data,
    onSuccess: () => { setPayFor(null); setPayForm({ montant: '', mode_reglement: 'ESPECES', reference: '' }); notify('Paiement enregistré.'); qc.invalidateQueries({ queryKey: ['tp-paies', selected] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const openFiche = async (paie: Paie) => {
    try {
      const res = await api().get(`/admin/teacher-payroll/paies/${paie.id}/fiche-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (e: any) {
      notify(firstError(e), 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Périodes & Paies</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle période</Button>
      </Box>

      <Grid container spacing={3}>
        {/* Liste des périodes */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Périodes de paie</Typography>
              {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
              {!isLoading && periodes.length === 0 && <Alert severity="info">Aucune période. Créez-en une.</Alert>}
              {periodes.map(p => (
                <Paper key={p.id} variant="outlined" onClick={() => setSelected(p.id)}
                  sx={{ p: 1.5, mb: 1, cursor: 'pointer', borderColor: selected === p.id ? 'primary.main' : undefined, borderWidth: selected === p.id ? 2 : 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="bold">{MOIS[p.mois]} {p.annee}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.paies_count ?? 0} paie(s){p.est_vacances ? ' • Vacances' : ''}</Typography>
                    </Box>
                    <Chip size="small" label={p.statut} color={PERIODE_COLORS[p.statut] ?? 'default'} />
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Détail période sélectionnée */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              {!selectedPeriode && <Alert severity="info">Sélectionnez une période pour voir et calculer les paies.</Alert>}
              {selectedPeriode && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6">{MOIS[selectedPeriode.mois]} {selectedPeriode.annee} — Total net : {fmtMoney(totalNet)}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" disabled={calcMutation.isPending || ['PAYEE', 'CLOTUREE'].includes(selectedPeriode.statut)} onClick={() => calcMutation.mutate(selectedPeriode.id)}>
                        {calcMutation.isPending ? 'Calcul…' : 'Calculer les paies'}
                      </Button>
                      <Button size="small" variant="outlined" disabled={validatePeriodeMutation.isPending} onClick={() => validatePeriodeMutation.mutate(selectedPeriode.id)}>
                        Valider la période
                      </Button>
                    </Box>
                  </Box>

                  {paiesLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
                  {!paiesLoading && paies.length === 0 && <Alert severity="info">Aucune paie. Cliquez sur « Calculer les paies ».</Alert>}
                  {!paiesLoading && paies.length > 0 && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead><TableRow>
                          <TableCell>Professeur</TableCell><TableCell>Mode</TableCell><TableCell align="right">Brut</TableCell>
                          <TableCell align="right">Retenues</TableCell><TableCell align="right">Net à payer</TableCell><TableCell>Statut</TableCell><TableCell align="right">Actions</TableCell>
                        </TableRow></TableHead>
                        <TableBody>
                          {paies.map(p => (
                            <TableRow key={p.id} hover>
                              <TableCell>{p.professeur ? `${p.professeur.prenom} ${p.professeur.nom}` : `#${p.professeur_id}`}</TableCell>
                              <TableCell>{p.mode_paiement}</TableCell>
                              <TableCell align="right">{fmtMoney(p.montant_brut)}</TableCell>
                              <TableCell align="right">{fmtMoney(p.total_retenues)}</TableCell>
                              <TableCell align="right"><b>{fmtMoney(p.net_a_payer)}</b></TableCell>
                              <TableCell><Chip size="small" label={p.statut} color={PAIE_COLORS[p.statut] ?? 'default'} /></TableCell>
                              <TableCell align="right">
                                {p.statut === 'CALCULEE' && <Button size="small" onClick={() => validatePaieMutation.mutate(p.id)}>Valider</Button>}
                                {['VALIDEE', 'PARTIELLEMENT_PAYEE'].includes(p.statut) && <Button size="small" color="success" onClick={() => { setPayFor(p); setPayForm({ montant: String(Math.max(0, Number(p.net_a_payer) - Number(p.montant_paye))), mode_reglement: 'ESPECES', reference: '' }); }}>Payer</Button>}
                                <Button size="small" onClick={() => openFiche(p)}>Fiche PDF</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Création période */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nouvelle période de paie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Mois" value={form.mois} onChange={e => setForm(f => ({ ...f, mois: Number(e.target.value) }))} fullWidth>
                {MOIS.slice(1).map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
              </TextField>
              <TextField label="Année" type="number" value={form.annee} onChange={e => setForm(f => ({ ...f, annee: Number(e.target.value) }))} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Début" type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Fin" type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Box>
            <FormControlLabel control={<Switch checked={form.est_vacances} onChange={e => setForm(f => ({ ...f, est_vacances: e.target.checked }))} />} label="Période de vacances scolaires" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>{createMutation.isPending ? 'Création…' : 'Créer'}</Button>
        </DialogActions>
      </Dialog>

      {/* Enregistrer paiement */}
      <Dialog open={!!payFor} onClose={() => setPayFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Enregistrer un paiement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">Net à payer : {fmtMoney(payFor?.net_a_payer)} — Déjà réglé : {fmtMoney(payFor?.montant_paye)}</Alert>
            <TextField label="Montant" type="number" value={payForm.montant} onChange={e => setPayForm(f => ({ ...f, montant: e.target.value }))} fullWidth />
            <TextField select label="Mode de règlement" value={payForm.mode_reglement} onChange={e => setPayForm(f => ({ ...f, mode_reglement: e.target.value }))} fullWidth>
              {REGLEMENTS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField label="Référence (optionnel)" value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayFor(null)}>Annuler</Button>
          <Button variant="contained" disabled={!payForm.montant || payMutation.isPending} onClick={() => payMutation.mutate()}>{payMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

function firstError(e: any): string {
  const errs = e?.response?.data?.errors;
  if (errs) return Object.values(errs).flat()[0] as string;
  return e?.response?.data?.message ?? 'Une erreur est survenue.';
}

export default TeacherPayrollPeriodes;
