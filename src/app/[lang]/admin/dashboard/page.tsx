// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

const AdminDashboard = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant='h4' className='mbe-4'>
              {dictionary['navigation']?.dashboard || 'Dashboard'}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Bienvenue sur le tableau de bord administrateur.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminDashboard
