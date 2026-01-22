'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid2'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Student, StudentStatus } from '../../types/student.types'

// Service Imports
import { studentService } from '../services/studentService'

// Context Imports
import { useTenant } from '@/shared/lib/tenant-context'

// Component Imports
import StudentDocumentsTab from './StudentDocumentsTab'
import StudentAuditLogTab from './StudentAuditLogTab'
import { StudentStatusHistoryTab } from './StudentStatusHistoryTab'
import { StudentStatusChangeDialog } from './StudentStatusChangeDialog'
import { OptionSelector } from './OptionSelector'

type StudentStatusColor = {
  [key in StudentStatus]: ThemeColor
}

const statusColorMap: StudentStatusColor = {
  Actif: 'success',
  Suspendu: 'warning',
  Exclu: 'error',
  Diplômé: 'info',
  Abandon: 'secondary',
  Transféré: 'primary'
}

interface StudentDetailDialogProps {
  open: boolean
  onClose: () => void
  studentId: number | null
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
}

/**
 * StudentDetailDialog Component
 * Displays detailed student information in a modal dialog
 */
export const StudentDetailDialog = ({
  open,
  onClose,
  studentId,
  onEdit,
  onDelete
}: StudentDetailDialogProps) => {
  const { tenantId } = useTenant()

  // State
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('1')
  const [statusChangeOpen, setStatusChangeOpen] = useState(false)

  // Fetch student data
  const fetchStudent = useCallback(async () => {
    if (!studentId) return

    try {
      setLoading(true)
      setError(null)
      const data = await studentService.getById(studentId, tenantId || undefined)
      setStudent(data)
    } catch (err) {
      console.error('Error fetching student:', err)
      setError('Impossible de charger les informations de l\'étudiant')
    } finally {
      setLoading(false)
    }
  }, [studentId, tenantId])

  useEffect(() => {
    if (open && studentId) {
      fetchStudent()
      setActiveTab('1') // Reset to first tab when opening
    }
  }, [open, studentId, fetchStudent])

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  const handleClose = () => {
    setStudent(null)
    setError(null)
    onClose()
  }

  const handleEdit = () => {
    if (student && onEdit) {
      onEdit(student)
      handleClose()
    }
  }

  const handleDelete = () => {
    if (student && onDelete) {
      onDelete(student)
      handleClose()
    }
  }

  const sexLabels = { M: 'Masculin', F: 'Féminin', O: 'Autre' }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h5">Détails de l'étudiant</Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Loading State */}
        {loading && (
          <Box className="flex justify-center items-center" sx={{ py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box className="text-center" sx={{ py: 6 }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchStudent}
              sx={{ mt: 2 }}
            >
              Réessayer
            </Button>
          </Box>
        )}

        {/* Content */}
        {student && !loading && (
          <>
            {/* Header */}
            <Box className="flex items-center gap-4 mb-6">
              <Avatar
                src={student.photo || undefined}
                alt={`${student.firstname} ${student.lastname}`}
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {student.firstname.charAt(0)}{student.lastname.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {student.firstname} {student.lastname}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {student.matricule}
                </Typography>
                <Chip
                  variant="tonal"
                  label={student.status}
                  size="small"
                  color={statusColorMap[student.status]}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            {/* Tabs */}
            <TabContext value={activeTab}>
              <TabList onChange={handleTabChange} aria-label="Student detail tabs">
                <Tab
                  label="Informations"
                  value="1"
                  icon={<i className="ri-user-line" />}
                  iconPosition="start"
                />
                <Tab
                  label="Documents"
                  value="2"
                  icon={<i className="ri-file-list-3-line" />}
                  iconPosition="start"
                />
                <Tab
                  label="Statuts"
                  value="3"
                  icon={<i className="ri-exchange-line" />}
                  iconPosition="start"
                />
                <Tab
                  label="Audit"
                  value="4"
                  icon={<i className="ri-history-line" />}
                  iconPosition="start"
                />
                <Tab
                  label="Inscription"
                  value="5"
                  icon={<i className="ri-book-open-line" />}
                  iconPosition="start"
                />
              </TabList>

              {/* Information Tab */}
              <TabPanel value="1" sx={{ px: 0 }}>
                <Grid container spacing={4}>
                  {/* Personal Information */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informations Personnelles
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box className="space-y-3">
                      <InfoRow label="Prénom" value={student.firstname} />
                      <InfoRow label="Nom" value={student.lastname} />
                      <InfoRow
                        label="Date de naissance"
                        value={student.birthdate ? new Date(student.birthdate).toLocaleDateString('fr-FR') : '-'}
                      />
                      <InfoRow label="Lieu de naissance" value={student.birthplace} />
                      <InfoRow label="Sexe" value={sexLabels[student.sex]} />
                      <InfoRow label="Nationalité" value={student.nationality} />
                    </Box>
                  </Grid>

                  {/* Contact Information */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Coordonnées
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box className="space-y-3">
                      <InfoRow label="Email" value={student.email} />
                      <InfoRow label="Mobile" value={student.mobile} />
                      <InfoRow label="Téléphone" value={student.phone || '-'} />
                      <InfoRow label="Adresse" value={student.address || '-'} />
                      <InfoRow label="Ville" value={student.city || '-'} />
                      <InfoRow label="Pays" value={student.country} />
                    </Box>
                  </Grid>

                  {/* Emergency Contact */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Contact d'Urgence
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box className="space-y-3">
                      <InfoRow label="Nom" value={student.emergency_contact_name || '-'} />
                      <InfoRow label="Téléphone" value={student.emergency_contact_phone || '-'} />
                    </Box>
                  </Grid>

                  {/* System Information */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informations Système
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box className="space-y-3">
                      <InfoRow label="Matricule" value={student.matricule} />
                      <InfoRow label="Statut" value={student.status} />
                      <InfoRow
                        label="Créé le"
                        value={student.created_at ? new Date(student.created_at).toLocaleString('fr-FR') : '-'}
                      />
                      <InfoRow
                        label="Modifié le"
                        value={student.updated_at ? new Date(student.updated_at).toLocaleString('fr-FR') : '-'}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Documents Tab */}
              <TabPanel value="2" sx={{ px: 0 }}>
                <StudentDocumentsTab student={student} onRefresh={fetchStudent} />
              </TabPanel>

              {/* Status History Tab */}
              <TabPanel value="3" sx={{ px: 0 }}>
                <StudentStatusHistoryTab
                  student={student}
                  onChangeStatus={() => setStatusChangeOpen(true)}
                />
              </TabPanel>

              {/* Audit Log Tab */}
              <TabPanel value="4" sx={{ px: 0 }}>
                <StudentAuditLogTab studentId={student.id} />
              </TabPanel>

              {/* Enrollment Tab - Options Selection */}
              <TabPanel value="5" sx={{ px: 0 }}>
                <OptionSelector
                  studentId={student.id}
                  academicYearId={1}
                  onSubmitSuccess={fetchStudent}
                />
              </TabPanel>
            </TabContext>

            {/* Status Change Dialog */}
            {statusChangeOpen && (
              <StudentStatusChangeDialog
                open={statusChangeOpen}
                onClose={() => setStatusChangeOpen(false)}
                student={student}
                onSuccess={() => {
                  // Close dialog first, then refetch to avoid race conditions
                  setStatusChangeOpen(false)
                  fetchStudent()
                }}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Fermer
        </Button>
        {student && (
          <>
            {onDelete && (
              <Button
                onClick={handleDelete}
                color="error"
                variant="outlined"
                startIcon={<i className="ri-delete-bin-line" />}
              >
                Supprimer
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={handleEdit}
                color="primary"
                variant="contained"
                startIcon={<i className="ri-edit-line" />}
              >
                Modifier
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

/**
 * Info Row Component
 */
interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Box className="flex justify-between">
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value}
    </Typography>
  </Box>
)

export default StudentDetailDialog
