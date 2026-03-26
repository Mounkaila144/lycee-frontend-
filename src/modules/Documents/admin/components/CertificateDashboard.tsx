'use client';

import React, { useState, useCallback } from 'react';

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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import type {
  Certificate,
  CertificateRequest,
  CertificateType,
  CertificateRequestStatus,
} from '../../types';

import {
  CERTIFICATE_TYPE_LABELS,
  CERTIFICATE_TYPE_COLORS,
  CERTIFICATE_REQUEST_STATUS_LABELS,
  CERTIFICATE_REQUEST_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 1, student_id: 1, academic_year_id: 1, type: 'enrollment',
    purpose: 'Demande de bourse', document_path: '/documents/certificates/CERT-2026-001.pdf',
    document_number: 'CERT-2026-001', generated_at: '2026-03-15T10:00:00',
    valid_until: '2026-09-15', qr_code: 'QR-CERT-001',
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2024-001' },
    created_at: '2026-03-15T10:00:00', updated_at: '2026-03-15T10:00:00',
  },
  {
    id: 2, student_id: 2, academic_year_id: 1, type: 'attendance',
    purpose: 'Justificatif employeur', document_path: '/documents/certificates/CERT-2026-002.pdf',
    document_number: 'CERT-2026-002', generated_at: '2026-03-18T14:00:00',
    valid_until: '2026-06-18', qr_code: 'QR-CERT-002',
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2024-002' },
    created_at: '2026-03-18T14:00:00', updated_at: '2026-03-18T14:00:00',
  },
  {
    id: 3, student_id: 3, academic_year_id: 1, type: 'achievement',
    purpose: null, document_path: '/documents/certificates/CERT-2026-003.pdf',
    document_number: 'CERT-2026-003', generated_at: '2026-03-20T09:00:00',
    valid_until: null, qr_code: 'QR-CERT-003',
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Moussa', matricule: 'ETU-2024-003' },
    created_at: '2026-03-20T09:00:00', updated_at: '2026-03-20T09:00:00',
  },
  {
    id: 4, student_id: 4, academic_year_id: 1, type: 'schooling',
    purpose: 'Visa étudiant', document_path: '/documents/certificates/CERT-2026-004.pdf',
    document_number: 'CERT-2026-004', generated_at: '2026-03-22T11:30:00',
    valid_until: '2026-12-31', qr_code: 'QR-CERT-004',
    student: { id: 4, firstname: 'Aissatou', lastname: 'Bah', matricule: 'ETU-2024-004' },
    created_at: '2026-03-22T11:30:00', updated_at: '2026-03-22T11:30:00',
  },
  {
    id: 5, student_id: 5, academic_year_id: 1, type: 'transfer',
    purpose: 'Transfert vers université de Niamey', document_path: '/documents/certificates/CERT-2026-005.pdf',
    document_number: 'CERT-2026-005', generated_at: '2026-03-24T16:00:00',
    valid_until: '2026-06-30', qr_code: 'QR-CERT-005',
    student: { id: 5, firstname: 'Oumar', lastname: 'Sidibe', matricule: 'ETU-2024-005' },
    created_at: '2026-03-24T16:00:00', updated_at: '2026-03-24T16:00:00',
  },
];

const DEMO_REQUESTS: CertificateRequest[] = [
  {
    id: 1, student_id: 6, certificate_type: 'enrollment',
    reason: 'Besoin pour demande de logement', status: 'pending',
    approved_by: null, rejected_reason: null, certificate_id: null,
    student: { id: 6, firstname: 'Mariama', lastname: 'Abdou', matricule: 'ETU-2024-006' },
    created_at: '2026-03-25T08:00:00', updated_at: '2026-03-25T08:00:00',
  },
  {
    id: 2, student_id: 7, certificate_type: 'status',
    reason: 'Demande employeur', status: 'pending',
    approved_by: null, rejected_reason: null, certificate_id: null,
    student: { id: 7, firstname: 'Moussa', lastname: 'Issa', matricule: 'ETU-2024-007' },
    created_at: '2026-03-25T09:30:00', updated_at: '2026-03-25T09:30:00',
  },
  {
    id: 3, student_id: 1, certificate_type: 'attendance',
    reason: 'Stage obligatoire', status: 'approved',
    approved_by: 1, rejected_reason: null, certificate_id: 2,
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2024-001' },
    created_at: '2026-03-20T10:00:00', updated_at: '2026-03-21T14:00:00',
  },
  {
    id: 4, student_id: 8, certificate_type: 'transfer',
    reason: 'Raison personnelle', status: 'rejected',
    approved_by: null, rejected_reason: 'Dossier incomplet, veuillez fournir les justificatifs', certificate_id: null,
    student: { id: 8, firstname: 'Hawa', lastname: 'Garba', matricule: 'ETU-2024-008' },
    created_at: '2026-03-19T11:00:00', updated_at: '2026-03-22T09:00:00',
  },
];

const getRequestStatusChipColor = (status: CertificateRequestStatus): 'default' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

export const CertificateDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const certificates = DEMO_CERTIFICATES;
  const requests = DEMO_REQUESTS;

  const handleViewDetail = useCallback((certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setDetailOpen(true);
  }, []);

  const handleApprove = useCallback((request: CertificateRequest) => {
    setSnackbar({ open: true, message: `Demande de ${request.student?.firstname} ${request.student?.lastname} approuvée`, severity: 'success' });
  }, []);

  const handleReject = useCallback((request: CertificateRequest) => {
    setSelectedRequest(request);
    setRejectOpen(true);
  }, []);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const totalCertificates = certificates.length;
  const totalRequests = requests.length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Documents Officiels
        </Link>
        <Typography color="text.primary">Attestations</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Attestations
        </Typography>
        <Button variant="contained" onClick={() => setGenerateOpen(true)}>
          + Générer une Attestation
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total attestations', value: totalCertificates, color: '#1976d2' },
          { label: 'Total demandes', value: totalRequests, color: '#9c27b0' },
          { label: 'En attente', value: pendingCount, color: '#ff9800' },
          { label: 'Approuvées', value: approvedCount, color: '#4caf50' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
            <Tab label="Attestations générées" />
            <Tab label={`Demandes (${pendingCount} en attente)`} />
          </Tabs>

          {tabIndex === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Document</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Motif</TableCell>
                    <TableCell>Générée le</TableCell>
                    <TableCell>Valide jusqu&apos;au</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.map(certificate => (
                    <TableRow key={certificate.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{certificate.document_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {certificate.student?.firstname} {certificate.student?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {certificate.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CERTIFICATE_TYPE_LABELS[certificate.type]}
                          sx={{ bgcolor: CERTIFICATE_TYPE_COLORS[certificate.type], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{certificate.purpose || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(certificate.generated_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {certificate.valid_until
                          ? new Date(certificate.valid_until).toLocaleDateString('fr-FR')
                          : 'Illimitée'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetail(certificate)}
                          >
                            Détails
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                          >
                            PDF
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabIndex === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Type demandé</TableCell>
                    <TableCell>Raison</TableCell>
                    <TableCell>Date demande</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map(request => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {request.student?.firstname} {request.student?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CERTIFICATE_TYPE_LABELS[request.certificate_type]}
                          sx={{ bgcolor: CERTIFICATE_TYPE_COLORS[request.certificate_type], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.reason || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CERTIFICATE_REQUEST_STATUS_LABELS[request.status]}
                          color={getRequestStatusChipColor(request.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {request.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApprove(request)}
                            >
                              Approuver
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleReject(request)}
                            >
                              Rejeter
                            </Button>
                          </Box>
                        )}
                        {request.status === 'rejected' && request.rejected_reason && (
                          <Typography variant="caption" color="error">
                            {request.rejected_reason}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Attestation {selectedCertificate?.document_number}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCertificate?.student?.firstname} {selectedCertificate?.student?.lastname}
              </Typography>
            </Box>
            {selectedCertificate && (
              <Chip
                label={CERTIFICATE_TYPE_LABELS[selectedCertificate.type]}
                sx={{ bgcolor: CERTIFICATE_TYPE_COLORS[selectedCertificate.type], color: 'white' }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                <Typography fontWeight="bold">
                  {selectedCertificate?.student?.firstname} {selectedCertificate?.student?.lastname}
                </Typography>
                <Typography variant="body2">{selectedCertificate?.student?.matricule}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Motif</Typography>
                <Typography>{selectedCertificate?.purpose || 'Non spécifié'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Validité</Typography>
                <Typography>
                  {selectedCertificate?.valid_until
                    ? `Jusqu'au ${new Date(selectedCertificate.valid_until).toLocaleDateString('fr-FR')}`
                    : 'Illimitée'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">QR Code</Typography>
                <Typography>{selectedCertificate?.qr_code || 'Non généré'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Certificate Dialog */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Générer une Attestation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type d&apos;attestation</InputLabel>
              <Select label="Type d'attestation" defaultValue="enrollment">
                <MenuItem value="enrollment">Inscription</MenuItem>
                <MenuItem value="status">Statut</MenuItem>
                <MenuItem value="achievement">Réussite</MenuItem>
                <MenuItem value="attendance">Assiduité</MenuItem>
                <MenuItem value="schooling">Scolarité</MenuItem>
                <MenuItem value="transfer">Transfert</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Étudiant</InputLabel>
              <Select label="Étudiant" defaultValue="">
                <MenuItem value={1}>Amadou Diallo (ETU-2024-001)</MenuItem>
                <MenuItem value={2}>Fatima Ousmane (ETU-2024-002)</MenuItem>
                <MenuItem value={3}>Ibrahim Moussa (ETU-2024-003)</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Motif" fullWidth multiline rows={2} placeholder="Raison de la demande" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setGenerateOpen(false);
              setSnackbar({ open: true, message: 'Attestation générée avec succès', severity: 'success' });
            }}
          >
            Générer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeter la Demande</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="warning">
              Demande de {selectedRequest?.student?.firstname} {selectedRequest?.student?.lastname} pour une attestation de{' '}
              {selectedRequest && CERTIFICATE_TYPE_LABELS[selectedRequest.certificate_type]}
            </Alert>
            <TextField
              label="Raison du rejet"
              fullWidth
              multiline
              rows={3}
              placeholder="Expliquez la raison du rejet..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setRejectOpen(false);
              setSnackbar({ open: true, message: 'Demande rejetée', severity: 'success' });
            }}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
