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
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// Hook Imports
import { usePermissionsList } from '../hooks/usePermissions'
import { useTenant } from '@/shared/lib/tenant-context'

// Service Imports
import { createApiClient } from '@/shared/lib/api-client'

// Type Imports
import type { Role } from '../../types/role.types'

interface RoleFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  role: Role | null
}

interface RoleFormData {
  name: string
  display_name: string
  description: string
  guard_name: string
  permissions: string[]
}

const RoleFormDialog = ({ open, onClose, onSuccess, role }: RoleFormDialogProps) => {
  const { tenantId } = useTenant()
  const tenantIdOrUndefined = tenantId || undefined
  const { permissions, loading: loadingPermissions } = usePermissionsList()

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    display_name: '',
    description: '',
    guard_name: 'web',
    permissions: []
  })

  // Load role data when editing
  useEffect(() => {
    if (open && role) {
      setFormData({
        name: role.name,
        display_name: role.display_name || '',
        description: role.description || '',
        guard_name: role.guard_name,
        permissions: role.permissions?.map(p => p.name) || []
      })
    } else if (open && !role) {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        guard_name: 'web',
        permissions: []
      })
    }
  }, [open, role])

  // Handle field change
  const handleFieldChange = (field: keyof RoleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle permission toggle
  const handlePermissionToggle = (permissionName: string) => {
    const isSelected = formData.permissions.includes(permissionName)
    if (isSelected) {
      handleFieldChange('permissions', formData.permissions.filter(p => p !== permissionName))
    } else {
      handleFieldChange('permissions', [...formData.permissions, permissionName])
    }
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    const parts = perm.name.split('.')
    const category = parts.length > 1 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'General'
    
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(perm)
    return acc
  }, {} as Record<string, typeof permissions>)

  // Handle submit
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const client = createApiClient(tenantIdOrUndefined)

      if (role) {
        // Update existing role
        await client.put(`/admin/roles/${role.id}`, formData)
      } else {
        // Create new role
        await client.post('/admin/roles', formData)
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving role:', err)
      setError(err?.response?.data?.message || 'Failed to save role')
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return formData.name.trim() !== '' && formData.display_name.trim() !== ''
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <div>
          <Typography variant='h5'>{role ? 'Edit Role' : 'Create New Role'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {role ? `Editing: ${role.name}` : 'Fill in the information to create a new role'}
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

          {/* Basic Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
              <Typography variant='h6'>Basic Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label='Role Name'
                    value={formData.name}
                    onChange={e => handleFieldChange('name', e.target.value)}
                    helperText='Unique identifier (e.g., admin, teacher)'
                    disabled={!!role} // Cannot change name when editing
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                    helperText='Brief description of this role'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
            </AccordionDetails>
          </Accordion>

          {/* Permissions */}
          <Accordion>
            <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
              <Typography variant='h6'>
                Permissions ({formData.permissions.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {loadingPermissions ? (
                <div className='flex justify-center py-4'>
                  <CircularProgress size={24} />
                </div>
              ) : permissions.length === 0 ? (
                <Alert severity='warning'>
                  No permissions available. Please create permissions first.
                </Alert>
              ) : (
                <div className='space-y-3'>
                  <Typography variant='body2' color='text.secondary'>
                    Select permissions for this role
                  </Typography>
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className='space-y-2'>
                      <Typography variant='subtitle2' className='font-semibold'>
                        {category}
                      </Typography>
                      <FormGroup className='pl-4'>
                        {categoryPermissions.map((permission) => (
                          <FormControlLabel
                            key={permission.id}
                            control={
                              <Checkbox
                                checked={formData.permissions.includes(permission.name)}
                                onChange={() => handlePermissionToggle(permission.name)}
                                size='small'
                              />
                            }
                            label={permission.display_name || permission.name}
                          />
                        ))}
                      </FormGroup>
                    </div>
                  ))}
                </div>
              )}
            </AccordionDetails>
          </Accordion>
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
          {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { RoleFormDialog }
