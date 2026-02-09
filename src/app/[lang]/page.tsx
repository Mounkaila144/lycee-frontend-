// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import LandingPage from '@views/landing/LandingPage'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

type Props = {
  params: Promise<{ lang: Locale }>
}

const LandingPageRoute = async (props: Props) => {
  const params = await props.params

  // Vars
  const direction = i18n.langDirection[params.lang]
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <LandingPage lang={params.lang} />
      </BlankLayout>
    </Providers>
  )
}

export default LandingPageRoute
