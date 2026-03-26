import { createApiClient } from '@/shared/lib/api-client';

import type {
  Employee,
  Contract,
  Amendment,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateContractRequest,
  CreateAmendmentRequest,
  TerminateContractRequest,
  EmployeeFilters,
  PaginatedResponse,
} from '../../types';

class EmployeeService {
  private baseUrl = '/admin/payroll/employees';

  async getEmployees(
    filters?: EmployeeFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<Employee>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Employee>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getEmployee(
    employeeId: number,
    tenantId?: string,
  ): Promise<Employee> {
    const client = createApiClient(tenantId);
    const response = await client.get<Employee>(
      `${this.baseUrl}/${employeeId}`,
    );

    return response.data;
  }

  async createEmployee(
    data: CreateEmployeeRequest,
    tenantId?: string,
  ): Promise<Employee> {
    const client = createApiClient(tenantId);
    const response = await client.post<Employee>(
      this.baseUrl,
      data,
    );

    return response.data;
  }

  async updateEmployee(
    employeeId: number,
    data: UpdateEmployeeRequest,
    tenantId?: string,
  ): Promise<Employee> {
    const client = createApiClient(tenantId);
    const response = await client.put<Employee>(
      `${this.baseUrl}/${employeeId}`,
      data,
    );

    return response.data;
  }

  async deleteEmployee(
    employeeId: number,
    tenantId?: string,
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.delete<{ message: string }>(
      `${this.baseUrl}/${employeeId}`,
    );

    return response.data;
  }

  async getContracts(
    employeeId: number,
    tenantId?: string,
  ): Promise<Contract[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<Contract[]>(
      `${this.baseUrl}/${employeeId}/contracts`,
    );

    return response.data;
  }

  async createContract(
    data: CreateContractRequest,
    tenantId?: string,
  ): Promise<Contract> {
    const client = createApiClient(tenantId);
    const response = await client.post<Contract>(
      `/admin/payroll/contracts`,
      data,
    );

    return response.data;
  }

  async createAmendment(
    data: CreateAmendmentRequest,
    tenantId?: string,
  ): Promise<Amendment> {
    const client = createApiClient(tenantId);
    const response = await client.post<Amendment>(
      `/admin/payroll/amendments`,
      data,
    );

    return response.data;
  }

  async terminateContract(
    contractId: number,
    data: TerminateContractRequest,
    tenantId?: string,
  ): Promise<{ message: string; contract: Contract }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; contract: Contract }>(
      `/admin/payroll/contracts/${contractId}/terminate`,
      data,
    );

    return response.data;
  }
}

export const employeeService = new EmployeeService();
