// Utilidades para manejo de permisos basado en roles

export const ROLES = {
  EMPLOYEE: 'employee',
  LEADER: 'leader', 
  GERENTE: 'gerente',
  ADMIN: 'admin'
} as const;

export type Role = 'employee' | 'leader' | 'gerente' | 'admin';

/**
 * Verifica si un usuario tiene alguno de los roles requeridos
 * @param userRoles Array de roles del usuario
 * @param requiredRoles Array de roles requeridos (solo se necesita uno)
 * @returns true si el usuario tiene acceso
 */
export function hasRole(userRoles: string[], requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Verifica si un usuario tiene todos los roles requeridos
 * @param userRoles Array de roles del usuario
 * @param requiredRoles Array de roles requeridos (se necesitan todos)
 * @returns true si el usuario tiene todos los roles
 */
export function hasAllRoles(userRoles: string[], requiredRoles: Role[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}

/**
 * Verifica si un usuario es administrador
 */
export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes(ROLES.ADMIN);
}

/**
 * Verifica si un usuario es gerente o superior
 */
/**
 * Verifica si un usuario es gerente o superior
 */
export function isGerenteOrHigher(userRoles: string[]): boolean {
  return [ROLES.GERENTE, ROLES.ADMIN].some(role => userRoles.includes(role));
}

/**
 * Verifica si un usuario es líder o superior
 */
export function isLeaderOrHigher(userRoles: string[]): boolean {
  return [ROLES.LEADER, ROLES.GERENTE, ROLES.ADMIN].some(role => userRoles.includes(role));
}