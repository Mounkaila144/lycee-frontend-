'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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

const TYPES_PRIME = ['Transport', 'Responsabilité', 'Rendement', 'Exceptionnelle', 'Correction', 'Surveillance examen'];
const TYPES_RETENUE = ['Absence', 'Retard', 'Avance sur salaire', 'Dette', 'Sanction', 'Erreur de paiement'];
const AVANCE_COLORS: Record<string, any> = { EN_ATTENTE: 'default', APPROUVEE: 'info', DEDUITE: 'success', ANNULEE: 'error' };

interface Professeur { id: number; nom: string; prenom: string; }
interface Periode { id: number; mois: number; annee: number; }
interface Ligne { id: number; libelle?: string; type_prime?: string; type_retenue?: string; montant: string; professeur?: Professeur; periode_paie_id?: number | null; }
interface Avance { id: number; montant: string; montant_deduit: string; date_avance: string; motif: string | null; statut: string; professeur?: Professeur; }
interface Absence { id: number; date_absence: string; nombre_heures: string; motif: string | null; justifiee: boolean; impact_sur_paie: boolean; montant_retenue: string; professeur?: Professeur; }

export const TeacherPayrollAjustements: React.FC = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);
  const [profId, setProfId] = useState('');
  const [periodeId, setPeriodeId] = useState('');
  const [dialog, setDialog] = useState<null | 'prime' | 'retenue' | 'avance' | 'absence'>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({
    type: '', libelle: '', montant: '', description: '',
    date_avance: new Date().toISOString().slice(0, 10), motif: '',
    date_absence: new Date().toISOString().slice(0, 10), nombre_heures: '', justifiee: false, impact_sur_paie: true, montant_retenue: '',
  });
  const resetForm = () => setForm(f => ({ ...f, type: '', libelle: '', montant: '', description: '', motif: '', nombre_heures: '', montant_retenue: '' }));

  const { data: profsResp } = useQuery({ queryKey: ['tp-professeurs-min'], queryFn: async () => (await api().get('/admin/teacher-payroll/professeurs', { params: { per_page: 200 } })).data });
  const professeurs = useMemo(() => toArray<Professeur>(profsResp), [profsResp]);

  const { data: periodesResp } = useQuery({ queryKey: ['tp-periodes'], queryFn: async () => (await api().get('/admin/teacher-payroll/periodes')).data });
  const periodes = useMemo(() => toArray<Periode>(periodesResp), [periodesResp]);

  const commonParams = { professeur_id: profId || undefined, periode_paie_id: periodeId || undefined };

  const primesQ = useQuery({ queryKey: ['tp-primes', profId, periodeId], queryFn: async () => (await api().get('/admin/teacher-payroll/primes', { params: commonParams })).data });
  const retenuesQ = useQuery({ queryKey: ['tp-retenues', profId, periodeId], queryFn: async () => (await api().get('/admin/teacher-payroll/retenues', { params: commonParams })).data });
  const avancesQ = useQuery({ queryKey: ['tp-avances', profId], queryFn: async () => (await api().get('/admin/teacher-payroll/avances', { params: { professeur_id: profId || undefined } })).data });
  const absencesQ = useQuery({ queryKey: ['tp-absences', profId], queryFn: async () => (await api().get('/admin/teacher-payroll/absences', { params: { professeur_id: profId || undefined } })).data });

  const primes = useMemo(() => toArray<Ligne>(primesQ.data), [primesQ.data]);
  const retenues = useMemo(() => toArray<Ligne>(retenuesQ.data), [retenuesQ.data]);
  const avances = useMemo(() => toArray<Avance>(avancesQ.data), [avancesQ.data]);
  const absences = useMemo(() => toArray<Absence>(absencesQ.data), [absencesQ.data]);

  const invalidate = (keys: string[]) => keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));

  const createMutation = useMutation({
    mutationFn: async () => {
      if (dialog === 'prime') {
        return (await api().post('/admin/teacher-payroll/primes', { professeur_id: Number(profId), periode_paie_id: periodeId ? Number(periodeId) : null, type_prime: form.type || null, libelle: form.libelle, montant: Number(form.montant), description: form.description || null })).data;
      }
      if (dialog === 'retenue') {
        return (await api().post('/admin/teacher-payroll/retenues', { professeur_id: Number(profId), periode_paie_id: periodeId ? Number(periodeId) : null, type_retenue: form.type || null, libelle: form.libelle, montant: Number(form.montant), description: form.description || null })).data;
      }
      if (dialog === 'avance') {
        return (await api().post('/admin/teacher-payroll/avances', { professeur_id: Number(profId), montant: Number(form.montant), date_avance: form.date_avance, motif: form.motif || null, periode_deduction_id: periodeId ? Number(periodeId) : null })).data;
      }
      return (await api().post('/admin/teacher-payroll/absences', { professeur_id: Number(profId), date_absence: form.date_absence, nombre_heures: form.nombre_heures ? Number(form.nombre_heures) : 0, motif: form.motif || null, justifiee: form.justifiee, impact_sur_paie: form.impact_sur_paie, montant_retenue: form.montant_retenue ? Number(form.montant_retenue) : 0 })).data;
    },
    onSuccess: () => { const k = dialog; setDialog(null); resetForm(); notify('Enregistré.'); invalidate([`tp-${k}s`]); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ kind, id }: { kind: string; id: number }) => (await api().delete(`/admin/teacher-payroll/${kind}/${id}`)).data,
    onSuccess: (_d, v) => { notify('Supprimé.'); invalidate([`tp-${v.kind}`]); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const avanceActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'approuver' | 'annuler' }) => (await api().post(`/admin/teacher-payroll/avances/${id}/${action}`)).data,
    onSuccess: () => { notify('Avance mise à jour.'); invalidate(['tp-avances']); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const needsProf = !profId;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Primes, retenues & avances</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField select size="small" label="Professeur" value={profId} onChange={e => setProfId(e.target.value)} sx={{ minWidth: 220 }}>
            <MenuItem value="">Tous</MenuItem>
            {professeurs.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Période (primes/retenues)" value={periodeId} onChange={e => setPeriodeId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Toutes</MenuItem>
            {periodes.map(p => <MenuItem key={p.id} value={p.id}>{MOIS[p.mois]} {p.annee}</MenuItem>)}
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Primes" /><Tab label="Retenues" /><Tab label="Avances" /><Tab label="Absences" />
          </Tabs>

          {needsProf && <Alert severity="info" sx={{ mb: 2 }}>Sélectionnez un professeur pour ajouter une prime, retenue, avance ou absence.</Alert>}

          {/* PRIMES */}
          {tab === 0 && (
            <Section title="Primes" onAdd={() => { resetForm(); setDialog('prime'); }} canAdd={!needsProf} loading={primesQ.isLoading} empty={primes.length === 0}>
              <Table size="small">
                <TableHead><TableRow><TableCell>Professeur</TableCell><TableCell>Libellé</TableCell><TableCell>Type</TableCell><TableCell align="right">Montant</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                <TableBody>{primes.map(l => (
                  <TableRow key={l.id} hover>
                    <TableCell>{l.professeur ? `${l.professeur.prenom} ${l.professeur.nom}` : '—'}</TableCell>
                    <TableCell>{l.libelle}</TableCell><TableCell>{l.type_prime ?? '—'}</TableCell>
                    <TableCell align="right">{fmtMoney(l.montant)}</TableCell>
                    <TableCell align="right"><Button size="small" color="error" onClick={() => deleteMutation.mutate({ kind: 'primes', id: l.id })}>Suppr.</Button></TableCell>
                  </TableRow>))}</TableBody>
              </Table>
            </Section>
          )}

          {/* RETENUES */}
          {tab === 1 && (
            <Section title="Retenues" onAdd={() => { resetForm(); setDialog('retenue'); }} canAdd={!needsProf} loading={retenuesQ.isLoading} empty={retenues.length === 0}>
              <Table size="small">
                <TableHead><TableRow><TableCell>Professeur</TableCell><TableCell>Libellé</TableCell><TableCell>Type</TableCell><TableCell align="right">Montant</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                <TableBody>{retenues.map(l => (
                  <TableRow key={l.id} hover>
                    <TableCell>{l.professeur ? `${l.professeur.prenom} ${l.professeur.nom}` : '—'}</TableCell>
                    <TableCell>{l.libelle}</TableCell><TableCell>{l.type_retenue ?? '—'}</TableCell>
                    <TableCell align="right">{fmtMoney(l.montant)}</TableCell>
                    <TableCell align="right"><Button size="small" color="error" onClick={() => deleteMutation.mutate({ kind: 'retenues', id: l.id })}>Suppr.</Button></TableCell>
                  </TableRow>))}</TableBody>
              </Table>
            </Section>
          )}

          {/* AVANCES */}
          {tab === 2 && (
            <Section title="Avances" onAdd={() => { resetForm(); setDialog('avance'); }} canAdd={!needsProf} loading={avancesQ.isLoading} empty={avances.length === 0}>
              <Table size="small">
                <TableHead><TableRow><TableCell>Professeur</TableCell><TableCell>Date</TableCell><TableCell align="right">Montant</TableCell><TableCell align="right">Déduit</TableCell><TableCell>Statut</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                <TableBody>{avances.map(a => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.professeur ? `${a.professeur.prenom} ${a.professeur.nom}` : '—'}</TableCell>
                    <TableCell>{a.date_avance?.slice(0, 10)}</TableCell>
                    <TableCell align="right">{fmtMoney(a.montant)}</TableCell>
                    <TableCell align="right">{fmtMoney(a.montant_deduit)}</TableCell>
                    <TableCell><Chip size="small" label={a.statut} color={AVANCE_COLORS[a.statut] ?? 'default'} /></TableCell>
                    <TableCell align="right">
                      {a.statut === 'EN_ATTENTE' && <Button size="small" onClick={() => avanceActionMutation.mutate({ id: a.id, action: 'approuver' })}>Approuver</Button>}
                      {['EN_ATTENTE', 'APPROUVEE'].includes(a.statut) && <Button size="small" color="error" onClick={() => avanceActionMutation.mutate({ id: a.id, action: 'annuler' })}>Annuler</Button>}
                    </TableCell>
                  </TableRow>))}</TableBody>
              </Table>
            </Section>
          )}

          {/* ABSENCES */}
          {tab === 3 && (
            <Section title="Absences" onAdd={() => { resetForm(); setDialog('absence'); }} canAdd={!needsProf} loading={absencesQ.isLoading} empty={absences.length === 0}>
              <Table size="small">
                <TableHead><TableRow><TableCell>Professeur</TableCell><TableCell>Date</TableCell><TableCell align="right">Heures</TableCell><TableCell>Justifiée</TableCell><TableCell>Impact paie</TableCell><TableCell align="right">Retenue</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                <TableBody>{absences.map(a => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.professeur ? `${a.professeur.prenom} ${a.professeur.nom}` : '—'}</TableCell>
                    <TableCell>{a.date_absence?.slice(0, 10)}</TableCell>
                    <TableCell align="right">{Number(a.nombre_heures)}</TableCell>
                    <TableCell><Chip size="small" label={a.justifiee ? 'Oui' : 'Non'} color={a.justifiee ? 'success' : 'default'} /></TableCell>
                    <TableCell><Chip size="small" label={a.impact_sur_paie ? 'Oui' : 'Non'} color={a.impact_sur_paie ? 'warning' : 'default'} /></TableCell>
                    <TableCell align="right">{fmtMoney(a.montant_retenue)}</TableCell>
                    <TableCell align="right"><Button size="small" color="error" onClick={() => deleteMutation.mutate({ kind: 'absences', id: a.id })}>Suppr.</Button></TableCell>
                  </TableRow>))}</TableBody>
              </Table>
            </Section>
          )}
        </CardContent>
      </Card>

      {/* Dialog création */}
      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{({ prime: 'Nouvelle prime', retenue: 'Nouvelle retenue', avance: 'Nouvelle avance', absence: 'Nouvelle absence' } as Record<string, string>)[dialog ?? '']}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {(dialog === 'prime' || dialog === 'retenue') && (<>
              <TextField select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} fullWidth>
                <MenuItem value="">—</MenuItem>
                {(dialog === 'prime' ? TYPES_PRIME : TYPES_RETENUE).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField label="Libellé" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} fullWidth />
              <TextField label="Montant (F CFA)" type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} fullWidth />
              {periodeId ? <Alert severity="info">Rattachée à la période sélectionnée.</Alert> : <Alert severity="warning">Aucune période sélectionnée : la ligne ne sera pas rattachée à une paie.</Alert>}
            </>)}

            {dialog === 'avance' && (<>
              <TextField label="Montant (F CFA)" type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} fullWidth />
              <TextField label="Date" type="date" value={form.date_avance} onChange={e => setForm(f => ({ ...f, date_avance: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Motif" value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} fullWidth />
              {periodeId ? <Alert severity="info">Déduite sur la période sélectionnée (après approbation).</Alert> : <Alert severity="warning">Choisissez une période pour planifier la déduction.</Alert>}
            </>)}

            {dialog === 'absence' && (<>
              <TextField label="Date" type="date" value={form.date_absence} onChange={e => setForm(f => ({ ...f, date_absence: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Nombre d'heures" type="number" value={form.nombre_heures} onChange={e => setForm(f => ({ ...f, nombre_heures: e.target.value }))} fullWidth />
              <TextField label="Motif" value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} fullWidth />
              <FormControlLabel control={<Switch checked={form.justifiee} onChange={e => setForm(f => ({ ...f, justifiee: e.target.checked }))} />} label="Absence justifiée" />
              <FormControlLabel control={<Switch checked={form.impact_sur_paie} onChange={e => setForm(f => ({ ...f, impact_sur_paie: e.target.checked }))} />} label="Impacte la paie" />
              {form.impact_sur_paie && <TextField label="Montant retenue (F CFA)" type="number" value={form.montant_retenue} onChange={e => setForm(f => ({ ...f, montant_retenue: e.target.value }))} fullWidth />}
            </>)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" disabled={createMutation.isPending || (['prime', 'retenue'].includes(dialog ?? '') && (!form.libelle || !form.montant)) || (dialog === 'avance' && !form.montant)} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

const Section: React.FC<{ title: string; onAdd: () => void; canAdd: boolean; loading: boolean; empty: boolean; children: React.ReactNode }> = ({ title, onAdd, canAdd, loading, empty, children }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
      <Button variant="contained" size="small" disabled={!canAdd} onClick={onAdd}>+ Ajouter</Button>
    </Box>
    {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
    {!loading && empty && <Alert severity="info">Aucune ligne.</Alert>}
    {!loading && !empty && <TableContainer component={Paper} variant="outlined">{children}</TableContainer>}
  </Box>
);

function firstError(e: any): string {
  const errs = e?.response?.data?.errors;
  if (errs) return Object.values(errs).flat()[0] as string;
  return e?.response?.data?.message ?? 'Une erreur est survenue.';
}

export default TeacherPayrollAjustements;
