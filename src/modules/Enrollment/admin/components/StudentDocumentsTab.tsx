'use client'

// React Imports
import { useState, useRef } from 'react'

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
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Student, StudentDocument, StudentDocumentType } from '../../types/student.types'

// Service Imports
import { studentService } from '../services/studentService'

// Context Imports
import { useTenant } from '@/shared/lib/tenant-context'

// Utils
import { getApiBaseUrl } from '@/shared/lib/api-client'

interface StudentDocumentsTabProps {
  student: Student
  onRefresh: () => void
}

// Document type labels (must match backend)
const documentTypeLabels: Record<StudentDocumentType, string> = {
  certificat_naissance: 'Certificat de naissance',
  releve_baccalaureat: 'Relevé de notes BAC',
  photo_identite: 'Photo d\'identité',
  cni_passeport: 'CNI / Passeport',
  autre: 'Autre document'
}

// Document type icons
const documentTypeIcons: Record<StudentDocumentType, string> = {
  certificat_naissance: 'ri-file-text-line',
  releve_baccalaureat: 'ri-file-list-line',
  photo_identite: 'ri-image-line',
  cni_passeport: 'ri-id-card-line',
  autre: 'ri-file-line'
}

/**
 * StudentDocumentsTab Component
 * Displays and manages student documents
 */
const StudentDocumentsTab = ({ student, onRefresh }: StudentDocumentsTabProps) => {
  const { tenantId } = useTenant()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<StudentDocumentType>('autre')

  const documents = student.documents || []

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // Handle document download (triggers file download)
  const handleDownload = async (doc: StudentDocument) => {
    try {
      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}/admin/enrollment/students/${student.id}/documents/${doc.id}`
      const token = getAuthToken()

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/octet-stream',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = doc.file_name || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('Erreur lors du téléchargement du document')
    }
  }

  // Handle document view (opens in new tab)
  const handleView = async (doc: StudentDocument) => {
    try {
      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}/admin/enrollment/students/${student.id}/documents/${doc.id}`
      const token = getAuthToken()

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du document')
      }

      const blob = await response.blob()
      const viewUrl = window.URL.createObjectURL(blob)
      window.open(viewUrl, '_blank')
    } catch (error) {
      console.error('View error:', error)
      alert('Erreur lors de l\'ouverture du document')
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setUploadError(null)
      await studentService.uploadDocument(
        student.id,
        {
          document_type: documentType,
          file: selectedFile
        },
        tenantId || undefined
      )
      setUploadDialogOpen(false)
      setSelectedFile(null)
      setDocumentType('autre')
      onRefresh()
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Erreur lors du téléversement du document')
    } finally {
      setUploading(false)
    }
  }

  // Handle dialog close
  const handleCloseDialog = () => {
    setUploadDialogOpen(false)
    setSelectedFile(null)
    setDocumentType('autre')
    setUploadError(null)
  }

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">
          Documents Justificatifs
        </Typography>
        <Button
          variant="contained"
          startIcon={<i className="ri-upload-2-line" />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Ajouter un document
        </Button>
      </Box>

      {documents.length === 0 ? (
        <Box className="text-center" sx={{ py: 6 }}>
          <i className="ri-file-list-3-line text-4xl text-gray-400 mb-2" />
          <Typography color="text.secondary">
            Aucun document téléversé
          </Typography>
          <Button
            variant="outlined"
            startIcon={<i className="ri-upload-2-line" />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Téléverser un document
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Nom du fichier</TableCell>
                <TableCell>Taille</TableCell>
                <TableCell>Date d'ajout</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box className="flex items-center gap-2">
                      <i className={documentTypeIcons[doc.document_type] || 'ri-file-line'} />
                      <Chip
                        label={documentTypeLabels[doc.document_type] || doc.document_type}
                        size="small"
                        variant="tonal"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{doc.file_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.mime_type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatFileSize(doc.file_size)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Télécharger">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(doc)}
                      >
                        <i className="ri-download-line" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Voir">
                      <IconButton
                        size="small"
                        onClick={() => handleView(doc)}
                      >
                        <i className="ri-eye-line" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un document</DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
            <InputLabel>Type de document</InputLabel>
            <Select
              value={documentType}
              label="Type de document"
              onChange={(e) => setDocumentType(e.target.value as StudentDocumentType)}
            >
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />

          <Box
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
            onClick={openFilePicker}
          >
            {selectedFile ? (
              <Box>
                <i className="ri-file-check-line text-4xl text-green-500 mb-2" />
                <Typography variant="body1" fontWeight={500}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-2" />
                <Typography variant="body1" color="text.secondary">
                  Cliquez pour sélectionner un fichier
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PDF, JPG, PNG, DOC (max 5 MB)
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <i className="ri-upload-2-line" />}
          >
            {uploading ? 'Téléversement...' : 'Téléverser'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentDocumentsTab
