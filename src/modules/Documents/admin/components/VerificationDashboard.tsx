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
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';

import type {
  DocumentVerification,
  ElectronicSignature,
  Archive,
  DocumentRegister,
  DocumentVerificationStatus,
  SignatureStatus,
  ArchiveStatus,
} from '../../types';

import {
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS,
  SIGNATURE_STATUS_LABELS,
  ARCHIVE_STATUS_LABELS,
} from '../../types';

// ──── Demo Data ────

const DEMO_VERIFICATIONS: DocumentVerification[] = [
  {
    id: 1, document_type: 'transcript', document_number: 'TR-2026-001',
    verification_code: 'VER-001-ABC', verified_at: '2026-03-25T10:00:00',
    is_valid: true, status: 'valid', verified_by: 'Employeur XYZ',
    document_data: null, created_at: '2026-03-25T10:00:00',
  },
  {
    id: 2, document_type: 'diploma', document_number: 'DIP-2026-002',
    verification_code: 'VER-002-DEF', verified_at: '2026-03-24T14:00:00',
    is_valid: true, status: 'valid', verified_by: 'Université de Paris',
    document_data: null, created_at: '2026-03-24T14:00:00',
  },
  {
    id: 3, document_type: 'certificate', document_number: 'CERT-2025-099',
    verification_code: 'VER-003-GHI', verified_at: '2026-03-23T09:00:00',
    is_valid: false, status: 'expired', verified_by: 'Ambassade France',
    document_data: null, created_at: '2026-03-23T09:00:00',
  },
  {
    id: 4, document_type: 'diploma', document_number: 'FAKE-001',
    verification_code: 'VER-004-JKL', verified_at: '2026-03-22T16:00:00',
    is_valid: false, status: 'invalid', verified_by: 'Société ABC',
    document_data: null, created_at: '2026-03-22T16:00:00',
  },
];

const DEMO_REGISTER: DocumentRegister[] = [
  { id: 1, document_type: 'Relevé', document_number: 'TR-2026-001', student_name: 'Amadou Diallo', issued_at: '2026-03-20', status: 'Actif', verified_count: 3, last_verified_at: '2026-03-25T10:00:00' },
  { id: 2, document_type: 'Diplôme', document_number: 'DIP-2026-001', student_name: 'Amadou Diallo', issued_at: '2026-03-01', status: 'Actif', verified_count: 5, last_verified_at: '2026-03-24T14:00:00' },
  { id: 3, document_type: 'Attestation', document_number: 'CERT-2026-001', student_name: 'Amadou Diallo', issued_at: '2026-03-15', status: 'Actif', verified_count: 1, last_verified_at: '2026-03-20T09:00:00' },
  { id: 4, document_type: 'Diplôme', document_number: 'DIP-2026-002', student_name: 'Fatima Ousmane', issued_at: '2026-03-05', status: 'Actif', verified_count: 2, last_verified_at: '2026-03-24T14:00:00' },
  { id: 5, document_type: 'Relevé', document_number: 'TR-2026-003', student_name: 'Ibrahim Moussa', issued_at: '2026-03-22', status: 'Actif', verified_count: 0, last_verified_at: null },
];

const DEMO_ARCHIVES: Archive[] = [
  { id: 1, document_type: 'diploma', document_id: 10, document_number: 'DIP-2024-001', status: 'archived', archived_at: '2025-09-01T00:00:00', storage_location: 'Archive A-12', retention_until: '2034-09-01', metadata: null, created_at: '2025-09-01T00:00:00', updated_at: '2025-09-01T00:00:00' },
  { id: 2, document_type: 'transcript', document_id: 20, document_number: 'TR-2024-050', status: 'cold_storage', archived_at: '2025-06-15T00:00:00', storage_location: 'Coffre B-03', retention_until: '2035-06-15', metadata: null, created_at: '2025-06-15T00:00:00', updated_at: '2026-01-10T00:00:00' },
  { id: 3, document_type: 'certificate', document_id: 30, document_number: 'CERT-2024-100', status: 'active', archived_at: '2026-01-01T00:00:00', storage_location: 'Archive A-15', retention_until: '2031-01-01', metadata: null, created_at: '2026-01-01T00:00:00', updated_at: '2026-01-01T00:00:00' },
];

const DEMO_SIGNATURES: ElectronicSignature[] = [
  { id: 1, document_type: 'diploma', document_id: 1, signer_name: 'Prof. Adamou Boubacar', signer_role: 'Recteur', status: 'signed', signed_at: '2026-03-10T14:00:00', certificate_path: '/certs/sig-001.pem', hash: 'sha256:abc123...', created_at: '2026-03-08T10:00:00', updated_at: '2026-03-10T14:00:00' },
  { id: 2, document_type: 'diploma', document_id: 2, signer_name: 'Dr. Mariama Sani', signer_role: 'Doyen', status: 'pending', signed_at: null, certificate_path: null, hash: null, created_at: '2026-03-18T09:00:00', updated_at: '2026-03-18T09:00:00' },
  { id: 3, document_type: 'transcript', document_id: 1, signer_name: 'Prof. Adamou Boubacar', signer_role: 'Recteur', status: 'signed', signed_at: '2026-03-20T10:00:00', certificate_path: '/certs/sig-003.pem', hash: 'sha256:def456...', created_at: '2026-03-19T08:00:00', updated_at: '2026-03-20T10:00:00' },
  { id: 4, document_type: 'certificate', document_id: 5, signer_name: 'Dr. Issa Garba', signer_role: 'Secrétaire Général', status: 'rejected', signed_at: null, certificate_path: null, hash: null, created_at: '2026-03-22T11:00:00', updated_at: '2026-03-23T09:00:00' },
];

const getVerificationChipColor = (status: DocumentVerificationStatus): 'default' | 'success' | 'error' => {
  switch (status) {
    case 'valid': return 'success';
    case 'invalid': return 'error';
    case 'expired': return 'default';
    case 'revoked': return 'error';
    default: return 'default';
  }
};

const getSignatureChipColor = (status: SignatureStatus): 'default' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'signed': return 'success';
    case 'rejected': return 'error';
    case 'expired': return 'default';
    default: return 'default';
  }
};

const getArchiveChipColor = (status: ArchiveStatus): 'default' | 'success' | 'primary' => {
  switch (status) {
    case 'active': return 'success';
    case 'archived': return 'primary';
    case 'cold_storage': return 'default';
    default: return 'default';
  }
};

export const VerificationDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<DocumentVerification | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const verifications = DEMO_VERIFICATIONS;
  const register = DEMO_REGISTER;
  const archives = DEMO_ARCHIVES;
  const signatures = DEMO_SIGNATURES;

  const handleVerify = useCallback(() => {
    setVerifyResult(DEMO_VERIFICATIONS[0]);
    setVerifyOpen(false);
    setResultOpen(true);
  }, []);

  const handleSign = useCallback((signature: ElectronicSignature) => {
    setSnackbar({ open: true, message: `Document signé par ${signature.signer_name}`, severity: 'success' });
  }, []);

  const handleColdStorage = useCallback((archive: Archive) => {
    setSnackbar({ open: true, message: `Document "${archive.document_number}" déplacé en stockage froid`, severity: 'success' });
  }, []);

  const validCount = verifications.filter(v => v.status === 'valid').length;
  const invalidCount = verifications.filter(v => v.status === 'invalid' || v.status === 'expired').length;
  const totalDocuments = register.length;
  const pendingSignatures = signatures.filter(s => s.status === 'pending').length;

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
        <Typography color="text.primary">Vérification</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Vérification & Registre des Documents
        </Typography>
        <Button variant="contained" onClick={() => setVerifyOpen(true)}>
          Vérifier un Document
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Vérifications valides', value: validCount, color: '#4caf50' },
          { label: 'Vérifications invalides', value: invalidCount, color: '#f44336' },
          { label: 'Documents enregistrés', value: totalDocuments, color: '#1976d2' },
          { label: 'Signatures en attente', value: pendingSignatures, color: '#ff9800' },
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
            <Tab label="Historique Vérifications" />
            <Tab label="Registre Documents" />
            <Tab label="Archives" />
            <Tab label="Signatures Électroniques" />
          </Tabs>

          {/* Verifications Tab */}
          {tabIndex === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type Document</TableCell>
                    <TableCell>N° Document</TableCell>
                    <TableCell>Vérifié par</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Résultat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifications.map(verification => (
                    <TableRow key={verification.id} hover>
                      <TableCell>
                        <Chip size="small" label={verification.document_type} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{verification.document_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{verification.verified_by || 'Anonyme'}</Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(verification.verified_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={VERIFICATION_STATUS_LABELS[verification.status]}
                          color={getVerificationChipColor(verification.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Register Tab */}
          {tabIndex === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>N° Document</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Émis le</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Vérifications</TableCell>
                    <TableCell>Dernière vérification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {register.map(doc => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Chip size="small" label={doc.document_type} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{doc.document_number}</Typography>
                      </TableCell>
                      <TableCell>{doc.student_name}</TableCell>
                      <TableCell>
                        {new Date(doc.issued_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={doc.status} color="success" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{doc.verified_count}</Typography>
                      </TableCell>
                      <TableCell>
                        {doc.last_verified_at
                          ? new Date(doc.last_verified_at).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Archives Tab */}
          {tabIndex === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>N° Document</TableCell>
                    <TableCell>Emplacement</TableCell>
                    <TableCell>Archivé le</TableCell>
                    <TableCell>Conservation jusqu&apos;au</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {archives.map(archive => (
                    <TableRow key={archive.id} hover>
                      <TableCell>
                        <Chip size="small" label={archive.document_type} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{archive.document_number}</Typography>
                      </TableCell>
                      <TableCell>{archive.storage_location}</TableCell>
                      <TableCell>
                        {new Date(archive.archived_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {archive.retention_until
                          ? new Date(archive.retention_until).toLocaleDateString('fr-FR')
                          : 'Indéfini'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ARCHIVE_STATUS_LABELS[archive.status]}
                          color={getArchiveChipColor(archive.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {archive.status !== 'cold_storage' && (
                          <Tooltip title="Déplacer en stockage froid">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleColdStorage(archive)}
                            >
                              Stockage froid
                            </Button>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Signatures Tab */}
          {tabIndex === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type Document</TableCell>
                    <TableCell>Signataire</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Date signature</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {signatures.map(signature => (
                    <TableRow key={signature.id} hover>
                      <TableCell>
                        <Chip size="small" label={signature.document_type} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{signature.signer_name}</Typography>
                      </TableCell>
                      <TableCell>{signature.signer_role}</TableCell>
                      <TableCell>
                        {signature.signed_at
                          ? new Date(signature.signed_at).toLocaleDateString('fr-FR')
                          : 'En attente'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SIGNATURE_STATUS_LABELS[signature.status]}
                          color={getSignatureChipColor(signature.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {signature.status === 'pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleSign(signature)}
                          >
                            Signer
                          </Button>
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

      {/* Verify Dialog */}
      <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Vérifier un Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Entrez le numéro de document ou scannez le QR code pour vérifier l&apos;authenticité.
            </Alert>
            <TextField
              label="N° de document"
              fullWidth
              placeholder="Ex: TR-2026-001, DIP-2026-001"
            />
            <Typography variant="body2" color="text.secondary" align="center">
              - ou -
            </Typography>
            <TextField
              label="Code QR"
              fullWidth
              placeholder="Collez ou scannez le code QR"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleVerify}>
            Vérifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Result Dialog */}
      <Dialog open={resultOpen} onClose={() => setResultOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Résultat de la Vérification</DialogTitle>
        <DialogContent>
          {verifyResult && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity={verifyResult.is_valid ? 'success' : 'error'}>
                {verifyResult.is_valid
                  ? 'Ce document est authentique et valide.'
                  : 'Ce document n\'est pas valide ou a expiré.'}
              </Alert>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                    <Typography fontWeight="bold">{verifyResult.document_type}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">N° Document</Typography>
                    <Typography fontWeight="bold">{verifyResult.document_number}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                    <Chip
                      label={VERIFICATION_STATUS_LABELS[verifyResult.status]}
                      color={getVerificationChipColor(verifyResult.status)}
                    />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Vérifié le</Typography>
                    <Typography fontWeight="bold">
                      {new Date(verifyResult.verified_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultOpen(false)}>Fermer</Button>
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
