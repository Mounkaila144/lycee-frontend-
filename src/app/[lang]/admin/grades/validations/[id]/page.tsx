'use client';

import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
// Icon removed - using emoji alternative
import { GradeValidationReview } from '@/modules/Grades/admin/components';

export default function GradeValidationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const validationId = parseInt(params.id as string, 10);

  const handleActionComplete = () => {
    // Redirect back to validations list after action
    router.push('/admin/grades/validations');
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          href="/admin/grades/validations"
          onClick={(e) => {
            e.preventDefault();
            router.push('/admin/grades/validations');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Validations
        </Link>
        <Typography color="text.primary">Détails</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Button
          onClick={() => router.back()}
          variant="outlined"
        >
          ← Retour
        </Button>
        <Box>
          <Typography variant="h4" component="h1">
            Révision de Validation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Examinez les notes et prenez une décision de validation
          </Typography>
        </Box>
      </Box>

      {/* Validation Review Component */}
      <GradeValidationReview
        validationId={validationId}
        onActionComplete={handleActionComplete}
      />
    </Box>
  );
}
