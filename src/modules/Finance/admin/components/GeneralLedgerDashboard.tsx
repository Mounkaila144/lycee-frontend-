'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

const fmtMoney = (n: any) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n ?? 0))) + ' F CFA';
const METHOD_LABELS: Record<string, string> = { cash: 'Espèces', bank_transfer: 'Virement', check: 'Chèque', mobile_money: 'Mobile Money', card: 'Carte', online: 'En ligne' };

interface Resultat {
  periode: { debut: string; fin: string };
  recettes: { total: number; par_methode: Record<string, number> };
  sorties: {
    salaires_employes: number;
    salaires_professeurs: number;
    depenses: { total: number; par_categorie: { categorie: string; icon: string | null; total: number }[] };
    total: number;
  };
  resultat_net: number;
  est_benefice: boolean;
  tendance_mensuelle: { mois: string; recettes: number; sorties: number; resultat: number }[];
}

export const GeneralLedgerDashboard: React.FC = () => {
  const year = new Date().getFullYear();
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(`${year}-12-31`);

  const { data: resp, isLoading } = useQuery({
    queryKey: ['general-ledger', from, to],
    queryFn: async () => (await api().get('/admin/finance/general-ledger/resultat', { params: { date_debut: from, date_fin: to } })).data,
  });
  const r = useMemo(() => (resp as any)?.data as Resultat | undefined, [resp]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Bilan / Résultat</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Comptabilité de trésorerie : ce qui entre (paiements des élèves) moins ce qui sort (salaires + dépenses).
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" label="Du" type="date" value={from} onChange={e => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" label="Au" type="date" value={to} onChange={e => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </CardContent>
      </Card>

      {isLoading && <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>}

      {!isLoading && r && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: '4px solid #2e7d32' }}><CardContent>
                <Typography variant="body2" color="text.secondary">Recettes (élèves)</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#2e7d32' }}>{fmtMoney(r.recettes.total)}</Typography>
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: '4px solid #ef6c00' }}><CardContent>
                <Typography variant="body2" color="text.secondary">Salaires (employés + profs)</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ef6c00' }}>{fmtMoney(r.sorties.salaires_employes + r.sorties.salaires_professeurs)}</Typography>
                <Typography variant="caption" color="text.secondary">Emp. {fmtMoney(r.sorties.salaires_employes)} · Profs {fmtMoney(r.sorties.salaires_professeurs)}</Typography>
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: '4px solid #e53935' }}><CardContent>
                <Typography variant="body2" color="text.secondary">Dépenses</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#e53935' }}>{fmtMoney(r.sorties.depenses.total)}</Typography>
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderTop: `4px solid ${r.est_benefice ? '#1565c0' : '#b71c1c'}`, bgcolor: r.est_benefice ? '#e3f2fd' : '#ffebee' }}><CardContent>
                <Typography variant="body2" color="text.secondary">Résultat net</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: r.est_benefice ? '#1565c0' : '#b71c1c' }}>{fmtMoney(r.resultat_net)}</Typography>
                <Chip size="small" label={r.est_benefice ? 'BÉNÉFICE' : 'PERTE'} color={r.est_benefice ? 'primary' : 'error'} sx={{ mt: 0.5 }} />
              </CardContent></Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card><CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Dépenses par catégorie</Typography>
                {r.sorties.depenses.par_categorie.length === 0 && <Alert severity="info">Aucune dépense sur la période.</Alert>}
                {r.sorties.depenses.par_categorie.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {r.sorties.depenses.par_categorie.map((c, i) => (
                          <TableRow key={i}><TableCell>{c.icon} {c.categorie}</TableCell><TableCell align="right">{fmtMoney(c.total)}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card><CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Recettes par méthode</Typography>
                {Object.keys(r.recettes.par_methode).length === 0 && <Alert severity="info">Aucune recette sur la période.</Alert>}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(r.recettes.par_methode).map(([m, v]) => (
                    <Chip key={m} label={`${METHOD_LABELS[m] ?? m} : ${fmtMoney(v)}`} color="success" variant="outlined" />
                  ))}
                </Box>
              </CardContent></Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Tendance mensuelle</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Mois</TableCell><TableCell align="right">Recettes</TableCell><TableCell align="right">Sorties</TableCell><TableCell align="right">Résultat</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {r.tendance_mensuelle.map(m => (
                      <TableRow key={m.mois} hover>
                        <TableCell>{m.mois}</TableCell>
                        <TableCell align="right" sx={{ color: '#2e7d32' }}>{fmtMoney(m.recettes)}</TableCell>
                        <TableCell align="right" sx={{ color: '#e53935' }}>{fmtMoney(m.sorties)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: m.resultat >= 0 ? '#1565c0' : '#b71c1c' }}>{fmtMoney(m.resultat)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default GeneralLedgerDashboard;
