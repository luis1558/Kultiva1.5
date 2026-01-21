// Tipos para la importación de empleados
export interface EmpleadoImport {
  nombre_completo: string;
  correo: string;
  contraseña: string;
  area: string;
  cargo: string;
  rol: string;
  jefe_directo?: string;
  cedula?: string;
  genero?: 'm' | 'f';
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
  sede?: string;
  ciudad?: string;
  razon_social?: string;
  nivel_jerarquico?: string;
}

export interface ImportResult {
  empleadosImportados: number;
  areasCreadas: number;
  cargosCreados: number;
  rolesCreados: number;
  relacionesCreadas: number;
  exitos: string[];
  errores: string[];
  detalles?: {
    empleados: EmpleadoImport[];
    areas: string[];
    cargos: string[];
    roles: string[];
  };
}

export interface DatabaseEntity {
  id?: number;
  nombre: string;
}

export interface EmpleadoWithId extends EmpleadoImport {
  db_id?: number;
}

export interface JefeEmpleadoRelation {
  empleado_id: number;
  jefe_id: number;
}

// Tipos para la base de datos
export interface Rol {
  id: number;
  nombre: string;
  nivel: number;
  descripcion?: string;
}

export interface Area {
  id: number;
  area: string;
}

export interface Cargo {
  id: number;
  cargo: string;
  areaid: number;
}

export interface Empleado {
  id: number;
  nombre: string;
  correo: string;
  contraseña: string;
  cargoid: number;
  cedula?: string;
  genero?: 'm' | 'f';
  fecha_nacimiento?: string;
  fecha_ingreso?: string;
  razon_social?: string;
  ciudad?: string;
  sede?: string;
  nivel_jerarquico?: string;
  encuesta?: string;
  correo_enviado_plan?: boolean;
}