import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener __dirname en ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

async function importarJefeEmpleadoDesdeExcel() {
    try {
        // Ruta al archivo Excel (relativa al archivo actual)
        const filePath = `${__dirname}/jefe_empleado.xlsx`;
        
        // 1. Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${filePath} no existe`);
        }

        // 2. Leer el archivo Excel
        const workbook = xlsx.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 3. Convertir a JSON
        const relaciones = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`Procesando ${relaciones.length} relaciones jefe-empleado...`);
        
        // 4. Procesar cada relación
        for (const relacion of relaciones) {
            try {
                // Validar que existan ambos IDs
                if (!relacion.empleado_id || !relacion.jefe_id) {
                    console.warn(`Relación incompleta: empleado_id=${relacion.empleado_id}, jefe_id=${relacion.jefe_id}`);
                    continue;
                }
                
                // Insertar en la base de datos
                await turso.execute({
                    sql: `INSERT INTO jefe_empleado (empleado_id, jefe_id) VALUES (?, ?)`,
                    args: [
                        Number(relacion.empleado_id),
                        Number(relacion.jefe_id)
                    ]
                });
                
                console.log(`Relación empleado_id=${relacion.empleado_id}, jefe_id=${relacion.jefe_id} insertada correctamente`);
            } catch (error) {
                if (error.message.includes('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed')) {
                    console.error(`Error de clave foránea: empleado_id=${relacion.empleado_id} o jefe_id=${relacion.jefe_id} no existe en la tabla empleados`);
                } else if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed')) {
                    console.warn(`Relación duplicada: empleado_id=${relacion.empleado_id} ya tiene un jefe asignado`);
                } else {
                    console.error(`Error procesando relación empleado_id=${relacion.empleado_id}:`, error.message);
                }
            }
        }
        
        console.log('Importación de relaciones completada con éxito');
    } catch (error) {
        console.error('Error en la importación:', error);
        throw error;
    }
}

// Ejecutar la función
importarJefeEmpleadoDesdeExcel().catch(console.error);