'use client';

import React, { createContext, useContext } from 'react';
import { Container, Box } from '@mui/material';
import { useModules } from '../hooks/useModules';
import ModuleListTable from './ModuleListTable';
import type { Module, ModuleFormData, ModuleQueryParams, PaginationMeta } from '../../types/module.types';

// Context type
interface ModulesContextType {
  modules: Module[];
  loading: boolean;
  pagination: PaginationMeta | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<ModuleQueryParams>) => void;
  refresh: () => void;
  createModule: (data: ModuleFormData) => Promise<Module>;
  updateModule: (id: number, data: Partial<ModuleFormData>) => Promise<Module>;
  deleteModule: (id: number) => Promise<void>;
}

// Create context
const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

// Hook to use context
export const useModulesContext = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModulesContext must be used within ModuleList');
  }
  return context;
};

const ModuleList: React.FC = () => {
  const modulesData = useModules({
    page: 1,
    per_page: 10,
  });

  return (
    <ModulesContext.Provider value={modulesData}>
      <Container maxWidth={false}>
        <Box sx={{ py: 4 }}>
          <ModuleListTable />
        </Box>
      </Container>
    </ModulesContext.Provider>
  );
};

export default ModuleList;
