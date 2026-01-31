'use client'

import { useState } from 'react'
import { useTranslation } from '@/shared/i18n/use-translation'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import type { Semester, AcademicPeriod } from '../../types/academicCalendar.types'
import { getAcademicPeriodTypeColor } from '../../types/academicCalendar.types'
import { useAcademicPeriods } from '../hooks/useAcademicPeriods'
import AcademicPeriodFormDialog from './AcademicPeriodFormDialog'

interface AcademicPeriodsDialogProps {
  open: boolean
  onClose: () => void
  semester: Semester
}

const AcademicPeriodsDialog = ({ open, onClose, semester }: AcademicPeriodsDialogProps) => {
  const { t, locale } = useTranslation('StructureAcademique')
  const { periods, loading, error, createPeriod, updatePeriod, deletePeriod } = useAcademicPeriods({
    semesterId: semester.id
  })

  const [formOpen, setFormOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriod | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const handleEdit = (period: AcademicPeriod) => {
    setSelectedPeriod(period)
    setFormOpen(true)
  }

  const handleDelete = async (period: AcademicPeriod) => {
    if (confirm(t('Supprimer la période "{name}" ?', { name: period.name }))) {
      try {
        setDeleting(period.id)
        await deletePeriod(period.id)
      } catch (err) {
        console.error('Failed to delete period:', err)
      } finally {
        setDeleting(null)
      }
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedPeriod) {
      await updatePeriod(selectedPeriod.id, data)
    } else {
      await createPeriod({ ...data, semester_id: semester.id })
    }
  }

  const formatDate = (date: string) => {
    const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-SA' }
    return new Date(date).toLocaleDateString(localeMap[locale] || 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{t('Périodes')} - {semester.name}</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<i className="ri-add-line" />}
              onClick={() => {
                setSelectedPeriod(null)
                setFormOpen(true)
              }}
              disabled={loading}
            >
              {t('Nouvelle période')}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : periods.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {t('Aucune période définie')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('Ajoutez des périodes (vacances, examens, etc.)')}
              </Typography>
            </Box>
          ) : (
            <List>
              {periods.map(period => (
                <ListItem
                  key={period.id}
                  secondaryAction={
                    <Box display="flex" gap={0.5}>
                      <Tooltip title={t('Modifier')}>
                        <IconButton size="small" onClick={() => handleEdit(period)}>
                          <i className="ri-edit-line" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('Supprimer')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(period)}
                          disabled={deleting === period.id}
                        >
                          {deleting === period.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <i className="ri-delete-bin-line" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">{period.name}</Typography>
                        <Chip
                          label={period.type}
                          color={getAcademicPeriodTypeColor(period.type)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={`${formatDate(period.start_date)} - ${formatDate(period.end_date)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('Fermer')}</Button>
        </DialogActions>
      </Dialog>

      <AcademicPeriodFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedPeriod(null)
        }}
        onSubmit={handleFormSubmit}
        period={selectedPeriod}
      />
    </>
  )
}

export default AcademicPeriodsDialog
