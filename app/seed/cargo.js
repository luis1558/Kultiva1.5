import { turso } from './db.js';
import xlsx from 'xlsx';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// funcion para limpiar y validar datos
function prepararDatos(cargo) {
    return {
        id: cargo.id !== undefined ? parseInt(cargo.id) || null : null,
        cargo: cargo.cargo?.toString().trim() || null,
        areaid: cargo.areaid !== undefined ? parseInt(cargo.areaid) || null : null,
    };
}

async function importarCargosDesdeExcel() {
    try {
        const filePath = `${__dirname}/cargo.xlsx`;

        if (!fs.existsSync(filePath)) {
            throw new Error (`El archivo ${filePath} no existe`);
        }

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const cargos = xlsx.utils.sheet_to_json(worksheet);

        console.log(`Procesando ${cargos.length} cargos...`);

        for (const cargo of cargos) {
            try {
                const datos = prepararDatos(cargo);

                // Validacion básica de datos
                if (datos.cargo === null) {
                    console.warn(`Cargo con ID ${datos.id || 'sin ID'} no tiene nombre, se omitirá`);
                    continue;
                }

                await turso.execute({
                    sql: `INSERT INTO cargo (id, cargo, areaid) VALUES (?, ?, ?)`,
                    args: [
                        datos.id,
                        datos.cargo,
                        datos.areaid
                    ]
                });

                console.log(`Cargo "${datos.cargo}" (ID: ${datos.id}) insertado correctamente`);
            }   catch (error) {
                console.error(`Error procesando cargo con ID ${cargo.id || 'sin ID'}:`, error.message);
                // Muestra los datos problemáticos para diagnóstico
                console.error('Datos problemáticos:', cargo);
            }
        }

        console.log('Importación de cargos completada con éxito');
    } catch (error) {
        console.error('Error en la importación de cargos:', error);
        throw error;
    }
}

importarCargosDesdeExcel().catch(console.error);