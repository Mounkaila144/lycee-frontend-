import { createApiClient } from '@/shared/lib/api-client';

import type {
  Contract,
  CreateContractRequest,
  CreateEmployeeRequest,
  Employee,
  EmployeeFilters,
  MessageResponse,
  PaginatedResponse,
  TerminateContractRequest,
  UpdateEmployeeRequest,
} from '../../types';

/**
 * Employés et contrats — `Modules/Payroll/Routes/admin.php` (Epic 1).
 */
class EmployeeService {
  private baseUrl = '/admin/payroll/employees';

  async getEmployees(filters?: EmployeeFilters, tenantId?: string): Promise<PaginatedResponse<Employee>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Employee>>(this.baseUrl, { params: filters });

    return response.data;
  }

  async getEmployee(employeeId: number, tenantId?: string): Promise<Employee> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: Employee }>(`${this.baseUrl}/${employeeId}`);

    return response.data.data;
  }

  async createEmployee(data: CreateEmployeeRequest, tenantId?: string): Promise<Employee> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<Employee>>(this.baseUrl, data);

    return response.data.data;
  }

  async updateEmployee(employeeId: number, data: UpdateEmployeeRequest, tenantId?: string): Promise<Employee> {
    const client = createApiClient(tenantId);
    const response = await client.put<MessageResponse<Employee>>(`${this.baseUrl}/${employeeId}`, data);

    return response.data.data;
  }

  async deleteEmployee(employeeId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);

    await client.delete(`${this.baseUrl}/${employeeId}`);
  }

  async createContract(employeeId: number, data: CreateContractRequest, tenantId?: string): Promise<Contract> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<Contract>>(`${this.baseUrl}/${employeeId}/contracts`, data);

    return response.data.data;
  }

  async activateContract(employeeId: number, contractId: number, tenantId?: string): Promise<Contract> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<Contract>>(
      `${this.baseUrl}/${employeeId}/contracts/${contractId}/activate`,
    );

    return response.data.data;
  }

  async terminateContract(
    employeeId: number,
    contractId: number,
    data: TerminateContractRequest,
    tenantId?: string,
  ): Promise<Contract> {
    const client = createApiClient(tenantId);

    const response = await client.post<MessageResponse<Contract>>(
      `${this.baseUrl}/${employeeId}/contracts/${contractId}/terminate`,
      data,
    );

    return response.data.data;
  }
}

export const employeeService = new EmployeeService();
