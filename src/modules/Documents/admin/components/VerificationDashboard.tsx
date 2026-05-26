'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

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

interface ApiStudent {
  id: number;
  firstname?: string;
  lastname?: string;
  matricule?: string;
}

interface ApiRegisterDoc {
  id: number;
  document_type: string;
  document_number: string;
  issue_date: string | null;
  status: string;
  verification_code: string | null;
  student?: ApiStudent | null;
}

interface VerifyResult {
  valid: boolean;
  message?: string;
  document?: {
    document_number: string;
    document_type: string;
    student_name: string;
    student_matricule: string;
    issue_date: string;
    academic_year?: string | null;
    status: string;
    verification_code?: string;
  };
  verification?: {
    verified_at: string;
    verification_count: number;
  };
}

interface VerificationStats {
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
  success_rate: number;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  transcript_semester: 'Relevé semestriel',
  transcript_global: 'Relevé global',
  transcript_provisional: 'Relevé provisoire',
  diploma: 'Diplôme',
  diploma_duplicate: 'Duplicata diplôme',
  diploma_supplement: 'Supplément diplôme',
  certificate_enrollment: "Attestation d'inscription",
  certificate_status: 'Attestation de statut',
  certificate_achievement: 'Attestation de réussite',
  certificate_attendance: "Attestation d'assiduité",
  certificate_schooling: 'Certificat de scolarité',
  certificate_transfer: 'Certificat de transfert',
  student_card: 'Carte étudiant',
  access_badge: "Badge d'accès",
};

const STATUS_LABELS: Record<string, string> = {
  issued: 'Émis',
  cancelled: 'Annulé',
  replaced: 'Remplacé',
};

const fmtDate = (d: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const studentName = (s?: ApiStudent | null): string => (s ? `${s.firstname ?? ''} ${s.lastname ?? ''}`.trim() || '—' : '—');

export const VerificationDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [docNumber, setDocNumber] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: registerResp, isLoading, isError } = useQuery({
    queryKey: ['document-register'],
    queryFn: async () => (await api().get('/admin/documents/verification/register', { params: { per_page: 200 } })).data,
  });
  const register = useMemo(() => toArray<ApiRegisterDoc>(registerResp), [registerResp]);

  const { data: stats } = useQuery<VerificationStats>({
    queryKey: ['verification-statistics'],
    queryFn: async () => (await api().get('/admin/documents/verification/statistics')).data,
  });

  const verifyMutation = useMutation({
    mutationFn: async (documentNumber: string) =>
      (await api().post('/admin/documents/verification/document-number', { document_number: documentNumber })).data as VerifyResult,
    onSuccess: (data) => {
      setVerifyResult(data);
      setVerifyOpen(false);
      setResultOpen(true);
    },
    onError: (e: any) => setSnackbar({ open: true, message: e?.response?.data?.message ?? 'Échec de la vérification.', severity: 'error' }),
  });

  const totalDocuments = register.length;
  const issuedDocuments = register.filter(d => d.status === 'issued').length;
  const totalVerifications = stats?.total_verifications ?? 0;
  const successRate = stats?.success_rate ?? 0;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Documents Officiels</Link>
        <Typography color="text.primary">Vérification</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Vérification &amp; Registre des Documents</Typography>
        <Button variant="contained" onClick={() => { setDocNumber(''); setVerifyOpen(true); }}>Vérifier un Document</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Documents enregistrés', value: totalDocuments, color: '#1976d2' },
          { label: 'Documents émis', value: issuedDocuments, color: '#4caf50' },
          { label: 'Vérifications totales', value: totalVerifications, color: '#9c27b0' },
          { label: 'Taux de succès', value: `${successRate}%`, color: '#ff9800' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
            <Tab label="Registre Documents" />
          </Tabs>

          {tabIndex === 0 && (
            <>
              {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
              {isError && <Alert severity="error">Erreur lors du chargement du registre.</Alert>}
              {!isLoading && !isError && register.length === 0 && <Alert severity="info">Aucun document enregistré.</Alert>}
              {!isLoading && !isError && register.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>N° Document</TableCell>
                        <TableCell>Étudiant</TableCell>
                        <TableCell>Émis le</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Code de vérification</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {register.map(doc => (
                        <TableRow key={doc.id} hover>
                          <TableCell>
                            <Chip size="small" label={DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type} variant="outlined" />
                          </TableCell>
                          <TableCell><Typography fontWeight="medium">{doc.document_number}</Typography></TableCell>
                          <TableCell>
                            <Typography variant="body2">{studentName(doc.student)}</Typography>
                            <Typography variant="caption" color="text.secondary">{doc.student?.matricule ?? ''}</Typography>
                          </TableCell>
                          <TableCell>{fmtDate(doc.issue_date)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={STATUS_LABELS[doc.status] ?? doc.status} color={doc.status === 'issued' ? 'success' : 'default'} />
                          </TableCell>
                          <TableCell>
                            {doc.verification_code ? <Chip size="small" label={doc.verification_code} /> : '—'}
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

      <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Vérifier un Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Entrez le numéro de document pour vérifier son authenticité auprès du registre.
            </Alert>
            <TextField label="N° de document" fullWidth autoFocus
              placeholder="Ex: DIP-2026-001"
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!docNumber.trim() || verifyMutation.isPending}
            onClick={() => verifyMutation.mutate(docNumber.trim())}>
            {verifyMutation.isPending ? 'Vérification…' : 'Vérifier'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resultOpen} onClose={() => setResultOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Résultat de la Vérification</DialogTitle>
        <DialogContent>
          {verifyResult && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity={verifyResult.valid ? 'success' : 'error'}>
                {verifyResult.valid
                  ? 'Ce document est authentique et valide.'
                  : (verifyResult.message ?? "Ce document n'est pas valide ou est introuvable.")}
              </Alert>
              {verifyResult.valid && verifyResult.document && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                      <Typography fontWeight="bold">{verifyResult.document.document_type}</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">N° Document</Typography>
                      <Typography fontWeight="bold">{verifyResult.document.document_number}</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                      <Typography fontWeight="bold">{verifyResult.document.student_name}</Typography>
                      <Typography variant="body2">{verifyResult.document.student_matricule}</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Émis le</Typography>
                      <Typography fontWeight="bold">{verifyResult.document.issue_date}</Typography>
                    </Paper>
                  </Grid>
                  {verifyResult.verification && (
                    <Grid size={{ xs: 12 }}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Vérifications</Typography>
                        <Typography fontWeight="bold">{verifyResult.verification.verification_count}</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
