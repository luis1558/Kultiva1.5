import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener __dirname en ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

async function importarPlanesDeAccionDesdeExcel() {
    try {
        // Ruta al archivo Excel (relativa al archivo actual)
        const filePath = `${__dirname}/planes_de_accion.xlsx`;
        
        // 1. Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${filePath} no existe`);
        }

        // 2. Leer el archivo Excel
        const workbook = xlsx.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 3. Convertir a JSON
        const planes_de_acciones = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`Procesando ${planes_de_acciones.length} planes_de_accion planes_de_accion...`);
        
        // 4. Procesar cada relación
        for (const planes_de_accion of planes_de_acciones) {
            try {
                // Validar que existan ambos IDs
                if (!planes_de_accion.empleado_id || !planes_de_accion.dimension_id) {
                    console.warn(`Relación incompleta: empleado_id=${planes_de_accion.empleado_id}, dimension_id=${planes_de_accion.dimension_id}`);
                    continue;
                }
                
                // Insertar en la base de datos
                await turso.execute({
                    sql: `INSERT INTO planes_de_accion (id, empleado_id, dimension_id, sugerencia_1, sugerencia_2, periodo_inicial_1, periodo_final_1, periodo_inicial_2, periodo_final_2, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        planes_de_accion.id, // Asignar null si no hay ID
                        planes_de_accion.empleado_id,
                        planes_de_accion.dimension_id,
                        planes_de_accion.sugerencia_1|| null,
                        planes_de_accion.sugerencia_2|| null,
                        planes_de_accion.periodo_inicial_1|| null,
                        planes_de_accion.periodo_final_1|| null,
                        planes_de_accion.periodo_inicial_2|| null,
                        planes_de_accion.periodo_final_2|| null,
                        planes_de_accion.fecha_creacion || null,
                        planes_de_accion.fecha_actualizacion || null
                    ]
                });
                
                console.log(`Relación empleado_id=${planes_de_accion.empleado_id}, dimension_id=${planes_de_accion.dimension_id} insertada correctamente`);
            } catch (error) {
                if (error.message.includes('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed')) {
                    console.error(`Error de clave foránea: empleado_id=${planes_de_accion.empleado_id} o dimension_id=${planes_de_accion.dimension_id} no existe en la tabla empleados`);
                } else if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed')) {
                    console.warn(`Relación duplicada: empleado_id=${planes_de_accion.empleado_id} ya tiene un jefe asignado`);
                } else {
                    console.error(`Error procesando relación empleado_id=${planes_de_accion.empleado_id}:`, error.message);
                }
            }
        }
        
        console.log('Importación de planes_de_acciones completada con éxito');
    } catch (error) {
        console.error('Error en la importación:', error);
        throw error;
    }
}

// Ejecutar la función
importarPlanesDeAccionDesdeExcel().catch(console.error);