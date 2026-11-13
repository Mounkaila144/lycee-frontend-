import { OfficialDocumentsDashboard } from '@/modules/Documents/admin/components/OfficialDocumentsDashboard';

export default function DocumentTranscriptsPage() {
  return (
    <OfficialDocumentsDashboard
      category='transcript'
      title='Relevés de notes'
      infoMessage="Registre des relevés de notes émis. La génération des relevés/bulletins à partir des notes n'est pas encore branchée sur le module Notes."
    />
  );
}
