// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import RoleDashboard from '@/modules/Dashboard/admin/components/RoleDashboard'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

const AdminDashboard = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <RoleDashboard title={dictionary['navigation']?.dashboard || 'Dashboard'} />
}

export default AdminDashboard
