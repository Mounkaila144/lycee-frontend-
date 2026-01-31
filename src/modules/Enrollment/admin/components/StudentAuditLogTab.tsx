'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'

// Type Imports
import type { StudentAuditLog } from '../../types/student.types'

// Service Imports
import { studentService } from '../services/studentService'

// Context Imports
import { useTenant } from '@/shared/lib/tenant-context'

// i18n Imports
import { useTranslation } from '@/shared/i18n/use-translation'

interface StudentAuditLogTabProps {
  studentId: number
}

/**
 * StudentAuditLogTab Component
 * Displays the audit log history for a student
 */
const StudentAuditLogTab = ({ studentId }: StudentAuditLogTabProps) => {
  const { tenantId } = useTenant()
  const { t } = useTranslation('Enrollment')
  const [logs, setLogs] = useState<StudentAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await studentService.getAuditLog(studentId, tenantId || undefined)
      setLogs(data)
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError(t('auditLog.loadError'))
    } finally {
      setLoading(false)
    }
  }, [studentId, tenantId])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  // Get event color
  const getEventColor = (event: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (event.toLowerCase()) {
      case 'created':
        return 'success'
      case 'updated':
        return 'warning'
      case 'deleted':
        return 'error'
      default:
        return 'info'
    }
  }

  // Get event label
  const getEventLabel = (event: string): string => {
    switch (event.toLowerCase()) {
      case 'created':
        return t('auditLog.events.created')
      case 'updated':
        return t('auditLog.events.updated')
      case 'deleted':
        return t('auditLog.events.deleted')
      default:
        return event
    }
  }

  // Get user full name
  const getUserName = (user?: { firstname: string; lastname: string } | null): string => {
    if (!user) return t('auditLog.system')
    return `${user.firstname} ${user.lastname}`
  }

  // Format change for display
  const formatChange = (log: StudentAuditLog): string => {
    if (!log.field_name) return '-'

    const oldVal = log.old_value ?? 'N/A'
    const newVal = log.new_value ?? 'N/A'

    return `${log.field_name}: "${oldVal}" → "${newVal}"`
  }

  // Loading state
  if (loading) {
    return (
      <Box className="flex justify-center items-center" sx={{ py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <IconButton size="small" onClick={fetchAuditLogs} sx={{ ml: 1 }}>
          <i className="ri-refresh-line" />
        </IconButton>
      </Alert>
    )
  }

  // Empty state
  if (logs.length === 0) {
    return (
      <Box className="text-center" sx={{ py: 6 }}>
        <i className="ri-history-line text-4xl text-gray-400 mb-2" />
        <Typography color="text.secondary">
          {t('auditLog.noHistory')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">
          {t('auditLog.title')}
        </Typography>
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={fetchAuditLogs} disabled={loading}>
            <i className="ri-refresh-line" />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('auditLog.columns.date')}</TableCell>
              <TableCell>{t('auditLog.columns.action')}</TableCell>
              <TableCell>{t('auditLog.columns.user')}</TableCell>
              <TableCell>{t('auditLog.columns.changes')}</TableCell>
              <TableCell>{t('auditLog.columns.ipAddress')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getEventLabel(log.event)}
                    size="small"
                    color={getEventColor(log.event)}
                    variant="tonal"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getUserName(log.user)}
                  </Typography>
                  {log.user?.email && (
                    <Typography variant="caption" color="text.secondary">
                      {log.user.email}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                    {formatChange(log)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {log.ip_address || '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default StudentAuditLogTab
