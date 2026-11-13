'use client';

import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { VerificationResult } from '../services/officialDocumentService';
import { officialDocumentService } from '../services/officialDocumentService';

/**
 * Vérification d'authenticité d'un document par code de vérification (QR) ou par numéro.
 */
export function DocumentVerificationPanel() {
  const [mode, setMode] = useState<'qr-code' | 'document-number'>('document-number');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(await officialDocumentService.verify(mode, value.trim()));
    } catch {
      setError('La vérification a échoué.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title='Vérifier un document' />
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            size='small'
            label='Par'
            value={mode}
            onChange={(e) => setMode(e.target.value as 'qr-code' | 'document-number')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value='document-number'>Numéro de document</MenuItem>
            <MenuItem value='qr-code'>Code de vérification (QR)</MenuItem>
          </TextField>
          <TextField
            size='small'
            fullWidth
            label={mode === 'qr-code' ? 'Code de vérification' : 'Numéro (ex. CSC-2026-2027-00001)'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button variant='contained' disabled={!value.trim() || loading} onClick={handleVerify}>
            Vérifier
          </Button>
        </Stack>

        {error && <Alert severity='error' sx={{ mt: 3 }}>{error}</Alert>}
        {result && !result.valid && (
          <Alert severity='error' sx={{ mt: 3 }}>{result.message ?? 'Document non trouvé ou invalide.'}</Alert>
        )}
        {result?.valid && result.document && (
          <Alert severity='success' sx={{ mt: 3 }}>
            <Typography fontWeight={600}>Document authentique</Typography>
            <Typography variant='body2'>
              {result.document.document_type} n° {result.document.document_number} — {result.document.student_name} (
              {result.document.student_matricule}) — émis le {result.document.issue_date}
              {result.document.academic_year ? ` — année ${result.document.academic_year}` : ''}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
