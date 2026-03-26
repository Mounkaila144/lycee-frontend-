import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { employeeService } from '../services';
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateContractRequest,
  CreateAmendmentRequest,
  TerminateContractRequest,
  EmployeeFilters,
} from '../../types';

export const useEmployees = (filters?: EmployeeFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-employees', filters],
    queryFn: () => employeeService.getEmployees(filters, tenantId),
  });
};

export const useEmployee = (employeeId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-employee', employeeId],
    queryFn: () => employeeService.getEmployee(employeeId!, tenantId),
    enabled: !!employeeId,
  });
};

export const useCreateEmployee = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) =>
      employeeService.createEmployee(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-employees'] });
    },
  });
};

export const useUpdateEmployee = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(employeeId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-employees'] });
      qc.invalidateQueries({ queryKey: ['payroll-employee'] });
    },
  });
};

export const useDeleteEmployee = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: number) =>
      employeeService.deleteEmployee(employeeId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-employees'] });
    },
  });
};

export const useEmployeeContracts = (employeeId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['payroll-employee-contracts', employeeId],
    queryFn: () => employeeService.getContracts(employeeId!, tenantId),
    enabled: !!employeeId,
  });
};

export const useCreateContract = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractRequest) =>
      employeeService.createContract(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-employees'] });
      qc.invalidateQueries({ queryKey: ['payroll-employee'] });
      qc.invalidateQueries({ queryKey: ['payroll-employee-contracts'] });
    },
  });
};

export const useCreateAmendment = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAmendmentRequest) =>
      employeeService.createAmendment(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-employee-contracts'] });
    },
  });
};

export const useTerminateContract = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: number; data: TerminateContractRequest }) =>
      employeeService.terminateContract(contractId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-employees'] });
      qc.invalidateQueries({ queryKey: ['payroll-employee'] });
      qc.invalidateQueries({ queryKey: ['payroll-employee-contracts'] });
    },
  });
};
