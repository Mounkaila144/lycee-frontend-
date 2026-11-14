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
import { useAuthUser } from '@/shared/hooks/useAuthUser'

// Component Imports
import StudentDocumentsTab from './StudentDocumentsTab'
import StudentAuditLogTab from './StudentAuditLogTab'
import { StudentStatusHistoryTab } from './StudentStatusHistoryTab'
import { StudentStatusChangeDialog } from './StudentStatusChangeDialog'
import { StudentClassEnrollmentTab } from './StudentClassEnrollmentTab'
import { StudentParentsTab } from './StudentParentsTab'
import { StudentAccountTab } from './StudentAccountTab'

const MANAGER_ROLES = ['Administrator', 'Manager']

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
  /** Appelé après une inscription / un changement de classe (rafraîchir la liste) */
  onStudentChanged?: () => void
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
  onDelete,
  onStudentChanged
}: StudentDetailDialogProps) => {
  const { tenantId } = useTenant()
  const authUser = useAuthUser()
  const canManage = Boolean(authUser?.roles.some(role => MANAGER_ROLES.includes(role)))

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

  /** Rafraîchit la fiche sans masquer l'onglet courant (après une action dans un onglet) */
  const refreshStudentSilently = useCallback(async () => {
    if (!studentId) return

    try {
      setStudent(await studentService.getById(studentId, tenantId || undefined))
    } catch {
      // la fiche affichée reste valable
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
                  {student.current_class?.classe_name ? ` · ${student.current_class.classe_name}` : ' · Sans classe'}
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
              <TabList onChange={handleTabChange} aria-label="Student detail tabs" variant="scrollable" scrollButtons="auto">
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
                {canManage && (
                  <Tab
                    label="Classe"
                    value="5"
                    icon={<i className="ri-book-open-line" />}
                    iconPosition="start"
                  />
                )}
                {canManage && (
                  <Tab
                    label="Parents"
                    value="6"
                    icon={<i className="ri-parent-line" />}
                    iconPosition="start"
                  />
                )}
                {canManage && (
                  <Tab
                    label="Compte"
                    value="7"
                    icon={<i className="ri-key-2-line" />}
                    iconPosition="start"
                  />
                )}
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
                      <InfoRow label="Téléphone" value={student.phone || '-'} />
                      <InfoRow label="Adresse" value={student.address || '-'} />
                      <InfoRow label="Ville" value={student.city || '-'} />
                      <InfoRow label="Quartier" value={student.quarter || '-'} />
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
                      <InfoRow label="Matricule" value={student.matricule ?? '-'} />
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

              {/* Classe : inscription / changement de classe */}
              <TabPanel value="5" sx={{ px: 0 }}>
                <StudentClassEnrollmentTab
                  student={student}
                  canManage={canManage}
                  onChanged={() => {
                    refreshStudentSilently()
                    onStudentChanged?.()
                  }}
                />
              </TabPanel>

              {/* Parents : créer, lier, délier + comptes parents */}
              <TabPanel value="6" sx={{ px: 0 }}>
                <StudentParentsTab student={student} canManage={canManage} />
              </TabPanel>

              {/* Compte de connexion de l'élève */}
              <TabPanel value="7" sx={{ px: 0 }}>
                <StudentAccountTab student={student} canManage={canManage} />
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
