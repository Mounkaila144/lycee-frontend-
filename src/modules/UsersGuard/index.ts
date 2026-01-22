/**
 * Users Module
 * Public API exports
 */

// Admin layer exports - Users
export { UsersList } from '../UsersGuard/admin/components/UsersList';
export { useUsers } from '../UsersGuard/admin/hooks/useUsers';
export { userService } from '../UsersGuard/admin/services/userService';

// Admin layer exports - Students
export { useStudents } from '../UsersGuard/admin/hooks/useStudents';
export { studentService } from '../UsersGuard/admin/services/studentService';

// Admin layer exports - Financial Roles
export { useCashiers } from '../UsersGuard/admin/hooks/useCashiers';
export { useAccountants } from '../UsersGuard/admin/hooks/useAccountants';
export { useAccountingClerks } from '../UsersGuard/admin/hooks/useAccountingClerks';
export { cashierService } from '../UsersGuard/admin/services/cashierService';
export { accountantService } from '../UsersGuard/admin/services/accountantService';
export { accountingClerkService } from '../UsersGuard/admin/services/accountingClerkService';

// Admin layer exports - Permissions & Roles Management
export { usePermissionsList } from '../UsersGuard/admin/hooks/usePermissions';
export { useRolesList } from '../UsersGuard/admin/hooks/useRoles';
export { useUserPermissionsMutations } from '../UsersGuard/admin/hooks/useUserPermissionsMutations';
export { useUserRolesMutations } from '../UsersGuard/admin/hooks/useUserRolesMutations';
export { permissionService } from '../UsersGuard/admin/services/permissionService';
export { roleService } from '../UsersGuard/admin/services/roleService';
export { ManagePermissionsDialog } from '../UsersGuard/admin/components/ManagePermissionsDialog';
export { ManageRolesDialog } from '../UsersGuard/admin/components/ManageRolesDialog';
export { UserPermissionsSection } from '../UsersGuard/admin/components/UserPermissionsSection';
export { UserRolesSection } from '../UsersGuard/admin/components/UserRolesSection';
export { RolesManagementDialog } from '../UsersGuard/admin/components/RolesManagementDialog';
export { PermissionsManagementDialog } from '../UsersGuard/admin/components/PermissionsManagementDialog';
export { RoleFormDialog } from '../UsersGuard/admin/components/RoleFormDialog';
export { PermissionFormDialog } from '../UsersGuard/admin/components/PermissionFormDialog';

// Type exports - Users
export type { User, UserGroup, UserFilters, PaginationMeta } from '../UsersGuard/types/user.types';

// Type exports - Students
export type { Student, StudentQueryParams, PaginatedStudentsResponse } from '../UsersGuard/types/student.types';

// Type exports - Financial Roles
export type {
  Cashier,
  Accountant,
  AccountingClerk,
  FinancialUser,
  FinancialRole,
  PaginatedCashiersResponse,
  PaginatedAccountantsResponse,
  PaginatedAccountingClerksResponse
} from '../UsersGuard/types/financial.types';

// Type exports - Permissions & Roles
export type { Permission, PermissionsListResponse, ManagePermissionsPayload } from '../UsersGuard/types/permission.types';
export type { Role, RolesListResponse, ManageRolesPayload } from '../UsersGuard/types/role.types';
