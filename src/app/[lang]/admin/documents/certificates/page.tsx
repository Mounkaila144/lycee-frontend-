import { OfficialDocumentsDashboard } from '@/modules/Documents/admin/components/OfficialDocumentsDashboard';

export default function DocumentCertificatesPage() {
  return (
    <OfficialDocumentsDashboard
      category='certificate'
      title='Attestations et certificats'
      allowCertificateGeneration
    />
  );
}
