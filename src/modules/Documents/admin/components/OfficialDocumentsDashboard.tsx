'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { issuedDocumentLabel, issuedDocumentService } from '../../services/issuedDocumentService';
import type {
  DocumentCategory,
  DocumentRequestItem,
  DocumentStudent,
  GeneratableCertificate,
  LaravelPaginated,
  OfficialDocument,
} from '../services/officialDocumentService';
import { officialDocumentService } from '../services/officialDocumentService';

const CERTIFICATE_OPTIONS: { value: GeneratableCertificate; label: string }[] = [
  { value: 'schooling', label: 'Certificat de scolarité' },
  { value: 'enrollment', label: "Certificat d'inscription" },
  { value: 'status', label: 'Attestation de statut' },
  { value: 'attendance', label: "Attestation d'assiduité" },
  { value: 'achievement', label: 'Attestation de réussite' },
  { value: 'transfer', label: 'Certificat de transfert (exeat)' },
];

const STATUS_LABELS: Record<string, { label: string; color: 'success' | 'error' | 'default' | 'warning' | 'info' }> = {
  issued: { label: 'Émis', color: 'success' },
  cancelled: { label: 'Annulé', color: 'error' },
  replaced: { label: 'Remplacé', color: 'default' },
  pending: { label: 'En attente', color: 'warning' },
  approved: { label: 'Approuvée', color: 'info' },
  processing: { label: 'En cours', color: 'info' },
  completed: { label: 'Traitée', color: 'success' },
  rejected: { label: 'Rejetée', color: 'error' },
  delivered: { label: 'Délivrée', color: 'success' },
};

const statusChip = (status: string) => {
  const meta = STATUS_LABELS[status] ?? { label: status, color: 'default' as const };

  return <Chip size='small' label={meta.label} color={meta.color} />;
};

const studentName = (student?: DocumentStudent | null): string =>
  student ? `${student.lastname} ${student.firstname} (${student.matricule})` : '—';

const errorMessage = (err: unknown, fallback: string): string => {
  const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response;
  const firstError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : undefined;

  return firstError ?? response?.data?.message ?? fallback;
};

interface OfficialDocumentsDashboardProps {
  /** Catégorie filtrée ; absente = tous les documents émis. */
  category?: DocumentCategory;
  title: string;
  /** Active la génération d'attestations et l'onglet des demandes (catégorie certificate). */
  allowCertificateGeneration?: boolean;
  infoMessage?: string;
}

/**
 * Registre des documents officiels émis d'une catégorie (certificats, relevés...)
 * branché sur l'API réelle : liste, téléchargement PDF, annulation et, pour les
 * attestations, génération et traitement des demandes.
 */
export function OfficialDocumentsDashboard({
  category,
  title,
  allowCertificateGeneration = false,
  infoMessage,
}: OfficialDocumentsDashboardProps) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState<LaravelPaginated<OfficialDocument> | null>(null);
  const [requests, setRequests] = useState<LaravelPaginated<DocumentRequestItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [rejecting, setRejecting] = useState<DocumentRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelling, setCancelling] = useState<OfficialDocument | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setDocuments(
        await officialDocumentService.getRegister({
          document_category: category,
          search: search || undefined,
          page,
          per_page: 20,
        }),
      );
    } catch (err) {
      setError(errorMessage(err, 'Impossible de charger les documents.'));
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setRequests(await officialDocumentService.getRequests({ page }));
    } catch (err) {
      setError(errorMessage(err, 'Impossible de charger les demandes.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (tab === 0) {
      loadDocuments();
    } else {
      loadRequests();
    }
  }, [tab, loadDocuments, loadRequests]);

  const handleDownload = async (doc: OfficialDocument) => {
    try {
      await issuedDocumentService.download(doc.id, doc.document_number);
    } catch {
      setError('Le téléchargement du PDF a échoué.');
    }
  };

  const handleApprove = async (request: DocumentRequestItem) => {
    try {
      await officialDocumentService.approveRequest(request.id);
      setToast('Demande approuvée, document généré.');
      loadRequests();
    } catch (err) {
      setError(errorMessage(err, "L'approbation a échoué."));
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;

    try {
      await officialDocumentService.rejectRequest(rejecting.id, rejectReason);
      setToast('Demande rejetée.');
      setRejecting(null);
      setRejectReason('');
      loadRequests();
    } catch (err) {
      setError(errorMessage(err, 'Le rejet a échoué.'));
    }
  };

  const handleCancel = async () => {
    if (!cancelling) return;

    try {
      await officialDocumentService.cancelDocument(cancelling.id, cancelReason);
      setToast('Document annulé.');
      setCancelling(null);
      setCancelReason('');
      loadDocuments();
    } catch (err) {
      setError(errorMessage(err, "L'annulation a échoué."));
    }
  };

  const paginated = tab === 0 ? documents : requests;

  return (
    <Stack spacing={4}>
      <Box display='flex' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={2}>
        <Typography variant='h4'>{title}</Typography>
        {allowCertificateGeneration && (
          <Button variant='contained' onClick={() => setGenerateOpen(true)}>
            Générer une attestation
          </Button>
        )}
      </Box>

      {infoMessage && <Alert severity='info'>{infoMessage}</Alert>}
      {error && (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        {allowCertificateGeneration && (
          <Tabs
            value={tab}
            onChange={(_, value) => {
              setTab(value);
              setPage(1);
            }}
            sx={{ px: 4 }}
          >
            <Tab label='Documents émis' />
            <Tab label='Demandes' />
          </Tabs>
        )}
        <CardContent>
          {tab === 0 && (
            <TextField
              size='small'
              label='Rechercher (n° document, matricule, nom)'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{ mb: 3, minWidth: 320 }}
            />
          )}

          {loading && (
            <Box display='flex' justifyContent='center' p={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && tab === 0 && documents && (
            documents.data.length === 0 ? (
              <Alert severity='info'>Aucun document émis.</Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>N°</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Élève</TableCell>
                    <TableCell>Année</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.data.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.document_number}</TableCell>
                      <TableCell>{issuedDocumentLabel(doc.document_type)}</TableCell>
                      <TableCell>{studentName(doc.student)}</TableCell>
                      <TableCell>{doc.academic_year?.name ?? '—'}</TableCell>
                      <TableCell>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                      <TableCell>{statusChip(doc.status)}</TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                          <Button size='small' variant='outlined' onClick={() => handleDownload(doc)}>
                            PDF
                          </Button>
                          {doc.status === 'issued' && (
                            <Button size='small' color='error' onClick={() => setCancelling(doc)}>
                              Annuler
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {!loading && tab === 1 && requests && (
            requests.data.length === 0 ? (
              <Alert severity='info'>Aucune demande.</Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Élève</TableCell>
                    <TableCell>Document demandé</TableCell>
                    <TableCell>Motif</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.data.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{new Date(request.request_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{studentName(request.student)}</TableCell>
                      <TableCell>{issuedDocumentLabel(request.document_type)}</TableCell>
                      <TableCell>{request.rejection_reason ?? request.reason}</TableCell>
                      <TableCell>{statusChip(request.status)}</TableCell>
                      <TableCell align='right'>
                        {request.status === 'pending' && (
                          <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            <Button size='small' variant='contained' onClick={() => handleApprove(request)}>
                              Approuver
                            </Button>
                            <Button size='small' color='error' onClick={() => setRejecting(request)}>
                              Rejeter
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {!loading && paginated && paginated.last_page > 1 && (
            <Box display='flex' justifyContent='center' mt={3}>
              <Pagination count={paginated.last_page} page={page} onChange={(_, value) => setPage(value)} />
            </Box>
          )}
        </CardContent>
      </Card>

      {allowCertificateGeneration && (
        <GenerateCertificateDialog
          open={generateOpen}
          onClose={() => setGenerateOpen(false)}
          onGenerated={(doc) => {
            setGenerateOpen(false);
            setToast(`Document ${doc.document_number} généré.`);
            setTab(0);
            loadDocuments();
          }}
        />
      )}

      <Dialog open={rejecting !== null} onClose={() => setRejecting(null)} fullWidth maxWidth='sm'>
        <DialogTitle>Rejeter la demande</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label='Motif du rejet (10 caractères min.)'
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(null)}>Fermer</Button>
          <Button color='error' variant='contained' disabled={rejectReason.trim().length < 10} onClick={handleReject}>
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelling !== null} onClose={() => setCancelling(null)} fullWidth maxWidth='sm'>
        <DialogTitle>Annuler le document {cancelling?.document_number}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Motif d'annulation (10 caractères min.)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelling(null)}>Fermer</Button>
          <Button color='error' variant='contained' disabled={cancelReason.trim().length < 10} onClick={handleCancel}>
            Annuler le document
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Stack>
  );
}

interface GenerateCertificateDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (document: OfficialDocument) => void;
}

function GenerateCertificateDialog({ open, onClose, onGenerated }: GenerateCertificateDialogProps) {
  const [type, setType] = useState<GeneratableCertificate>('schooling');
  const [student, setStudent] = useState<DocumentStudent | null>(null);
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState<DocumentStudent[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: number; name: string; is_active: boolean }[]>([]);
  const [academicYearId, setAcademicYearId] = useState<number | ''>('');
  const [extra, setExtra] = useState({
    achievement_title: '',
    achievement_description: '',
    achievement_date: '',
    transfer_destination: '',
    transfer_reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    officialDocumentService
      .getAcademicYears()
      .then((years) => {
        setAcademicYears(years);
        const active = years.find((year) => year.is_active);

        if (active) setAcademicYearId(active.id);
      })
      .catch(() => setError('Impossible de charger les années scolaires.'));
  }, [open]);

  useEffect(() => {
    if (!open || studentQuery.trim().length < 2) return;

    const timer = setTimeout(() => {
      officialDocumentService
        .searchStudents(studentQuery.trim())
        .then(setStudentOptions)
        .catch(() => setStudentOptions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [open, studentQuery]);

  const handleSubmit = async () => {
    if (!student || academicYearId === '') return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        student_id: student.id,
        academic_year_id: academicYearId,
        ...(type === 'achievement'
          ? {
              achievement_title: extra.achievement_title,
              achievement_description: extra.achievement_description,
              achievement_date: extra.achievement_date,
            }
          : {}),
        ...(type === 'transfer'
          ? { transfer_destination: extra.transfer_destination, transfer_reason: extra.transfer_reason }
          : {}),
      };

      onGenerated(await officialDocumentService.generateCertificate(type, payload));
    } catch (err) {
      setError(errorMessage(err, 'La génération a échoué.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Générer une attestation</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity='error'>{error}</Alert>}
          <TextField select label='Type de document' value={type} onChange={(e) => setType(e.target.value as GeneratableCertificate)}>
            {CERTIFICATE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={studentOptions}
            value={student}
            onChange={(_, value) => setStudent(value)}
            onInputChange={(_, value) => setStudentQuery(value)}
            getOptionLabel={(option) => studentName(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options) => options}
            noOptionsText='Saisir au moins 2 caractères (nom ou matricule)'
            renderInput={(params) => <TextField {...params} label='Élève' />}
          />
          <TextField
            select
            label='Année scolaire'
            value={academicYearId}
            onChange={(e) => setAcademicYearId(Number(e.target.value))}
          >
            {academicYears.map((year) => (
              <MenuItem key={year.id} value={year.id}>
                {year.name}
                {year.is_active ? ' (active)' : ''}
              </MenuItem>
            ))}
          </TextField>
          {type === 'achievement' && (
            <>
              <TextField
                label='Distinction / réussite'
                value={extra.achievement_title}
                onChange={(e) => setExtra({ ...extra, achievement_title: e.target.value })}
              />
              <TextField
                label='Description'
                multiline
                minRows={2}
                value={extra.achievement_description}
                onChange={(e) => setExtra({ ...extra, achievement_description: e.target.value })}
              />
              <TextField
                type='date'
                label='Date'
                InputLabelProps={{ shrink: true }}
                value={extra.achievement_date}
                onChange={(e) => setExtra({ ...extra, achievement_date: e.target.value })}
              />
            </>
          )}
          {type === 'transfer' && (
            <>
              <TextField
                label='Établissement de destination'
                value={extra.transfer_destination}
                onChange={(e) => setExtra({ ...extra, transfer_destination: e.target.value })}
              />
              <TextField
                label='Motif du transfert'
                value={extra.transfer_reason}
                onChange={(e) => setExtra({ ...extra, transfer_reason: e.target.value })}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button variant='contained' disabled={!student || academicYearId === '' || submitting} onClick={handleSubmit}>
          {submitting ? 'Génération…' : 'Générer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
