import { MenuConfig } from '@/shared/types/menu-config.types';

export interface AuthUser {
  roles: string[];
  permissions: string[];
}

/**
 * Roles autorisés à voir, par défaut, un item qui n'a pas de `requiredRoles`
 * explicite. Sans cette liste, n'importe quel item non tagué serait visible
 * à tous les rôles (bug constaté : Professeur voyait toute la sidebar admin).
 */
export const PRIVILEGED_ROLES = ['Administrator', 'Manager'] as const;

function hasPrivilegedRole(user: AuthUser): boolean {
  return user.roles.some((r) => (PRIVILEGED_ROLES as readonly string[]).includes(r));
}

/**
 * Decide whether a menu item should be visible to the user.
 * - If `requiredRoles` is set, the user must have at least one of them.
 * - If `requiredPermissions` is set, the user must have ALL of them.
 * - If neither is set, the item is only visible to privileged roles
 *   (Administrator / Manager). This avoids leaking admin menus to
 *   Professeur / Étudiant / Parent / Caissier, etc.
 */
export function userCanSeeMenu(
  item: MenuConfig,
  user: AuthUser | null | undefined
): boolean {
  if (!user) {
    return !item.requiredRoles?.length && !item.requiredPermissions?.length;
  }

  if (item.requiredRoles?.length) {
    const ok = item.requiredRoles.some((r) => user.roles.includes(r));
    if (!ok) return false;
  } else if (!item.requiredPermissions?.length) {
    // No tags at all → privileged-only default.
    if (!hasPrivilegedRole(user)) return false;
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
 * Chaque item est jugé indépendamment via {@link userCanSeeMenu}. Pas
 * d'héritage du parent vers l'enfant : avec la politique « par défaut
 * réservé aux rôles privilégiés » (Administrator/Manager), un enfant
 * sans `requiredRoles` est masqué pour tout autre rôle — c'est ce qu'on
 * veut. Inversement, si un parent a `requiredRoles: ['Professeur', ...]`
 * mais qu'un enfant doit rester réservé Admin, l'enfant le déclare
 * explicitement.
 *
 * Les parents qui finissent sans aucun enfant visible et sans route
 * propre sont éliminés à leur tour.
 */
export function filterMenuItems(
  items: MenuConfig[],
  user: AuthUser | null | undefined
): MenuConfig[] {
  return items
    .map((item) => {
      if (!userCanSeeMenu(item, user)) {
        return null;
      }

      if (!item.children?.length) {
        return item;
      }

      const children = filterMenuItems(item.children, user);
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
