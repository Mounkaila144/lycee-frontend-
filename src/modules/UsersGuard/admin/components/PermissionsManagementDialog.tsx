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
import { usePermissionsList } from '../hooks/usePermissions'

// Component Imports
import { PermissionFormDialog } from './PermissionFormDialog'

// Type Imports
import type { Permission } from '../../types/permission.types'

interface PermissionsManagementDialogProps {
  open: boolean
  onClose: () => void
}

const PermissionsManagementDialog = ({ open, onClose }: PermissionsManagementDialogProps) => {
  const { permissions, loading, error, refresh } = usePermissionsList()
  
  // States
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)

  // Handle create new permission
  const handleCreate = () => {
    setSelectedPermission(null)
    setFormDialogOpen(true)
  }

  // Handle edit permission
  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission)
    setFormDialogOpen(true)
  }

  // Handle form success
  const handleFormSuccess = () => {
    setFormDialogOpen(false)
    setSelectedPermission(null)
    refresh()
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
        <DialogTitle className='flex items-center justify-between'>
          <div>
            <Typography variant='h5'>Permissions Management</Typography>
            <Typography variant='body2' color='text.secondary'>
              Manage all system permissions
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
                Total: {permissions.length} permission(s)
              </Typography>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={handleCreate}
                disabled={loading}
              >
                Create New Permission
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
                <strong>Error loading permissions:</strong> {error.message}
                <br />
                <Typography variant='caption'>
                  Make sure the backend has implemented <code>GET /api/admin/permissions</code>
                </Typography>
              </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && permissions.length === 0 && (
              <Alert severity='info'>
                No permissions found. Click "Create New Permission" to add your first permission.
              </Alert>
            )}

            {/* Permissions Table */}
            {!loading && !error && permissions.length > 0 && (
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Display Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Guard</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id} hover>
                        <TableCell>{permission.id}</TableCell>
                        <TableCell>
                          <Chip label={permission.name} size='small' color='secondary' variant='tonal' />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
                            {permission.display_name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {permission.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={permission.guard_name} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton size='small' onClick={() => handleEdit(permission)} color='primary'>
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

      {/* Permission Form Dialog */}
      <PermissionFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false)
          setSelectedPermission(null)
        }}
        onSuccess={handleFormSuccess}
        permission={selectedPermission}
      />
    </>
  )
}

export { PermissionsManagementDialog }
