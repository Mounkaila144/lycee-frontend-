import { StudentCards } from '@/modules/Enrollment/admin/components/StudentCards';

/**
 * Cartes scolaires : même écran que Inscriptions > Cartes scolaires
 * (API admin/enrollment/student-cards — liste, génération, téléchargement PDF).
 */
export default function DocumentCardsPage() {
  return <StudentCards />;
}
