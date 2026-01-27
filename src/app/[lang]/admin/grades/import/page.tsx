'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import { GradeImportWizard } from '@/modules/Grades';

export default function GradeImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get evaluation ID and name from query params
  const evaluationId = searchParams.get('evaluation_id');
  const evaluationName = searchParams.get('evaluation_name');

  const [importComplete, setImportComplete] = useState(false);

  const handleComplete = () => {
    setImportComplete(true);
    // Redirect to entry page after 2 seconds
    setTimeout(() => {
      router.push(`/admin/grades/entry?evaluation_id=${evaluationId}`);
    }, 2000);
  };

  const handleCancel = () => {
    router.back();
  };

  if (!evaluationId || !evaluationName) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Paramètres manquants</Typography>
          <Typography variant="body2">
            L'ID de l'évaluation et le nom sont requis pour importer des notes.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs
        separator={<i className='ri-arrow-right-s-line' />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/admin/grades"
        >
          Notes & Évaluations
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/admin/grades/entry"
        >
          Saisie des Notes
        </Link>
        <Typography color="text.primary">Import Excel</Typography>
      </Breadcrumbs>

      {importComplete && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Import terminé avec succès! Redirection en cours...
        </Alert>
      )}

      <GradeImportWizard
        evaluationId={parseInt(evaluationId, 10)}
        evaluationName={evaluationName}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </Container>
  );
}
