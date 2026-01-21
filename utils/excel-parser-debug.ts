import * as XLSX from 'xlsx';
import { EmpleadoImport } from '../types/employee';

export interface ParseResult {
  data: EmpleadoImport[];
  errores: string[];
  warnings: string[];
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    console.log('📁 Iniciando lectura del archivo:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('✅ Archivo leído exitosamente');
        console.log('🔍 Iniciando parseo del archivo...');
        
        const arrayBuffer = e.target?.result as ArrayBuffer;
        console.log('📊 ArrayBuffer size:', arrayBuffer?.byteLength);
        
        if (!arrayBuffer) {
          throw new Error('No se pudo leer el contenido del archivo');
        }
        
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('📊 Workbook cargado, hojas:', workbook.SheetNames);
        
        if (workbook.SheetNames.length === 0) {
          throw new Error('El Excel no tiene hojas');
        }
        
        // Tomar la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('📋 Worksheet:', sheetName);
        
        // Convertir a JSON con opciones más seguras
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: null
        });
        
        console.log('📋 Datos crudos del Excel:', jsonData);
        console.log('📈 Cantidad de filas:', jsonData.length);
        
        // Parsear y validar datos
        const result = parseAndValidateData(jsonData);
        console.log('✅ Parseo completado:', result);
        resolve(result);
        
      } catch (error) {
        console.error('❌ Error en parseo:', error);
        resolve({
          data: [],
          errores: [`Error al leer el archivo Excel: ${error}`],
          warnings: []
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error('❌ Error al leer archivo (reader.onerror):', error);
      resolve({
        data: [],
        errores: [`Error al leer el archivo: ${error}`],
        warnings: []
      });
    };

    reader.onabort = () => {
      console.error('❌ Lectura abortada');
      resolve({
        data: [],
        errores: ['Lectura del archivo cancelada'],
        warnings: []
      });
    };
    
    try {
      console.log('🚀 Iniciando readAsArrayBuffer...');
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('❌ Error al iniciar readAsArrayBuffer:', error);
      resolve({
        data: [],
        errores: [`Error al iniciar lectura del archivo: ${error}`],
        warnings: []
      });
    }
  });
}

function parseAndValidateData(jsonData: any[]): ParseResult {
  const empleados: EmpleadoImport[] = [];
  const errores: string[] = [];
  const warnings: string[] = [];

  console.log('🔄 Iniciando validación de datos...');

  // Si no hay datos
  if (!jsonData || jsonData.length === 0) {
    return {
      data: [],
      errores: ['El archivo Excel está vacío o no se pudieron leer los datos'],
      warnings: []
    };
  }

  jsonData.forEach((row, index) => {
    try {
      console.log(`🔍 Procesando fila ${index + 1}:`, row);
      
      // Versión simplificada - extraer datos directamente
      const empleado: EmpleadoImport = {
        nombre_completo: String(row.nombre || row['nombre completo'] || row.name || '').trim(),
        correo: String(row.correo || row.email || row.mail || '').trim(),
        contraseña: String(row.contraseña || row.password || row.pass || row.clave || '').trim(),
        area: String(row.area || row.departamento || row.sector || '').trim(),
        cargo: String(row.cargo || row.puesto || row.position || '').trim(),
        rol: String(row.rol || row.role || row.permiso || row.nivel || '').trim(),
        jefe_directo: String(row.jefe_directo || row.jefe || row.supervisor || row['reporta a'] || '').trim() || undefined,
        cedula: String(row.cedula || row.dni || row.identificacion || row.id || '').trim() || undefined,
        genero: row.genero || row.género || row.sexo || row.sex ? 
          (String(row.genero || row.género || row.sexo || row.sex).trim().toLowerCase().startsWith('f') ? 'f' : 'm') : undefined,
        fecha_nacimiento: row.fecha_nacimiento || row['fecha de nacimiento'] ? String(row.fecha_nacimiento || row['fecha de nacimiento']).trim() : undefined,
        fecha_ingreso: row.fecha_ingreso || row['fecha de ingreso'] ? String(row.fecha_ingreso || row['fecha de ingreso']).trim() : undefined,
        sede: String(row.sede || row.ubicacion || row.oficina || '').trim() || undefined,
        ciudad: String(row.ciudad || '').trim() || undefined,
        razon_social: String(row.razon_social || row['razón social'] || row.empresa || '').trim() || undefined,
        nivel_jerarquico: String(row.nivel_jerarquico || row['nivel jerárquico'] || row.nivel || '').trim() || undefined
      };

      console.log(`👤 Empleado parseado:`, empleado);

      // Validaciones requeridas
      if (!empleado.nombre_completo) {
        errores.push(`Fila ${index + 2}: Falta nombre completo`);
        return;
      }

      if (!empleado.correo) {
        errores.push(`Fila ${index + 2}: Falta correo para ${empleado.nombre_completo}`);
        return;
      }

      if (!empleado.contraseña) {
        errores.push(`Fila ${index + 2}: Falta contraseña para ${empleado.nombre_completo}`);
        return;
      }

      if (!empleado.area) {
        errores.push(`Fila ${index + 2}: Falta área para ${empleado.nombre_completo}`);
        return;
      }

      if (!empleado.cargo) {
        errores.push(`Fila ${index + 2}: Falta cargo para ${empleado.nombre_completo}`);
        return;
      }

      if (!empleado.rol) {
        errores.push(`Fila ${index + 2}: Falta rol para ${empleado.nombre_completo}`);
        return;
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(empleado.correo)) {
        errores.push(`Fila ${index + 2}: Correo inválido: ${empleado.correo}`);
        return;
      }

      // Validar género
      if (empleado.genero && empleado.genero !== 'm' && empleado.genero !== 'f') {
        warnings.push(`Fila ${index + 2}: Género no válido: ${empleado.genero}. Se usará 'm' por defecto`);
        empleado.genero = 'm';
      }

      empleados.push(empleado);
      console.log(`✅ Empleado agregado: ${empleado.nombre_completo}`);
      
    } catch (error) {
      console.error(`❌ Error procesando fila ${index + 1}:`, error);
      errores.push(`Fila ${index + 2}: Error al procesar la fila - ${error}`);
    }
  });

  console.log(`📊 Resultado final: ${empleados.length} empleados, ${errores.length} errores`);

  return {
    data: empleados,
    errores,
    warnings
  };
}