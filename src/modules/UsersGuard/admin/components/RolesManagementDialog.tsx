'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Hook Imports
import { useRolesList } from '../hooks/useRoles'

// Component Imports
import { RoleFormDialog } from './RoleFormDialog'

// Type Imports
import type { Role } from '../../types/role.types'

interface RolesManagementDialogProps {
  open: boolean
  onClose: () => void
}

const RolesManagementDialog = ({ open, onClose }: RolesManagementDialogProps) => {
  const { roles, loading, error, refresh } = useRolesList()
  
  // States
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // Handle create new role
  const handleCreate = () => {
    setSelectedRole(null)
    setFormDialogOpen(true)
  }

  // Handle edit role
  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormDialogOpen(true)
  }

  // Handle form success
  const handleFormSuccess = () => {
    setFormDialogOpen(false)
    setSelectedRole(null)
    refresh()
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
        <DialogTitle className='flex items-center justify-between'>
          <div>
            <Typography variant='h5'>Roles Management</Typography>
            <Typography variant='body2' color='text.secondary'>
              Manage all system roles
            </Typography>
          </div>
          <IconButton onClick={onClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <div className='space-y-4'>
            {/* Action Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='body2' color='text.secondary'>
                Total: {roles.length} role(s)
              </Typography>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={handleCreate}
                disabled={loading}
              >
                Create New Role
              </Button>
            </Box>

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert severity='error'>
                <strong>Error loading roles:</strong> {error.message}
                <br />
                <Typography variant='caption'>
                  Make sure the backend has implemented <code>GET /api/admin/roles</code>
                </Typography>
              </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && roles.length === 0 && (
              <Alert severity='info'>
                No roles found. Click "Create New Role" to add your first role.
              </Alert>
            )}

            {/* Roles Table */}
            {!loading && !error && roles.length > 0 && (
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Display Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Guard</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id} hover>
                        <TableCell>{role.id}</TableCell>
                        <TableCell>
                          <Chip label={role.name} size='small' color='primary' variant='tonal' />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
                            {role.display_name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {role.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={role.guard_name} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>
                          {role.permissions && role.permissions.length > 0 ? (
                            <Chip 
                              label={`${role.permissions.length} permission(s)`} 
                              size='small' 
                              color='success' 
                              variant='tonal' 
                            />
                          ) : (
                            <Typography variant='caption' color='text.secondary'>
                              No permissions
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton size='small' onClick={() => handleEdit(role)} color='primary'>
                            <i className='ri-edit-line' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={onClose} variant='outlined' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false)
          setSelectedRole(null)
        }}
        onSuccess={handleFormSuccess}
        role={selectedRole}
      />
    </>
  )
}

export { RolesManagementDialog }
