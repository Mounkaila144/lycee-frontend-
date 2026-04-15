/**
 * Stub service for LMD modules (not yet migrated to secondary system)
 */
export const moduleService = {
  getModules: async () => ({ data: [] }),
  getModule: async (_id: number) => null,
  createModule: async (_data: any) => null,
  updateModule: async (_id: number, _data: any) => null,
  deleteModule: async (_id: number) => null,
}
