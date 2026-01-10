import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Función para limpiar y validar datos
function prepararDatos(empleado) {
  return {
    id: empleado.id !== undefined ? parseInt(empleado.id) || null : null,
    nombre: empleado.nombre?.toString().trim() || null,
    correo: empleado.correo?.toString().trim() || null,
    contraseña: empleado.contraseña?.toString().trim(),
    cargoid: empleado.cargoid?.toString().trim() || null,
    cedula: empleado.cedula?.toString().trim() || null,
    genero: empleado.genero?.toString().trim() || null,
    fecha_nacimiento: empleado.fecha_nacimiento instanceof Date 
      ? empleado.fecha_nacimiento.toISOString().split('T')[0]
      : empleado.fecha_nacimiento?.toString().trim() || null,
    fecha_ingreso: empleado.fecha_ingreso instanceof Date
      ? empleado.fecha_ingreso.toISOString().split('T')[0]
      : empleado.fecha_ingreso?.toString().trim() || null,
    razon_social: empleado.razon_social?.toString().trim() || null,
    ciudad: empleado.ciudad?.toString().trim() || null,
    sede: empleado.sede?.toString().trim() || null,
    nivel_jerarquico: empleado.nivel_jerarquico?.toString().trim() || null,
    encuesta: empleado.encuesta?.toString().trim() || null,
    correo_enviado_plan: empleado.correo_enviado_plan?.toString().trim() || null,
  };
}

async function importarEmpleadosDesdeExcel() {
  try {
    const filePath = `${__dirname}/empleados.xlsx`;
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${filePath} no existe`);
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const empleados = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Procesando ${empleados.length} empleados...`);
    
    for (const empleado of empleados) {
      try {
        const datos = prepararDatos(empleado);
        
        if (!datos.contraseña) {
          console.warn(`Empleado ${datos.nombre || 'sin nombre'} no tiene contraseña, se omitirá`);
          continue;
        }
        
        await turso.execute({
          sql: `INSERT INTO empleados (
            id, nombre, correo, contraseña, cargoid, cedula, genero, fecha_nacimiento, fecha_ingreso, razon_social, ciudad, sede, nivel_jerarquico, encuesta, correo_enviado_plan
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            datos.id,
            datos.nombre,
            datos.correo,
            datos.contraseña,
            datos.cargoid,
            datos.cedula,
            datos.genero,
            datos.fecha_nacimiento,
            datos.fecha_ingreso,
            datos.razon_social,
            datos.ciudad,
            datos.sede,
            datos.nivel_jerarquico,
            datos.encuesta,
            datos.correo_enviado_plan
          ]
        });
        
        console.log(`Empleado ${datos.nombre} insertado correctamente`);
      } catch (error) {
        console.error(`Error procesando empleado ${empleado.nombre || 'sin nombre'}:`, error.message);
        // Muestra los datos problemáticos para diagnóstico
        console.error('Datos problemáticos:', empleado);
      }
    }
    
    console.log('Importación completada con éxito');
  } catch (error) {
    console.error('Error en la importación:', error);
    throw error;
  }
}

importarEmpleadosDesdeExcel().catch(console.error);