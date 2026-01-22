'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Component Imports
import ProgrammeHistoryTimeline from './ProgrammeHistoryTimeline'

// Hook Imports
import { useProgrammeHistory } from '../hooks/useProgrammeHistory'

// Type Imports
import type { Programme } from '../../types/programme.types'
import type { HistoryAction } from '../../types/programme-history.types'

interface ProgrammeHistoryViewProps {
  programme: Programme
}

const ProgrammeHistoryView = ({ programme }: ProgrammeHistoryViewProps) => {
  const { t } = useTranslation('StructureAcademique')
  const {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    exportPDF,
  } = useProgrammeHistory(programme.id)

  const [filters, setFilters] = useState({
    action: '' as HistoryAction | '',
    start_date: '',
    end_date: '',
  })

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    fetchHistory({
      page: 1,
      per_page: pagination.itemsPerPage,
      action: filters.action || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
  }

  const handleResetFilters = () => {
    setFilters({
      action: '',
      start_date: '',
      end_date: '',
    })
    fetchHistory({ page: 1, per_page: pagination.itemsPerPage })
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    fetchHistory({
      page,
      per_page: pagination.itemsPerPage,
      action: filters.action || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
  }

  const handleExportPDF = async () => {
    try {
      await exportPDF()
    } catch (err) {
      console.error('Failed to export PDF:', err)
    }
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                {t('Historique des modifications')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<i className="ri-file-pdf-line" />}
                onClick={handleExportPDF}
                disabled={loading || !history.length}
              >
                {t('Exporter PDF')}
              </Button>
            </Box>
          }
          subheader={`${programme.code} - ${programme.libelle}`}
        />

        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label={t('Type d\'action')}
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                size="small"
              >
                <MenuItem value="">{t('Toutes')}</MenuItem>
                <MenuItem value="created">{t('Création')}</MenuItem>
                <MenuItem value="updated">{t('Modification')}</MenuItem>
                <MenuItem value="deleted">{t('Suppression')}</MenuItem>
                <MenuItem value="restored">{t('Restauration')}</MenuItem>
                <MenuItem value="activated">{t('Activation')}</MenuItem>
                <MenuItem value="deactivated">{t('Désactivation')}</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label={t('Date début')}
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label={t('Date fin')}
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  fullWidth
                >
                  {t('Filtrer')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  disabled={loading}
                >
                  <i className="ri-refresh-line" />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ProgrammeHistoryTimeline
            history={history}
            loading={loading}
            error={error}
          />

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                disabled={loading}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProgrammeHistoryView
