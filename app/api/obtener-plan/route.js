import { turso } from '../../seed/db';

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const empleado_id = url.searchParams.get('empleado_id');
        const dimension_id = url.searchParams.get('dimension_id');

        if (!empleado_id || !dimension_id) {
            return new Response(JSON.stringify({ message: 'Faltan parámetros "empleado_id" o "dimension_id"' }), { status: 400 });
        }

        const query = `
            SELECT 
                sugerencia_1, sugerencia_2, 
                periodo_inicial_1, periodo_final_1, 
                periodo_inicial_2, periodo_final_2
            FROM planes_de_accion
            WHERE empleado_id = ? AND dimension_id = ?
        `;

        const result = await turso.execute(query, [empleado_id, dimension_id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ message: 'No se encontraron planes de acción' }), { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
        console.error('Error al obtener el plan de acción:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}
