'use client';

// React Imports
import { createContext, useContext, useState, useEffect } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import AdministrativeEnrollmentListTable from './AdministrativeEnrollmentListTable';

// Hook Imports
import { useAdministrativeEnrollments, type PaginationMeta } from '../hooks/useAdministrativeEnrollments';

// Service Imports
import { programmeService } from '@/modules/StructureAcademique/admin/services/programmeService';
import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';

// Type Imports
import type {
  AdministrativeEnrollment,
  AdministrativeEnrollmentQueryParams,
  CreateAdministrativeEnrollmentRequest,
  UpdateAdministrativeEnrollmentRequest,
} from '../../types/administrativeEnrollment.types';
import type { Programme } from '@/modules/StructureAcademique/types/programme.types';

// Simple types for academic year and semester
interface AcademicYear {
  id: number;
  name: string;
  is_active?: boolean;
}

interface Semester {
  id: number;
  name: string;
  code?: string;
}

// Create context for sharing enrollment data between components
interface AdministrativeEnrollmentsContextType {
  enrollments: AdministrativeEnrollment[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  params: AdministrativeEnrollmentQueryParams;
  updateParams: (newParams: Partial<AdministrativeEnrollmentQueryParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Partial<AdministrativeEnrollmentQueryParams>) => void;
  refresh: () => void;
  createEnrollment: (data: CreateAdministrativeEnrollmentRequest) => Promise<any>;
  updateEnrollment: (id: number, data: UpdateAdministrativeEnrollmentRequest) => Promise<AdministrativeEnrollment>;
  deleteEnrollment: (id: number) => Promise<void>;
  downloadEnrollmentSheet: (id: number) => Promise<void>;
  programmes: Programme[];
  loadingProgrammes: boolean;
  academicYears: AcademicYear[];
  loadingAcademicYears: boolean;
  semesters: Semester[];
  loadingSemesters: boolean;
}

const AdministrativeEnrollmentsContext = createContext<AdministrativeEnrollmentsContextType | undefined>(undefined);

export const useAdministrativeEnrollmentsContext = () => {
  const context = useContext(AdministrativeEnrollmentsContext);

  if (!context) {
    throw new Error('useAdministrativeEnrollmentsContext must be used within AdministrativeEnrollmentList');
  }

  return context;
};

/**
 * AdministrativeEnrollmentList Component
 * Main component for displaying administrative enrollments with table
 */
export const AdministrativeEnrollmentList = () => {
  const enrollmentsData = useAdministrativeEnrollments();
  const { tenantId } = useTenant();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Load programmes when component mounts
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        setLoadingProgrammes(true);
        const response = await programmeService.getProgrammes(tenantId || undefined, {
          per_page: 100,
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

  // Load academic years when component mounts
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setLoadingAcademicYears(true);
        const client = createApiClient(tenantId || undefined);
        const response = await client.get<{ data: AcademicYear[] }>('/admin/academic-years?per_page=100');

        setAcademicYears(response.data.data);
      } catch (err) {
        console.error('Failed to load academic years:', err);
      } finally {
        setLoadingAcademicYears(false);
      }
    };

    loadAcademicYears();
  }, [tenantId]);

  // Load semesters when component mounts
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        setLoadingSemesters(true);
        const client = createApiClient(tenantId || undefined);
        const response = await client.get<{ data: Semester[] }>('/admin/semesters?per_page=100');

        setSemesters(response.data.data);
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };

    loadSemesters();
  }, [tenantId]);

  return (
    <AdministrativeEnrollmentsContext.Provider
      value={{
        ...enrollmentsData,
        programmes,
        loadingProgrammes,
        academicYears,
        loadingAcademicYears,
        semesters,
        loadingSemesters,
      }}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <AdministrativeEnrollmentListTable />
        </Grid>
      </Grid>
    </AdministrativeEnrollmentsContext.Provider>
  );
};

export default AdministrativeEnrollmentList;
