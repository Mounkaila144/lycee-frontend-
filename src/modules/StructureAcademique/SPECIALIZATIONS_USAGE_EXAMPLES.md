# Specializations Management - Usage Examples

## 📚 Code Examples for Developers

### Example 1: Using the SpecializationList Component

```typescript
// In your page component
import { SpecializationList } from '@/modules/StructureAcademique'

export default function SpecializationsPage() {
  return <SpecializationList />
}
```

---

### Example 2: Using Hooks Directly

```typescript
'use client'

import { useSpecializations } from '@/modules/StructureAcademique'
import { useEffect } from 'react'

export default function MyCustomComponent() {
  const { 
    specializations, 
    loading, 
    error, 
    createSpecialization,
    updateSpecialization,
    deleteSpecialization 
  } = useSpecializations()

  useEffect(() => {
    console.log('Specializations:', specializations)
  }, [specializations])

  const handleCreate = async () => {
    try {
      await createSpecialization({
        code: 'NEW-2026',
        name: 'New Specialization',
        programme_id: 1,
        available_from_level: 3,
        type: 'Obligatoire',
        selection_mode: 'Exclusive',
        is_active: true
      })
      alert('Created successfully!')
    } catch (err) {
      console.error('Failed to create:', err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <button onClick={handleCreate}>Create New</button>
      <ul>
        {specializations.map(spec => (
          <li key={spec.id}>{spec.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 3: Using Service Directly

```typescript
import { specializationService } from '@/modules/StructureAcademique'

// Get all specializations
const specializations = await specializationService.getAll()

// Get single specialization
const specialization = await specializationService.getById(1)

// Create new specialization
const newSpec = await specializationService.create({
  code: 'IA-2026',
  name: 'Intelligence Artificielle',
  programme_id: 1,
  available_from_level: 3,
  capacity: 30,
  type: 'Obligatoire',
  selection_mode: 'Exclusive',
  is_active: true
})

// Update specialization
const updated = await specializationService.update(1, {
  capacity: 40,
  min_average_required: 13.0
})

// Delete specialization
await specializationService.delete(1)
```

---

### Example 4: Managing Candidates

```typescript
'use client'

import { useSpecializationCandidates } from '@/modules/StructureAcademique'

export default function CandidatesManager({ specializationId }: { specializationId: number }) {
  const {
    candidates,
    loading,
    error,
    assignStudents,
    promoteWaitlist
  } = useSpecializationCandidates(specializationId)

  const handleAssign = async () => {
    const pendingIds = candidates
      .filter(c => c.status === 'pending')
      .map(c => c.id)

    try {
      const result = await assignStudents(pendingIds, {
        min_average: 12.0,
        prioritize_by: 'average',
        auto_waitlist: true
      })
      
      console.log('Assignment result:', result)
      alert(`Assigned: ${result.assigned.length}, Waitlisted: ${result.waitlisted.length}`)
    } catch (err) {
      console.error('Assignment failed:', err)
    }
  }

  const handlePromote = async () => {
    try {
      const result = await promoteWaitlist(5) // Promote 5 students
      alert(`Promoted ${result.assigned.length} students from waitlist`)
    } catch (err) {
      console.error('Promotion failed:', err)
    }
  }

  if (loading) return <div>Loading candidates...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Candidates ({candidates.length})</h2>
      <button onClick={handleAssign}>Assign Pending</button>
      <button onClick={handlePromote}>Promote Waitlist</button>
      
      <ul>
        {candidates.map(candidate => (
          <li key={candidate.id}>
            {candidate.student?.username} - {candidate.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 5: Custom Specialization Form

```typescript
'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, number, boolean } from 'valibot'
import { specializationService } from '@/modules/StructureAcademique'
import type { SpecializationFormInput } from '@/modules/StructureAcademique'

const schema = object({
  code: string(),
  name: string(),
  programme_id: number(),
  available_from_level: number(),
  type: string(),
  selection_mode: string(),
  is_active: boolean()
})

export default function CustomSpecializationForm() {
  const { control, handleSubmit } = useForm<SpecializationFormInput>({
    resolver: valibotResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      programme_id: 0,
      available_from_level: 1,
      type: 'Obligatoire',
      selection_mode: 'Exclusive',
      is_active: true
    }
  })

  const onSubmit = async (data: SpecializationFormInput) => {
    try {
      await specializationService.create(data)
      alert('Specialization created!')
    } catch (err) {
      console.error('Failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="code"
        control={control}
        render={({ field }) => (
          <input {...field} placeholder="Code" />
        )}
      />
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <input {...field} placeholder="Name" />
        )}
      />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

### Example 6: Filtering Specializations

```typescript
'use client'

import { useSpecializations } from '@/modules/StructureAcademique'
import { useMemo, useState } from 'react'

export default function FilteredSpecializations() {
  const { specializations, loading } = useSpecializations()
  const [filterType, setFilterType] = useState<'all' | 'Obligatoire' | 'Optionnelle'>('all')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)

  const filtered = useMemo(() => {
    return specializations.filter(spec => {
      if (filterType !== 'all' && spec.type !== filterType) return false
      if (filterActive !== null && spec.is_active !== filterActive) return false
      return true
    })
  }, [specializations, filterType, filterActive])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div>
        <button onClick={() => setFilterType('all')}>All</button>
        <button onClick={() => setFilterType('Obligatoire')}>Obligatoire</button>
        <button onClick={() => setFilterType('Optionnelle')}>Optionnelle</button>
      </div>
      <div>
        <button onClick={() => setFilterActive(null)}>All Status</button>
        <button onClick={() => setFilterActive(true)}>Active Only</button>
        <button onClick={() => setFilterActive(false)}>Inactive Only</button>
      </div>
      
      <p>Found {filtered.length} specializations</p>
      <ul>
        {filtered.map(spec => (
          <li key={spec.id}>
            {spec.name} ({spec.type}) - {spec.is_active ? 'Active' : 'Inactive'}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Example 7: Specialization Statistics

```typescript
'use client'

import { useSpecializations } from '@/modules/StructureAcademique'
import { useMemo } from 'react'

export default function SpecializationStats() {
  const { specializations, loading } = useSpecializations()

  const stats = useMemo(() => {
    const total = specializations.length
    const active = specializations.filter(s => s.is_active).length
    const obligatoire = specializations.filter(s => s.type === 'Obligatoire').length
    const optionnelle = specializations.filter(s => s.type === 'Optionnelle').length
    const withCapacity = specializations.filter(s => s.capacity !== null).length
    const totalCandidates = specializations.reduce((sum, s) => sum + (s.candidates_count || 0), 0)
    const totalCapacity = specializations.reduce((sum, s) => sum + (s.capacity || 0), 0)

    return {
      total,
      active,
      obligatoire,
      optionnelle,
      withCapacity,
      totalCandidates,
      totalCapacity,
      fillRate: totalCapacity > 0 ? ((totalCandidates / totalCapacity) * 100).toFixed(1) : 0
    }
  }, [specializations])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Specialization Statistics</h2>
      <ul>
        <li>Total Specializations: {stats.total}</li>
        <li>Active: {stats.active}</li>
        <li>Obligatoire: {stats.obligatoire}</li>
        <li>Optionnelle: {stats.optionnelle}</li>
        <li>With Capacity Limit: {stats.withCapacity}</li>
        <li>Total Candidates: {stats.totalCandidates}</li>
        <li>Total Capacity: {stats.totalCapacity}</li>
        <li>Fill Rate: {stats.fillRate}%</li>
      </ul>
    </div>
  )
}
```

---

### Example 8: Student Application Interface

```typescript
'use client'

import { useState } from 'react'
import { useSpecializations } from '@/modules/StructureAcademique'
import { specializationService } from '@/modules/StructureAcademique'

export default function StudentApplicationForm({ studentId }: { studentId: number }) {
  const { specializations, loading } = useSpecializations()
  const [selectedSpecs, setSelectedSpecs] = useState<number[]>([])
  const [applying, setApplying] = useState(false)

  // Filter only active specializations with open applications
  const availableSpecs = specializations.filter(spec => {
    if (!spec.is_active) return false
    
    const now = new Date()
    const startDate = spec.application_start_date ? new Date(spec.application_start_date) : null
    const endDate = spec.application_end_date ? new Date(spec.application_end_date) : null
    
    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    
    return true
  })

  const handleApply = async () => {
    if (selectedSpecs.length === 0) {
      alert('Please select at least one specialization')
      return
    }

    try {
      setApplying(true)
      
      for (let i = 0; i < selectedSpecs.length; i++) {
        await specializationService.apply(selectedSpecs[i], {
          specialization_id: selectedSpecs[i],
          preference_order: i + 1,
          average_at_application: 14.5 // Get from student record
        })
      }
      
      alert('Applications submitted successfully!')
      setSelectedSpecs([])
    } catch (err) {
      console.error('Application failed:', err)
      alert('Failed to submit applications')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div>Loading specializations...</div>

  return (
    <div>
      <h2>Apply for Specializations</h2>
      <p>Select your preferred specializations in order of preference:</p>
      
      <div>
        {availableSpecs.map(spec => (
          <div key={spec.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedSpecs.includes(spec.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSpecs([...selectedSpecs, spec.id])
                  } else {
                    setSelectedSpecs(selectedSpecs.filter(id => id !== spec.id))
                  }
                }}
                disabled={spec.selection_mode === 'Exclusive' && selectedSpecs.length > 0 && !selectedSpecs.includes(spec.id)}
              />
              {spec.name} ({spec.code})
            </label>
            <p>
              Available from: Level {spec.available_from_level} | 
              Capacity: {spec.capacity || 'Unlimited'} | 
              Min Average: {spec.min_average_required || 'None'}
            </p>
          </div>
        ))}
      </div>

      <button onClick={handleApply} disabled={applying || selectedSpecs.length === 0}>
        {applying ? 'Submitting...' : 'Submit Applications'}
      </button>
    </div>
  )
}
```

---

## 🎯 Best Practices

### 1. Always Handle Loading States
```typescript
if (loading) return <CircularProgress />
if (error) return <Alert severity="error">{error}</Alert>
```

### 2. Use TypeScript Types
```typescript
import type { Specialization, SpecializationFormInput } from '@/modules/StructureAcademique'
```

### 3. Handle Errors Gracefully
```typescript
try {
  await createSpecialization(data)
} catch (err) {
  console.error('Failed:', err)
  // Show user-friendly error message
}
```

### 4. Refresh Data After Mutations
```typescript
const { refetch } = useSpecializations()

await createSpecialization(data)
await refetch() // Refresh the list
```

### 5. Use Memoization for Expensive Calculations
```typescript
const filtered = useMemo(() => {
  return specializations.filter(/* ... */)
}, [specializations, filters])
```

---

## 📖 API Reference

See the full API documentation in:
- `src/modules/StructureAcademique/admin/services/specializationService.ts`
- `src/modules/StructureAcademique/admin/hooks/useSpecializations.ts`
- `src/modules/StructureAcademique/admin/hooks/useSpecializationCandidates.ts`

---

**Happy Coding! 🚀**
