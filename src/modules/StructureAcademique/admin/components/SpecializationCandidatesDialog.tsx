'use client'

import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useSpecializationCandidates } from '../hooks/useSpecializationCandidates'
import type { Specialization, ApplicationStatus } from '../../types/specialization.types'

interface SpecializationCandidatesDialogProps {
  open: boolean
  onClose: () => void
  specialization: Specialization | null
}

const SpecializationCandidatesDialog = ({ open, onClose, specialization }: SpecializationCandidatesDialogProps) => {
  const { candidates, loading, error, assignStudents, promoteWaitlist, refetch } = useSpecializationCandidates(
    specialization?.id || null
  )
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (open && specialization) {
      refetch()
      setSelectedCandidates([])
    }
  }, [open, specialization, refetch])

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'error'
      case 'waitlist':
        return 'warning'
      case 'cancelled':
        return 'default'
      default:
        return 'info'
    }
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const pendingIds = candidates.filter(c => c.status === 'pending').map(c => c.id)
      setSelectedCandidates(pendingIds)
    } else {
      setSelectedCandidates([])
    }
  }

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidates(prev => (prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]))
  }

  const handleAssignSelected = async () => {
    if (selectedCandidates.length === 0) return

    try {
      setIsAssigning(true)
      await assignStudents(selectedCandidates)
      setSelectedCandidates([])
      alert('Students assigned successfully')
    } catch (err) {
      console.error('Assignment error:', err)
      alert('Failed to assign students')
    } finally {
      setIsAssigning(false)
    }
  }

  const handlePromoteWaitlist = async () => {
    const waitlistCount = candidates.filter(c => c.status === 'waitlist').length
    if (waitlistCount === 0) return

    try {
      setIsAssigning(true)
      await promoteWaitlist(1)
      alert('Waitlist promoted successfully')
    } catch (err) {
      console.error('Promotion error:', err)
      alert('Failed to promote waitlist')
    } finally {
      setIsAssigning(false)
    }
  }

  const pendingCandidates = candidates.filter(c => c.status === 'pending')
  const allPendingSelected = pendingCandidates.length > 0 && selectedCandidates.length === pendingCandidates.length

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Candidates for {specialization?.name} ({specialization?.code})
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && candidates.length === 0 && (
          <Alert severity="info">No candidates yet for this specialization.</Alert>
        )}

        {!loading && !error && candidates.length > 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2">
                Total: {candidates.length} | Pending: {pendingCandidates.length} | Accepted:{' '}
                {candidates.filter(c => c.status === 'accepted').length} | Waitlist:{' '}
                {candidates.filter(c => c.status === 'waitlist').length}
              </Typography>
              {selectedCandidates.length > 0 && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAssignSelected}
                  disabled={isAssigning}
                  startIcon={<i className="ri-check-line" />}
                >
                  Assign Selected ({selectedCandidates.length})
                </Button>
              )}
              {candidates.filter(c => c.status === 'waitlist').length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePromoteWaitlist}
                  disabled={isAssigning}
                  startIcon={<i className="ri-arrow-up-line" />}
                >
                  Promote Waitlist
                </Button>
              )}
            </Box>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allPendingSelected}
                        indeterminate={selectedCandidates.length > 0 && !allPendingSelected}
                        onChange={handleSelectAll}
                        disabled={pendingCandidates.length === 0}
                      />
                    </TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Average</TableCell>
                    <TableCell>Preference</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map(candidate => (
                    <TableRow key={candidate.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleSelectCandidate(candidate.id)}
                          disabled={candidate.status !== 'pending'}
                        />
                      </TableCell>
                      <TableCell>
                        {candidate.student?.first_name} {candidate.student?.last_name || candidate.student?.username}
                      </TableCell>
                      <TableCell>{candidate.student?.email}</TableCell>
                      <TableCell>{new Date(candidate.application_date).toLocaleDateString()}</TableCell>
                      <TableCell>{candidate.average_at_application?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={`#${candidate.preference_order}`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={candidate.status} size="small" color={getStatusColor(candidate.status)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SpecializationCandidatesDialog
