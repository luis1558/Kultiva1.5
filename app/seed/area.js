import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Función para limpiar y validar datos
function prepararDatos(area) {
  return {
    id: area.id !== undefined ? parseInt(area.id) || null : null,
    area: area.area?.toString().trim() || null
  };
}

async function importarAreasDesdeExcel() {
  try {
    const filePath = `${__dirname}/area.xlsx`;
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${filePath} no existe`);
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const areas = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Procesando ${areas.length} áreas...`);
    
    for (const area of areas) {
      try {
        const datos = prepararDatos(area);
        
        // Validación básica de datos
        if (datos.area === null) {
          console.warn(`Área con ID ${datos.id || 'sin ID'} no tiene nombre, se omitirá`);
          continue;
        }
        
        await turso.execute({
          sql: `INSERT INTO area (id, area) VALUES (?, ?)`,
          args: [
            datos.id,
            datos.area
          ]
        });
        
        console.log(`Área "${datos.area}" (ID: ${datos.id}) insertada correctamente`);
      } catch (error) {
        console.error(`Error procesando área con ID ${area.id || 'sin ID'}:`, error.message);
        // Muestra los datos problemáticos para diagnóstico
        console.error('Datos problemáticos:', area);
      }
    }
    
    console.log('Importación de áreas completada con éxito');
  } catch (error) {
    console.error('Error en la importación de áreas:', error);
    throw error;
  }
}

importarAreasDesdeExcel().catch(console.error);