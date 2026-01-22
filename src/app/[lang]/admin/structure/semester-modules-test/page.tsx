'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { SemesterModulesDialog } from '@/modules/StructureAcademique'
import type { Semester } from '@/modules/StructureAcademique/types/academicCalendar.types'

/**
 * Test page for Semester Modules Dialog
 */
export default function SemesterModulesTestPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Mock semester for testing
  const mockSemester: Semester = {
    id: 1,
    academic_year_id: 1,
    name: 'S1',
    start_date: '2024-09-01',
    end_date: '2025-01-31',
    courses_start_date: '2024-09-15',
    courses_end_date: '2024-12-20',
    exams_start_date: '2025-01-05',
    exams_end_date: '2025-01-25',
    is_closed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    academic_year: {
      id: 1,
      name: '2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-08-31',
      is_active: true,
      status: 'Active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test: Gestion des Modules par Semestre
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Cette page teste le dialogue de gestion des modules rattachés aux semestres.
      </Typography>

      <Button variant="contained" onClick={() => setDialogOpen(true)}>
        Ouvrir le dialogue
      </Button>

      <SemesterModulesDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        semester={mockSemester}
      />
    </Box>
  )
}
