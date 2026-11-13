import Stack from '@mui/material/Stack';

import { DocumentVerificationPanel } from '@/modules/Documents/admin/components/DocumentVerificationPanel';
import { OfficialDocumentsDashboard } from '@/modules/Documents/admin/components/OfficialDocumentsDashboard';

export default function DocumentVerificationPage() {
  return (
    <Stack spacing={6}>
      <DocumentVerificationPanel />
      <OfficialDocumentsDashboard title='Registre des documents émis' />
    </Stack>
  );
}
