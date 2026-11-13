import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { employeeService } from '../services';
import type {
  CreateContractRequest,
  CreateEmployeeRequest,
  EmployeeFilters,
  TerminateContractRequest,
  UpdateEmployeeRequest,
} from '../../types';

const invalidateEmployees = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['payroll-employees'] });
  qc.invalidateQueries({ queryKey: ['payroll-employee'] });
};

export const useEmployees = (filters?: EmployeeFilters, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-employees', filters],
    queryFn: () => employeeService.getEmployees(filters, tenantId),
  });

export const useEmployee = (employeeId?: number, tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-employee', employeeId],
    queryFn: () => employeeService.getEmployee(employeeId!, tenantId),
    enabled: !!employeeId,
  });

export const useCreateEmployee = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.createEmployee(data, tenantId),
    onSuccess: () => invalidateEmployees(qc),
  });
};

export const useUpdateEmployee = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(employeeId, data, tenantId),
    onSuccess: () => invalidateEmployees(qc),
  });
};

export const useDeleteEmployee = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: number) => employeeService.deleteEmployee(employeeId, tenantId),
    onSuccess: () => invalidateEmployees(qc),
  });
};

export const useCreateContract = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: CreateContractRequest }) =>
      employeeService.createContract(employeeId, data, tenantId),
    onSuccess: () => invalidateEmployees(qc),
  });
};

export const useActivateContract = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, contractId }: { employeeId: number; contractId: number }) =>
      employeeService.activateContract(employeeId, contractId, tenantId),
    onSuccess: () => invalidateEmployees(qc),
  });
};

export const useTerminateContract = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      contractId,
      data,
    }: {
      employeeId: number;
      contractId: number;
      data: TerminateContractRequest;
    }) => employeeService.terminateContract(employeeId, contractId, data, tenantId),
    onSuccess: () => invalidateEmployees(qc),
  });
};
