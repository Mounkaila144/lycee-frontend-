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

const STATUTS = ['PERMANENT', 'CONTRACTUEL', 'VACATAIRE', 'FONCTIONNAIRE_INTERVENANT', 'INTERVENANT_EXTERNE', 'REMPLACANT'];
const MODES = ['MENSUEL', 'HORAIRE', 'HYBRIDE', 'FORFAIT'];
const MODE_LABELS: Record<string, string> = { MENSUEL: 'Mensuel', HORAIRE: 'Horaire', HYBRIDE: 'Hybride', FORFAIT: 'Forfait' };
const MODE_COLORS: Record<string, 'primary' | 'secondary' | 'info' | 'warning'> = { MENSUEL: 'primary', HORAIRE: 'info', HYBRIDE: 'secondary', FORFAIT: 'warning' };
const fmtMoney = (n: any) => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');

interface Contrat {
  id: number;
  mode_paiement: string;
  salaire_base: string | number;
  taux_horaire: string | number;
  taux_heure_supplementaire: string | number;
  montant_forfait: string | number;
  volume_horaire_mensuel_prevu: string | number | null;
  paiement_pendant_vacances: boolean;
  date_debut: string;
  date_fin: string | null;
  statut: string;
}

interface Professeur {
  id: number;
  user_id: number | null;
  matricule: string | null;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string | null;
  statut_professeur: string;
  actif: boolean;
  contrat_actif?: Contrat | null;
  user?: { id: number; username: string; firstname: string | null; lastname: string | null } | null;
}

interface Candidat { id: number; username: string; firstname: string | null; lastname: string | null; email: string | null; phone: string | null; }

const emptyContrat = () => ({
  mode_paiement: 'MENSUEL',
  type_contrat: '',
  salaire_base: '',
  taux_horaire: '',
  taux_heure_supplementaire: '',
  montant_forfait: '',
  volume_horaire_mensuel_prevu: '',
  paiement_pendant_vacances: false,
  date_debut: new Date().toISOString().slice(0, 10),
  date_fin: '',
});

export const TeacherPayrollProfesseurs: React.FC = () => {
  const qc = useQueryClient();
  const [importOpen, setImportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [contratFor, setContratFor] = useState<Professeur | null>(null);
  const [importStatut, setImportStatut] = useState('PERMANENT');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', email: '', statut_professeur: 'INTERVENANT_EXTERNE', specialite: '' });
  const [contratForm, setContratForm] = useState(emptyContrat());

  const { data: resp, isLoading } = useQuery({
    queryKey: ['tp-professeurs'],
    queryFn: async () => (await api().get('/admin/teacher-payroll/professeurs', { params: { per_page: 100 } })).data,
  });
  const professeurs = useMemo(() => toArray<Professeur>(resp), [resp]);

  const { data: candResp, isLoading: candLoading } = useQuery({
    queryKey: ['tp-candidats'],
    queryFn: async () => (await api().get('/admin/teacher-payroll/professeurs/candidats-utilisateurs')).data,
    enabled: importOpen,
  });
  const candidats = useMemo(() => toArray<Candidat>(candResp), [candResp]);

  const stats = useMemo(() => {
    const actifs = professeurs.filter(p => p.actif).length;
    const lies = professeurs.filter(p => p.user_id).length;
    return { total: professeurs.length, actifs, lies };
  }, [professeurs]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ['tp-professeurs'] }); qc.invalidateQueries({ queryKey: ['tp-candidats'] }); };

  const importOneMutation = useMutation({
    mutationFn: async (userId: number) => (await api().post('/admin/teacher-payroll/professeurs/importer', { user_id: userId, statut_professeur: importStatut })).data,
    onSuccess: () => { notify('Professeur lié.'); refresh(); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const importAllMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/teacher-payroll/professeurs/importer-tous')).data,
    onSuccess: (d: any) => { setImportOpen(false); notify(d?.message ?? 'Professeurs liés.'); refresh(); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const manualMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/teacher-payroll/professeurs', form)).data,
    onSuccess: () => { setManualOpen(false); setForm(f => ({ ...f, nom: '', prenom: '', telephone: '', email: '', specialite: '' })); notify('Intervenant créé.'); refresh(); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const contratMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        mode_paiement: contratForm.mode_paiement,
        type_contrat: contratForm.type_contrat || null,
        date_debut: contratForm.date_debut,
        date_fin: contratForm.date_fin || null,
        salaire_base: Number(contratForm.salaire_base || 0),
        taux_horaire: Number(contratForm.taux_horaire || 0),
        taux_heure_supplementaire: Number(contratForm.taux_heure_supplementaire || 0),
        montant_forfait: Number(contratForm.montant_forfait || 0),
        volume_horaire_mensuel_prevu: contratForm.volume_horaire_mensuel_prevu ? Number(contratForm.volume_horaire_mensuel_prevu) : null,
        paiement_pendant_vacances: contratForm.paiement_pendant_vacances,
        statut: 'ACTIF',
      };
      return (await api().post(`/admin/teacher-payroll/professeurs/${contratFor!.id}/contrats`, payload)).data;
    },
    onSuccess: () => { setContratFor(null); notify('Configuration de paiement enregistrée.'); qc.invalidateQueries({ queryKey: ['tp-professeurs'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/teacher-payroll/professeurs/${id}/toggle-actif`)).data,
    onSuccess: () => { notify('Statut mis à jour.'); qc.invalidateQueries({ queryKey: ['tp-professeurs'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const openContrat = (p: Professeur) => {
    const c = p.contrat_actif;
    setContratForm(c ? {
      mode_paiement: c.mode_paiement,
      type_contrat: '',
      salaire_base: String(c.salaire_base ?? ''),
      taux_horaire: String(c.taux_horaire ?? ''),
      taux_heure_supplementaire: String(c.taux_heure_supplementaire ?? ''),
      montant_forfait: String(c.montant_forfait ?? ''),
      volume_horaire_mensuel_prevu: c.volume_horaire_mensuel_prevu != null ? String(c.volume_horaire_mensuel_prevu) : '',
      paiement_pendant_vacances: !!c.paiement_pendant_vacances,
      date_debut: c.date_debut?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      date_fin: c.date_fin?.slice(0, 10) ?? '',
    } : emptyContrat());
    setContratFor(p);
  };

  const mode = contratForm.mode_paiement;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" fontWeight="bold">Professeurs — Paie</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={() => setImportOpen(true)}>Lier un professeur (compte)</Button>
          <Button variant="outlined" onClick={() => setManualOpen(true)}>+ Intervenant sans compte</Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Les professeurs sont les <b>utilisateurs ayant le rôle « Professeur »</b>. Liez-les ici pour gérer leur paie (les informations sont reprises de leur compte). La saisie manuelle est réservée aux intervenants externes <b>sans compte de connexion</b>.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Fiches de paie', value: stats.total, color: '#1976d2' },
          { label: 'Liées à un compte', value: stats.lies, color: '#4caf50' },
          { label: 'Actifs', value: stats.actifs, color: '#ff9800' },
        ].map((c, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: c.color }}>{c.value}</Typography>
              <Typography variant="body2" color="text.secondary">{c.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Liste des professeurs</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && professeurs.length === 0 && <Alert severity="info">Aucune fiche. Cliquez sur « Lier un professeur » pour importer un utilisateur Professeur.</Alert>}
          {!isLoading && professeurs.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Nom complet</TableCell><TableCell>Compte</TableCell><TableCell>Téléphone</TableCell><TableCell>Statut</TableCell>
                  <TableCell>Mode paiement</TableCell><TableCell>Rémunération</TableCell><TableCell>Actif</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {professeurs.map(p => {
                    const c = p.contrat_actif;
                    return (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.prenom} {p.nom}</TableCell>
                        <TableCell>{p.user?.username ? <Chip size="small" color="success" variant="outlined" label={p.user.username} /> : <Chip size="small" label="Sans compte" variant="outlined" />}</TableCell>
                        <TableCell>{p.telephone ?? '—'}</TableCell>
                        <TableCell><Chip size="small" variant="outlined" label={p.statut_professeur} /></TableCell>
                        <TableCell>{c ? <Chip size="small" label={MODE_LABELS[c.mode_paiement]} color={MODE_COLORS[c.mode_paiement]} /> : <Chip size="small" label="Non configuré" color="error" variant="outlined" />}</TableCell>
                        <TableCell>{c ? remuLabel(c) : '—'}</TableCell>
                        <TableCell><Chip size="small" label={p.actif ? 'Oui' : 'Non'} color={p.actif ? 'success' : 'default'} /></TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => openContrat(p)}>Configurer paiement</Button>
                          <Button size="small" color={p.actif ? 'warning' : 'success'} onClick={() => toggleMutation.mutate(p.id)}>{p.actif ? 'Désactiver' : 'Activer'}</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Import / liaison depuis les utilisateurs Professeur */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lier un professeur (utilisateur existant)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Statut à appliquer" value={importStatut} onChange={e => setImportStatut(e.target.value)} fullWidth size="small">
              {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            {candLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
            {!candLoading && candidats.length === 0 && <Alert severity="success">Tous les utilisateurs Professeur sont déjà liés.</Alert>}
            {!candLoading && candidats.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Utilisateur</TableCell><TableCell>Compte</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                  <TableBody>
                    {candidats.map(c => (
                      <TableRow key={c.id} hover>
                        <TableCell>{c.firstname} {c.lastname}</TableCell>
                        <TableCell>{c.username}</TableCell>
                        <TableCell align="right"><Button size="small" variant="contained" disabled={importOneMutation.isPending} onClick={() => importOneMutation.mutate(c.id)}>Lier</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Fermer</Button>
          <Button variant="contained" disabled={candidats.length === 0 || importAllMutation.isPending} onClick={() => importAllMutation.mutate()}>
            {importAllMutation.isPending ? 'Liaison…' : `Tout lier (${candidats.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Création manuelle : intervenant sans compte */}
      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Intervenant externe (sans compte)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="warning">À utiliser uniquement pour un intervenant qui n’a <b>pas</b> de compte utilisateur (vacataire / externe). Pour un enseignant disposant d’un compte, utilisez « Lier un professeur ».</Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Prénom" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} fullWidth />
              <TextField label="Nom" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Téléphone" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} fullWidth />
              <TextField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Statut" value={form.statut_professeur} onChange={e => setForm(f => ({ ...f, statut_professeur: e.target.value }))} fullWidth>
                {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Spécialité" value={form.specialite} onChange={e => setForm(f => ({ ...f, specialite: e.target.value }))} fullWidth />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!form.nom || !form.prenom || manualMutation.isPending} onClick={() => manualMutation.mutate()}>
            {manualMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configuration paiement (contrat) */}
      <Dialog open={!!contratFor} onClose={() => setContratFor(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuration de paiement — {contratFor?.prenom} {contratFor?.nom}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Mode de paiement" value={mode} onChange={e => setContratForm(f => ({ ...f, mode_paiement: e.target.value }))} fullWidth>
              {MODES.map(m => <MenuItem key={m} value={m}>{MODE_LABELS[m]}</MenuItem>)}
            </TextField>

            {(mode === 'MENSUEL' || mode === 'HYBRIDE') && (
              <TextField label="Salaire de base (F CFA)" type="number" value={contratForm.salaire_base} onChange={e => setContratForm(f => ({ ...f, salaire_base: e.target.value }))} fullWidth />
            )}
            {mode === 'HORAIRE' && (
              <TextField label="Taux horaire (F CFA / h)" type="number" value={contratForm.taux_horaire} onChange={e => setContratForm(f => ({ ...f, taux_horaire: e.target.value }))} fullWidth />
            )}
            {mode === 'HYBRIDE' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Taux heure supp. (F CFA / h)" type="number" value={contratForm.taux_heure_supplementaire} onChange={e => setContratForm(f => ({ ...f, taux_heure_supplementaire: e.target.value }))} fullWidth />
                <TextField label="Volume mensuel prévu (h)" type="number" value={contratForm.volume_horaire_mensuel_prevu} onChange={e => setContratForm(f => ({ ...f, volume_horaire_mensuel_prevu: e.target.value }))} fullWidth />
              </Box>
            )}
            {mode === 'FORFAIT' && (
              <TextField label="Montant forfait (F CFA)" type="number" value={contratForm.montant_forfait} onChange={e => setContratForm(f => ({ ...f, montant_forfait: e.target.value }))} fullWidth />
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Date de début" type="date" value={contratForm.date_debut} onChange={e => setContratForm(f => ({ ...f, date_debut: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Date de fin (optionnel)" type="date" value={contratForm.date_fin} onChange={e => setContratForm(f => ({ ...f, date_fin: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Box>
            {(mode === 'MENSUEL' || mode === 'HYBRIDE' || mode === 'FORFAIT') && (
              <FormControlLabel control={<Switch checked={contratForm.paiement_pendant_vacances} onChange={e => setContratForm(f => ({ ...f, paiement_pendant_vacances: e.target.checked }))} />} label="Payé pendant les vacances scolaires" />
            )}
            <Alert severity="info">Créer une nouvelle configuration suspend l’ancien contrat actif. Les fiches de paie déjà calculées conservent leurs montants.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContratFor(null)}>Annuler</Button>
          <Button variant="contained" disabled={contratMutation.isPending} onClick={() => contratMutation.mutate()}>
            {contratMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

function remuLabel(c: Contrat): string {
  switch (c.mode_paiement) {
    case 'MENSUEL': return fmtMoney(c.salaire_base) + ' / mois';
    case 'HORAIRE': return fmtMoney(c.taux_horaire) + ' / h';
    case 'HYBRIDE': return fmtMoney(c.salaire_base) + ' + ' + fmtMoney(c.taux_heure_supplementaire) + ' / h supp.';
    case 'FORFAIT': return fmtMoney(c.montant_forfait) + ' (forfait)';
    default: return '—';
  }
}

function firstError(e: any): string {
  const errs = e?.response?.data?.errors;
  if (errs) return Object.values(errs).flat()[0] as string;
  return e?.response?.data?.message ?? 'Une erreur est survenue.';
}

export default TeacherPayrollProfesseurs;
