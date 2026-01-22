'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Type Imports
import type { ProgrammeHistory, HistoryAction } from '../../types/programme-history.types'
import type { ThemeColor } from '@core/types'

interface ProgrammeHistoryTimelineProps {
  history: ProgrammeHistory[]
  loading?: boolean
  error?: string | null
  onCompare?: (historyId: number) => void
  onRestore?: (historyId: number) => void
}

type ActionColor = {
  [key in HistoryAction]: ThemeColor
}

const actionColorMap: ActionColor = {
  created: 'success',
  updated: 'info',
  deleted: 'error',
  restored: 'warning',
  activated: 'success',
  deactivated: 'secondary',
}

const actionIconMap: Record<HistoryAction, string> = {
  created: 'ri-add-circle-line',
  updated: 'ri-edit-line',
  deleted: 'ri-delete-bin-line',
  restored: 'ri-history-line',
  activated: 'ri-play-circle-line',
  deactivated: 'ri-pause-circle-line',
}

const ProgrammeHistoryTimeline = ({
  history,
  loading = false,
  error = null,
  onCompare,
  onRestore,
}: ProgrammeHistoryTimelineProps) => {
  const { t } = useTranslation('StructureAcademique')
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([])

  const handleSelectForComparison = (historyId: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(historyId)) {
        return prev.filter(id => id !== historyId)
      }

      if (prev.length >= 2) {
        return [prev[1], historyId]
      }

      return [...prev, historyId]
    })
  }

  const handleCompare = () => {
    if (selectedForComparison.length === 2 && onCompare) {
      onCompare(selectedForComparison[0])
      onCompare(selectedForComparison[1])
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!history.length) {
    return (
      <Alert severity="info">
        {t('Aucun historique disponible pour ce programme.')}
      </Alert>
    )
  }

  return (
    <Box>
      <Timeline position="right">
        {history.map((item, index) => (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
              <Typography variant="body2">
                {new Date(item.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="caption">
                {new Date(item.created_at).toLocaleTimeString()}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={actionColorMap[item.action]}>
                <i className={actionIconMap[item.action]} />
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Card
                sx={{
                  mb: 2,
                  border: selectedForComparison.includes(item.id) ? 2 : 0,
                  borderColor: 'primary.main',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Chip
                        label={t(item.action)}
                        size="small"
                        color={actionColorMap[item.action]}
                        sx={{ mb: 1 }}
                      />
                      {item.user && (
                        <Typography variant="body2" color="text.secondary">
                          {t('Par')}: {item.user.name || item.user.email}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {onCompare && (
                        <Tooltip title={t('Sélectionner pour comparaison')}>
                          <IconButton
                            size="small"
                            onClick={() => handleSelectForComparison(item.id)}
                            color={selectedForComparison.includes(item.id) ? 'primary' : 'default'}
                          >
                            <i className="ri-checkbox-circle-line" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onRestore && item.action === 'updated' && (
                        <Tooltip title={t('Restaurer cette version')}>
                          <IconButton size="small" onClick={() => onRestore(item.id)}>
                            <i className="ri-history-line" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {item.field_changed && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('Champ modifié')}: <strong>{item.field_changed}</strong>
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('Ancienne valeur')}:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              p: 1,
                              bgcolor: 'error.lighter',
                              borderRadius: 1,
                              textDecoration: 'line-through',
                            }}
                          >
                            {formatValue(item.old_value)}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('Nouvelle valeur')}:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              p: 1,
                              bgcolor: 'success.lighter',
                              borderRadius: 1,
                            }}
                          >
                            {formatValue(item.new_value)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {item.reason && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('Raison')}:
                      </Typography>
                      <Typography variant="body2">{item.reason}</Typography>
                    </Box>
                  )}

                  {item.ip_address && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      IP: {item.ip_address}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {selectedForComparison.length === 2 && onCompare && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Chip
            label={t('Comparer les versions sélectionnées')}
            color="primary"
            onClick={handleCompare}
            onDelete={() => setSelectedForComparison([])}
            deleteIcon={<i className="ri-close-line" />}
          />
        </Box>
      )}
    </Box>
  )
}

export default ProgrammeHistoryTimeline
