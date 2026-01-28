import { hasRole } from "./roles";

export function getEncuestaUrlByRole(userRoles: string[] | null): string {
  if (!userRoles || userRoles.length === 0) return "/dashboard"; // Fallback si no hay roles

  // Si es employee, va a valoracion-colaborador
  if (hasRole(userRoles, ["employee"])) {
    return "/dashboard/valoracion-colaborador";
  }

  // Si es leader o superior, va a valoración
  if (hasRole(userRoles, ["leader", "gerente", "consultores", "admin"])) {
    return "/dashboard/valoracion";
  }

  // Default fallback
  return "/dashboard";
}

