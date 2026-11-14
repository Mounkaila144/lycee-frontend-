import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { payrollSettingsService } from '../services/payrollSettingsService';
import type { PayrollSimulationRequest, SavePayrollSettingsRequest } from '../../types';

export const usePayrollSettings = (tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => payrollSettingsService.getOverview(tenantId),
  });

export const usePayrollSettingsVersions = (tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-settings-versions'],
    queryFn: () => payrollSettingsService.getVersions(tenantId),
  });

export const usePayrollSettingsDefaults = (tenantId?: string) =>
  useQuery({
    queryKey: ['payroll-settings-defaults'],
    queryFn: () => payrollSettingsService.getDefaults(tenantId),
  });

export const useSavePayrollSettings = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: SavePayrollSettingsRequest) => payrollSettingsService.saveVersion(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-settings'] });
      qc.invalidateQueries({ queryKey: ['payroll-settings-versions'] });
    },
  });
};

export const usePayrollSimulation = (tenantId?: string) =>
  useMutation({
    mutationFn: (data: PayrollSimulationRequest) => payrollSettingsService.simulate(data, tenantId),
  });
