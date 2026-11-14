// Next Imports
import type { Metadata } from 'next'

// Component Imports
import GuidePage from '@views/guide/GuidePage'

export const metadata: Metadata = {
  title: "Guide d'utilisation",
  description: "Guide d'utilisation de l'application : rôles, comptes de démonstration, parcours et FAQ"
}

/**
 * Page publique (sans authentification) : placée hors du groupe (guest-only)
 * pour rester accessible aux utilisateurs connectés comme déconnectés.
 * Le même contenu français est servi pour /fr, /en et /ar.
 */
const GuideRoutePage = () => {
  return <GuidePage />
}

export default GuideRoutePage
