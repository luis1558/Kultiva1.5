export function getEncuestaUrlByRole(role: string | null): string {
  if (!role) return '/dashboard'; // Fallback si no hay rol

  // Roles de colaborador - van a valoracion-colaborador
  const colaboradorRoles = [
    'Agent',
    'Asc Agent', 
    'Asc Ops Agent',
    'Credentialing Team Leader',
    'Asc Sme',
    'Bd Sme',
    'Credentialing Agent',
    'HR Professional',
    'Clearway Agent',
    'Medical Support Sme',
    'Ops Sme',
    'Scheduling Agent',
    'Clearway Sme',
    'Scheduler Agent',
    'HSEQ Leader',
    'Communications Leader',
    'HR Leader',
    'Coastal Sme',
    'Sme',
    'HR Business Partner',
    'Trainer',
    'IT Support',
    'prueba'
  ];

  // Roles de líder - van a valoración
  const liderRoles = [
    'Team Leader',
    'Medical Records Team Lead',
    'Asc Ops Team Leader',
    'Clearway Team Leader',
    'Clearway Trainer',
    'Account Manager',
    'Senior Account Manager',
    'BIS Corporate Trainer',
    'Qa & Trainer',
    'IT Professional',
    'Gerente RH',
    'Gerente General'
  ];

  if (colaboradorRoles.includes(role)) {
    return '/dashboard/valoracion-colaborador';
  }

  if (liderRoles.includes(role)) {
    return '/dashboard/valoracion';
  }

  // Default fallback
  return '/dashboard';
}