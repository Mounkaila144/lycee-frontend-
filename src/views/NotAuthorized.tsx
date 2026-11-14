'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@/configs/i18n'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const NotAuthorized = ({ mode }: { mode: Mode }) => {
  // Vars
  const darkImg = '/images/pages/misc-mask-4-dark.png'
  const lightImg = '/images/pages/misc-mask-4-light.png'

  // Hooks
  const { lang: locale } = useParams()
  const miscBackground = useImageVariant(mode, lightImg, darkImg)

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography className='text-8xl font-medium' color='text.primary'>
            401
          </Typography>
          <Typography variant='h4'>Accès non autorisé 🔐</Typography>
          <Typography>Vous n&#39;avez pas les droits nécessaires pour accéder à cette page.</Typography>
        </div>
        <img
          alt='error-illustration'
          src='/images/illustrations/characters/6.png'
          className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px]'
        />
        <Button href={getLocalizedUrl('/', locale as Locale)} component={Link} variant='contained'>
          Retour à l&#39;accueil
        </Button>
      </div>
      <img src={miscBackground} className='absolute bottom-0 z-[-1] is-full max-md:hidden' />
    </div>
  )
}

export default NotAuthorized
