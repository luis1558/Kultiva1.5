import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// funcion para limpiar y validar datos
function prepararDatos(dimensiones) {
    return {
        id: dimensiones.id !== undefined ? parseInt(dimensiones.id) || null : null,
        dimensiones: dimensiones.dimensiones?.toString().trim() || null,
        sugerencia_1: dimensiones.sugerencia_1?.toString().trim() || null,
        sugerencia_2: dimensiones.sugerencia_2?.toString().trim() || null,
        sugerencia_3: dimensiones.sugerencia_3?.toString().trim() || null,
        sugerencia_4TEXT: dimensiones.sugerencia_4TEXT?.toString().trim() || null,
        sugerencia_5TEXT: dimensiones.sugerencia_5TEXT?.toString().trim() || null
    };
}

async function importarDimensionesDesdeExcel() {
    try {
        const filePath = `${__dirname}/dimensiones.xlsx`;

        if (!fs.existsSync(filePath)) {
            throw new Error (`El archivo ${filePath} no existe`);
        }

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const dimensiones = xlsx.utils.sheet_to_json(worksheet);

        console.log(`Procesando ${dimensiones.length} dimensiones...`);

        for (const dimension of dimensiones) {
            try {
                const datos = prepararDatos(dimension);

                // Validacion básica de datos
                if (datos.dimensiones === null) {
                    console.warn(`Dimension con ID ${datos.id || 'sin ID'} no tiene nombre, se omitirá`);
                    continue;
                }

                await turso.execute({
                    sql: `INSERT INTO dimensiones (id, dimensiones, sugerencia_1, sugerencia_2, sugerencia_3, sugerencia_4TEXT, sugerencia_5TEXT) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        datos.id,
                        datos.dimensiones,
                        datos.sugerencia_1,
                        datos.sugerencia_2,
                        datos.sugerencia_3,
                        datos.sugerencia_4TEXT,
                        datos.sugerencia_5TEXT
                    ]
                });

                console.log(`Dimension "${datos.dimensiones}" (ID: ${datos.id}) insertada correctamente`);
            }   catch (error) {
                console.error(`Error procesando dimensiones con ID ${dimension.id || 'sin ID'}:`, error.message);
                // Muestra los datos problemáticos para diagnóstico
                console.error('Datos problemáticos:', dimension);
            }
        }

        console.log('Importación de dimensiones completada con éxito');
    } catch (error) {
        console.error('Error en la importación de dimensiones:', error);
        throw error;
    }
}

importarDimensionesDesdeExcel().catch(console.error);