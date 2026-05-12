import { MenuConfig } from '@/shared/types/menu-config.types';

export interface AuthUser {
  roles: string[];
  permissions: string[];
}

/**
 * Decide whether a menu item should be visible to the user.
 * - If `requiredRoles` is set, user must have at least one of them.
 * - If `requiredPermissions` is set, user must have ALL of them.
 * - If neither is set, the item is visible to all authenticated users.
 */
export function userCanSeeMenu(
  item: MenuConfig,
  user: AuthUser | null | undefined
): boolean {
  if (!user) {
    // No requirements at all → visible (e.g. login page menus). Otherwise hidden.
    return !item.requiredRoles?.length && !item.requiredPermissions?.length;
  }

  if (item.requiredRoles?.length) {
    const ok = item.requiredRoles.some((r) => user.roles.includes(r));
    if (!ok) return false;
  }

  if (item.requiredPermissions?.length) {
    const ok = item.requiredPermissions.every((p) => user.permissions.includes(p));
    if (!ok) return false;
  }

  return true;
}

/**
 * Filter a menu tree based on the user's roles/permissions.
 *
 * - `requiredRoles` se propage du parent vers les enfants qui n'en ont pas
 *   eux-mêmes. Sans cela, des sous-menus sans `requiredRoles` resteraient
 *   visibles à tous (bug constaté : Enseignant voyait tous les sous-items
 *   « Notes / Saisie notes / etc. » alors que le parent était filtré).
 * - Les parents qui finissent sans aucun enfant visible (et sans route propre)
 *   sont éliminés à leur tour.
 */
export function filterMenuItems(
  items: MenuConfig[],
  user: AuthUser | null | undefined,
  inheritedRoles?: string[]
): MenuConfig[] {
  return items
    .map((item) => {
      // Si l'item n'a pas son propre `requiredRoles`, on hérite de celui du parent.
      const effectiveRoles =
        item.requiredRoles && item.requiredRoles.length > 0
          ? item.requiredRoles
          : inheritedRoles;

      const itemForCheck: MenuConfig = effectiveRoles
        ? { ...item, requiredRoles: effectiveRoles }
        : item;

      if (!userCanSeeMenu(itemForCheck, user)) {
        return null;
      }

      if (!item.children?.length) {
        return item;
      }

      const children = filterMenuItems(item.children, user, effectiveRoles);
      return { ...item, children };
    })
    .filter((item): item is MenuConfig => item !== null)
    .filter((item) => {
      // Drop parent groups whose children all got filtered out and that have no own route
      if (item.children && item.children.length === 0 && !item.route) {
        return false;
      }
      return true;
    });
}
