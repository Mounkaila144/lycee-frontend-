// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import { SchoolNameBadge } from '@/modules/Settings/admin/components/SchoolNameBadge'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

/**
 * Barre supérieure. Les raccourcis et notifications de démonstration du thème
 * (liens vers des pages inexistantes, faux messages en anglais) et la recherche globale
 * (aucune donnée indexée) ont été retirés.
 */
const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        <SchoolNameBadge />
      </div>
      <div className='flex items-center'>
        <LanguageDropdown />
        <ModeDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
