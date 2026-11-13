'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { IssuedDocument } from '../services/issuedDocumentService';
import { issuedDocumentLabel, issuedDocumentService } from '../services/issuedDocumentService';

interface StudentDocumentsCardProps {
  /** Identifiant de l'élève ; `null` tant qu'il n'est pas connu. */
  studentId: number | null;
  title?: string;
  subtitle?: string;
}

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

/**
 * Liste des documents officiels émis pour un élève, avec téléchargement PDF.
 * Utilisée par le portail Élève (mes documents) et le portail Parent (fiche enfant).
 */
export function StudentDocumentsCard({ studentId, title = 'Documents', subtitle }: StudentDocumentsCardProps) {
  const [documents, setDocuments] = useState<IssuedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (studentId === null) {
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    issuedDocumentService
      .listForStudent(studentId)
      .then((result) => {
        if (mounted) setDocuments(result);
      })
      .catch((err) => {
        if (mounted) setError(err?.response?.data?.message ?? 'Impossible de charger les documents.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [studentId]);

  const handleDownload = async (doc: IssuedDocument) => {
    setDownloadingId(doc.id);
    setError(null);

    try {
      await issuedDocumentService.download(doc.id, doc.document_number);
    } catch {
      setError('Le téléchargement du document a échoué.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        {loading && (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress />
          </Box>
        )}
        {!loading && error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && !error && documents.length === 0 && (
          <Alert severity='info'>Aucun document disponible.</Alert>
        )}
        {!loading && documents.length > 0 && (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>N°</TableCell>
                <TableCell>Année</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align='right'>PDF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{issuedDocumentLabel(doc.document_type)}</TableCell>
                  <TableCell>{doc.document_number}</TableCell>
                  <TableCell>{doc.academic_year ?? '—'}</TableCell>
                  <TableCell>{formatDate(doc.issue_date)}</TableCell>
                  <TableCell align='right'>
                    <Button
                      size='small'
                      variant='outlined'
                      disabled={downloadingId === doc.id}
                      onClick={() => handleDownload(doc)}
                    >
                      {downloadingId === doc.id ? '...' : 'Télécharger'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
