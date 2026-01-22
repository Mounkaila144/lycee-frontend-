// Next Imports
import type { Metadata } from 'next'

// Component Imports
import SuperadminLoginForm from '@/modules/UsersGuard/superadmin/components/LoginForm'

export const metadata: Metadata = {
  title: 'Superadmin Login',
  description: 'Login to superadmin panel'
}

const SuperadminLoginPage = () => {
  return <SuperadminLoginForm />
}

export default SuperadminLoginPage