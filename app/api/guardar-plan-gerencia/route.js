import { turso } from '../../seed/db';
// api para guardar el plan de gerencia

export async function POST (req) {
    try {
        const body = await req.json();

        const {
            dimension_id,
            sugerencia_1,
            sugerencia_2,
            periodo_inicial_1,
            periodo_final_1,
            periodo_inicial_2,
            periodo_final_2,
        } = body;

        const query = `
            INSERT INTO planes_de_accion_gerencia (
                dimension_id, sugerencia_1, sugerencia_2,
                periodo_inicial_1, periodo_final_1, periodo_inicial_2, periodo_final_2
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await turso.execute(query, [
            dimension_id,
            sugerencia_1,
            sugerencia_2,
            periodo_inicial_1,
            periodo_final_1,
            periodo_inicial_2,
            periodo_final_2,
        ]);

        return new Response(JSON.stringify({ message: 'Plan de acción guardado exitosamente' }), { status: 201 });
    } catch (error) {
        console.error('Error al guardar el plan de acción:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}