import * as XLSX from 'xlsx';
import { EmpleadoImport } from '../types/employee';

export interface ParseResult {
  data: EmpleadoImport[];
  errores: string[];
  warnings: string[];
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Tomar la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Parsear y validar datos
        const result = parseAndValidateData(jsonData);
        resolve(result);
        
      } catch (error) {
        resolve({
          data: [],
          errores: [`Error al leer el archivo Excel: ${error}`],
          warnings: []
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        data: [],
        errores: ['Error al leer el archivo'],
        warnings: []
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function parseAndValidateData(jsonData: any[]): ParseResult {
  const empleados: EmpleadoImport[] = [];
  const errores: string[] = [];
  const warnings: string[] = [];
  const correosVistos = new Set<string>();
  const nombresVistos = new Set<string>();

  // Mapeo de posibles nombres de columnas
  const columnMapping: { [key: string]: keyof EmpleadoImport } = {
    // Nombres de columna posibles -> campo del tipo
    'nombre': 'nombre_completo',
    'nombre_completo': 'nombre_completo',
    'nombre completo': 'nombre_completo',
    'name': 'nombre_completo',
    'nombre completo del empleado': 'nombre_completo',
    
    'correo': 'correo',
    'email': 'correo',
    'mail': 'correo',
    'correo_electronico': 'correo',
    'correo electrónico': 'correo',
    
    'contraseña': 'contraseña',
    'password': 'contraseña',
    'pass': 'contraseña',
    'clave': 'contraseña',
    
    'area': 'area',
    'departamento': 'area',
    'sector': 'area',
    
    'cargo': 'cargo',
    'puesto': 'cargo',
    'position': 'cargo',
    
    'rol': 'rol',
    'role': 'rol',
    'nivel': 'rol',
    'permiso': 'rol',
    
    'jefe_directo': 'jefe_directo',
    'jefe': 'jefe_directo',
    'supervisor': 'jefe_directo',
    'reporta_a': 'jefe_directo',
    'jefe inmediato': 'jefe_directo',
    
    'cedula': 'cedula',
    'dni': 'cedula',
    'identificacion': 'cedula',
    'id': 'cedula',
    
    'genero': 'genero',
    'género': 'genero',
    'sexo': 'genero',
    
    'fecha_nacimiento': 'fecha_nacimiento',
    'fecha de nacimiento': 'fecha_nacimiento',
    'f_nacimiento': 'fecha_nacimiento',
    
    'fecha_ingreso': 'fecha_ingreso',
    'fecha de ingreso': 'fecha_ingreso',
    'f_ingreso': 'fecha_ingreso',
    'fecha_contratacion': 'fecha_ingreso',
    
    'sede': 'sede',
    'ubicacion': 'sede',
    'oficina': 'sede',
    
    'ciudad': 'ciudad',
    
    'razon_social': 'razon_social',
    'razón social': 'razon_social',
    'empresa': 'razon_social',
    
    'nivel_jerarquico': 'nivel_jerarquico',
    'nivel jerárquico': 'nivel_jerarquico',
    'jerarquia': 'nivel_jerarquico'
  };

  jsonData.forEach((row, index) => {
    try {
      // Mapear columnas a campos
      const empleado: Partial<EmpleadoImport> = {};
      
      // Para cada celda, encontrar el campo correspondiente
      Object.keys(row).forEach(header => {
        const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, '_');
        const field = columnMapping[normalizedHeader];
        
        if (field) {
          let value = row[header];
          
          // Convertir a string y limpiar
          if (value !== null && value !== undefined) {
            value = String(value).trim();
          }
          
          (empleado as any)[field] = value;
        }
      });

      // Validaciones requeridas
      if (!empleado.nombre_completo) {
        errores.push(`Fila ${index + 2}: Falta nombre completo`);
        return;
      }

      if (!empleado.correo) {
        errores.push(`Fila ${index + 2}: Falta correo para ${empleado.nombre_completo}`);
        return;
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(empleado.correo)) {
        errores.push(`Fila ${index + 2}: Correo inválido: ${empleado.correo}`);
        return;
      }

      // Validar duplicados de correo
      if (correosVistos.has(empleado.correo.toLowerCase())) {
        errores.push(`Fila ${index + 2}: Correo duplicado: ${empleado.correo}`);
        return;
      }
      correosVistos.add(empleado.correo.toLowerCase());

      // Validar duplicados de nombre
      if (nombresVistos.has(empleado.nombre_completo.toLowerCase())) {
        warnings.push(`Fila ${index + 2}: Nombre duplicado: ${empleado.nombre_completo}`);
      }
      nombresVistos.add(empleado.nombre_completo.toLowerCase());

      // Validaciones de género
      if (empleado.genero) {
        const genero = empleado.genero.toLowerCase();
        if (genero !== 'm' && genero !== 'f' && genero !== 'masculino' && genero !== 'femenino') {
          warnings.push(`Fila ${index + 2}: Género no válido: ${empleado.genero}. Se usará 'm' por defecto`);
          empleado.genero = 'm';
        } else if (genero === 'masculino') {
          empleado.genero = 'm';
        } else if (genero === 'femenino') {
          empleado.genero = 'f';
        }
      }

      // Validar que los campos opcionales no estén vacíos
      if (empleado.jefe_directo) {
        const jefe = empleado.jefe_directo.trim();
        if (jefe === '') {
          delete empleado.jefe_directo;
        }
      }

      // Agregar empleado válido
      empleados.push(empleado as EmpleadoImport);
      
    } catch (error) {
      errores.push(`Fila ${index + 2}: Error al procesar la fila - ${error}`);
    }
  });

  // Validaciones cruzadas
  const jefesMencionados = new Set(
    empleados
      .filter(emp => emp.jefe_directo)
      .map(emp => emp.jefe_directo!.toLowerCase())
  );

  const nombresDeEmpleados = new Set(
    empleados.map(emp => emp.nombre_completo.toLowerCase())
  );

  jefesMencionados.forEach(jefe => {
    if (!nombresDeEmpleados.has(jefe)) {
      warnings.push(`El jefe "${jefe}" no existe en el listado de empleados`);
    }
  });

  return {
    data: empleados,
    errores,
    warnings
  };
}