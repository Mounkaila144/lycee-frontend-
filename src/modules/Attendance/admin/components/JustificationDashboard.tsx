'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuthUser } from '@/shared/hooks/useAuthUser';

import { useJustifications, useValidateJustification } from '../hooks';
import { justificationService } from '../services';

import type { AbsenceJustification, JustificationStatus } from '../../types';

import { JUSTIFICATION_STATUS_LABELS, JUSTIFICATION_TYPE_LABELS } from '../../types';

const STATUS_COLORS: Record<JustificationStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const TABS: Array<JustificationStatus | undefined> = [undefined, 'pending', 'approved', 'rejected'];

const VALIDATOR_ROLES = ['Administrator', 'Manager'];

const errorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string } } })?.response?.data;

  return data?.message || fallback;
};

const formatDate = (value: string): string => new Date(value).toLocaleDateString('fr-FR');

export const JustificationDashboard: React.FC = () => {
  const [tab, setTab] = useState(1);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AbsenceJustification | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const authUser = useAuthUser();
  const canValidate = !!authUser?.roles.some(role => VALIDATOR_ROLES.includes(role));

  const { data, isLoading, error } = useJustifications({ status: TABS[tab], page: page + 1 });
  const validateJustification = useValidateJustification();

  const justifications = data?.data ?? [];

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const openValidation = (justification: AbsenceJustification) => {
    setSelected(justification);
    setDecision('approved');
    setNotes('');
  };

  const handleSubmitValidation = () => {
    if (!selected) return;

    validateJustification.mutate(
      { justificationId: selected.id, data: { decision, notes: notes || undefined } },
      {
        onSuccess: () => {
          setSelected(null);
          notify(`Justificatif ${decision === 'approved' ? 'approuvé' : 'rejeté'}`);
        },
        onError: err => notify(errorMessage(err, 'Traitement impossible'), 'error'),
      },
    );
  };

  const handleDownload = async (justification: AbsenceJustification) => {
    try {
      const blob = await justificationService.downloadDocument(justification.id);
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      notify(errorMessage(err, 'Document indisponible'), 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Justificatifs d&apos;absence
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Les justificatifs sont soumis par les parents ou les élèves. Une approbation passe les absences de la période en « Excusé ».
      </Typography>

      <Card>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, value) => {
              setTab(value);
              setPage(0);
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Tous" />
            <Tab label="En attente" />
            <Tab label="Approuvés" />
            <Tab label="Rejetés" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage(error, 'Impossible de charger les justificatifs')}</Alert>}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Élève</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Motif</TableCell>
                    <TableCell>Soumis par</TableCell>
                    <TableCell>Document</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {justifications.map(j => (
                    <TableRow key={j.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{j.student?.lastname} {j.student?.firstname}</Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(j.absence_date_from)}
                        {j.absence_date_from !== j.absence_date_to && ` → ${formatDate(j.absence_date_to)}`}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={JUSTIFICATION_TYPE_LABELS[j.type] ?? j.type} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" noWrap title={j.reason}>{j.reason}</Typography>
                      </TableCell>
                      <TableCell>{j.submitter?.lastname} {j.submitter?.firstname}</TableCell>
                      <TableCell>
                        {j.document_path ? (
                          <Chip size="small" label="Voir" color="primary" variant="outlined" clickable onClick={() => handleDownload(j)} />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Aucun</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={JUSTIFICATION_STATUS_LABELS[j.status]} color={STATUS_COLORS[j.status]} />
                        {j.validation_notes && (
                          <Typography variant="caption" display="block" color="text.secondary">{j.validation_notes}</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {j.status === 'pending' && canValidate && (
                          <Button size="small" variant="outlined" onClick={() => openValidation(j)}>
                            Traiter
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {justifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>Aucun justificatif trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={page}
            rowsPerPage={data?.per_page ?? 15}
            rowsPerPageOptions={[]}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Traiter le justificatif</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity="info">
                <strong>{selected.student?.lastname} {selected.student?.firstname}</strong> - {JUSTIFICATION_TYPE_LABELS[selected.type]}
                {' '}({formatDate(selected.absence_date_from)} → {formatDate(selected.absence_date_to)})
                <br />
                {selected.reason}
              </Alert>
              <FormControl fullWidth>
                <InputLabel>Décision</InputLabel>
                <Select value={decision} label="Décision" onChange={e => setDecision(e.target.value as 'approved' | 'rejected')}>
                  <MenuItem value="approved">Approuver</MenuItem>
                  <MenuItem value="rejected">Rejeter</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Notes" multiline rows={3} value={notes} onChange={e => setNotes(e.target.value)} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Annuler</Button>
          <Button
            variant="contained"
            color={decision === 'approved' ? 'success' : 'error'}
            onClick={handleSubmitValidation}
            disabled={validateJustification.isPending}
          >
            {decision === 'approved' ? 'Approuver' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
