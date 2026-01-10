import { turso } from '../../seed/db';

export async function GET(req) {
    try {
        // Obtener la dimensión de la query string
        const url = new URL(req.url);
        const dimension = url.searchParams.get('dimension');

        if (!dimension) {
            return new Response(JSON.stringify({ message: 'Falta el parámetro "dimension"' }), { status: 400 });
        }

        // Consulta para obtener las sugerencias de la dimensión específica
        const query = `
            SELECT 
                sugerencia_1,
                sugerencia_2,
                sugerencia_3,
                sugerencia_4TEXT as sugerencia_4,
                sugerencia_5TEXT as sugerencia_5
            FROM dimensiones
            WHERE dimensiones = ?
        `;
        const result = await turso.execute(query, [dimension]);

        if (result.rows.length === 0) {
            return new Response(
                JSON.stringify({ message: `No se encontraron sugerencias para la dimensión "${dimension}"` }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}
