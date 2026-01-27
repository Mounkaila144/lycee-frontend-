import type { Metadata } from 'next';
import { Box, Typography } from '@mui/material';
import { GradeValidationsDashboard } from '@/modules/Grades/admin/components';

export const metadata: Metadata = {
  title: 'Validation des Notes | Administration',
  description: 'Tableau de bord pour la validation des notes soumises par les enseignants',
};

export default function GradeValidationsPage() {
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Validation des Notes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Validez les notes soumises par les enseignants avant publication aux étudiants
        </Typography>
      </Box>

      <GradeValidationsDashboard />
    </Box>
  );
}
