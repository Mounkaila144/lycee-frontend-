/** Stub types - LMD module not yet migrated */
export interface Module {
  id: number
  name: string
  code: string
  description?: string
}

export interface ModuleFormInput {
  name: string
  code: string
  description?: string
}
