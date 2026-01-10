import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener __dirname en ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

async function importarPreguntas_encuestaDesdeExcel() {
    try {
        // Ruta al archivo Excel (relativa al archivo actual)
        const filePath = `${__dirname}/preguntas_encuesta.xlsx`;
        
        // 1. Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${filePath} no existe`);
        }

        // 2. Leer el archivo Excel
        const workbook = xlsx.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 3. Convertir a JSON
        const preguntas_encuestas = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`Procesando ${preguntas_encuestas.length} preguntas_encuestas jefe-empleado...`);
        
        // 4. Procesar cada relación
        for (const preguntas_encuesta of preguntas_encuestas) {
            try {
                // Validar que existan ambos IDs
                if (!preguntas_encuesta.pregunta || !preguntas_encuesta.dimension_id) {
                    console.warn(`Relación incompleta: preguntas=${preguntas_encuesta.pregunta}, dimension_id=${preguntas_encuesta.dimension_id}`);
                    continue;
                }
                
                // Insertar en la base de datos
                await turso.execute({
                    sql: `INSERT INTO preguntas_encuesta (id, pregunta, dimension_id) VALUES (?, ?, ?)`,
                    args: [
                        preguntas_encuesta.id,
                        preguntas_encuesta.pregunta,
                        preguntas_encuesta.dimension_id
                    ]
                });
                
                console.log(`Relación preguntas=${preguntas_encuesta.preguntas}, dimension_id=${preguntas_encuesta.dimension_id} insertada correctamente`);
            } catch (error) {
                if (error.message.includes('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed')) {
                    console.error(`Error de clave foránea: preguntas=${preguntas_encuesta.preguntas} o dimension_id=${preguntas_encuesta.dimension_id} no existe en la tabla empleados`);
                } else if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed')) {
                    console.warn(`Relación duplicada: preguntas=${preguntas_encuesta.preguntas} ya tiene un jefe asignado`);
                } else {
                    console.error(`Error procesando relación preguntas=${preguntas_encuesta.preguntas}:`, error.message);
                }
            }
        }
        
        console.log('Importación de preguntas_encuesta es completada con éxito');
    } catch (error) {
        console.error('Error en la importación:', error);
        throw error;
    }
}

// Ejecutar la función
importarPreguntas_encuestaDesdeExcel().catch(console.error);