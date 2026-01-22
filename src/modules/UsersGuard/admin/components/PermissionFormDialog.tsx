'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Hook Imports
import { useTenant } from '@/shared/lib/tenant-context'

// Service Imports
import { createApiClient } from '@/shared/lib/api-client'

// Type Imports
import type { Permission } from '../../types/permission.types'

interface PermissionFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  permission: Permission | null
}

interface PermissionFormData {
  name: string
  display_name: string
  description: string
  guard_name: string
}

const PermissionFormDialog = ({ open, onClose, onSuccess, permission }: PermissionFormDialogProps) => {
  const { tenantId } = useTenant()
  const tenantIdOrUndefined = tenantId || undefined

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    display_name: '',
    description: '',
    guard_name: 'web'
  })

  // Load permission data when editing
  useEffect(() => {
    if (open && permission) {
      setFormData({
        name: permission.name,
        display_name: permission.display_name || '',
        description: permission.description || '',
        guard_name: permission.guard_name
      })
    } else if (open && !permission) {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        guard_name: 'web'
      })
    }
  }, [open, permission])

  // Handle field change
  const handleFieldChange = (field: keyof PermissionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const client = createApiClient(tenantIdOrUndefined)

      if (permission) {
        // Update existing permission
        await client.put(`/admin/permissions/${permission.id}`, formData)
      } else {
        // Create new permission
        await client.post('/admin/permissions', formData)
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving permission:', err)
      setError(err?.response?.data?.message || 'Failed to save permission')
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return formData.name.trim() !== '' && formData.display_name.trim() !== ''
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <div>
          <Typography variant='h5'>{permission ? 'Edit Permission' : 'Create New Permission'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {permission ? `Editing: ${permission.name}` : 'Fill in the information to create a new permission'}
          </Typography>
        </div>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <div className='space-y-4'>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label='Permission Name'
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                helperText='Unique identifier (e.g., users.view, students.edit)'
                disabled={!!permission} // Cannot change name when editing
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label='Display Name'
                value={formData.display_name}
                onChange={e => handleFieldChange('display_name', e.target.value)}
                helperText='Human-readable name'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Description'
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                helperText='Brief description of this permission'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Guard Name</InputLabel>
                <Select
                  value={formData.guard_name}
                  label='Guard Name'
                  onChange={e => handleFieldChange('guard_name', e.target.value)}
                >
                  <MenuItem value='web'>Web</MenuItem>
                  <MenuItem value='api'>API</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary' disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='primary'
          disabled={loading || !isFormValid()}
          startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='ri-save-line' />}
        >
          {loading ? 'Saving...' : permission ? 'Update Permission' : 'Create Permission'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { PermissionFormDialog }
