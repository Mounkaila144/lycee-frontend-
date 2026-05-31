'use client';

// React Imports
import { createContext, useContext, useState, useEffect } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import StudentListTable from './StudentListTable';

// Hook Imports
import { useStudents } from '../hooks/useStudents';

// Service Imports
import { programmeService } from '@/modules/StructureAcademique/admin/services/programmeService';
import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';

// Type Imports
import type { Student, StudentFormData } from '../../types/student.types';
import type { StudentQueryParams } from '../services/studentService';
import type { PaginationMeta } from '../hooks/useStudents';
import type { Programme } from '@/modules/StructureAcademique/types/programme.types';

// Create context for sharing student data between components
interface StudentsContextType {
  students: Student[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  params: StudentQueryParams;
  updateParams: (newParams: Partial<StudentQueryParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  refresh: () => void;
  createStudent: (data: StudentFormData) => Promise<Student>;
  updateStudent: (studentId: number, data: Partial<StudentFormData>) => Promise<Student>;
  deleteStudent: (studentId: number) => Promise<void>;
  programmes: Programme[];
  loadingProgrammes: boolean;
  classes: { id: number; name: string }[];
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const useStudentsContext = () => {
  const context = useContext(StudentsContext);

  if (!context) {
    throw new Error('useStudentsContext must be used within StudentList');
  }

  return context;
};

/**
 * StudentList Component
 * Main component for displaying students with table
 */
export const StudentList = () => {
  const studentsData = useStudents();
  const { tenantId } = useTenant();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);

  // Load classes once for the secondary "Classe" filter
  useEffect(() => {
    createApiClient(tenantId || undefined)
      .get('/admin/classes', { params: { per_page: 100 } })
      .then(res => {
        const raw = (res.data?.data ?? res.data) as unknown;
        setClasses(Array.isArray(raw) ? (raw as { id: number; name: string }[]) : []);
      })
      .catch(() => setClasses([]));
  }, [tenantId]);

  // Load programmes once when component mounts
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        setLoadingProgrammes(true);
        const response = await programmeService.getProgrammes(tenantId || undefined, {
          per_page: 100,
          statut: 'Actif',
        });

        setProgrammes(response.data);
      } catch (err) {
        console.error('Failed to load programmes:', err);
      } finally {
        setLoadingProgrammes(false);
      }
    };

    loadProgrammes();
  }, [tenantId]);

  return (
    <StudentsContext.Provider value={{ ...studentsData, programmes, loadingProgrammes, classes }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <StudentListTable />
        </Grid>
      </Grid>
    </StudentsContext.Provider>
  );
};

export default StudentList;
