/** Stub - LMD module not yet migrated to secondary system */
export const programmeService = {
  getProgrammes: async (_tenantId?: string, _params?: any) => ({ data: [] }),
  getProgramme: async (_id: number, _tenantId?: string) => null,
  createProgramme: async (_data: any, _tenantId?: string) => null,
  updateProgramme: async (_id: number, _data: any, _tenantId?: string) => null,
  deleteProgramme: async (_id: number, _tenantId?: string) => null,
}
