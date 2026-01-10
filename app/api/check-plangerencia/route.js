import { turso } from '../../seed/db';

export async function GET(req) {
    try {
        // Obtener las dimensiones con promedio <= 74 usando la vista vw_promedio_respuestas_general

        const dimensionesResult = await turso.execute(
            'SELECT dimensiones, promedio FROM vw_promedio_respuestas_general WHERE promedio <= 74'
        );

        // Si no hay dimensiones con promedio <= 74, ya consideramos el plan como completo
        if (dimensionesResult.rows.length === 0) {
            return new Response(JSON.stringify({ completo: true }), { status: 200 });
        }

        // Verificar si todas las dimensiones con promedio <= 74 tienen un plan de acción realizado
        let planCompleto = true;
        for (const dimension of dimensionesResult.rows) {
            const { dimensiones: dimensionName } = dimension;

            // Consulta para verificar si la dimensión tiene un plan de acción realizado (no nulo)
            const planResult = await turso.execute(
                `SELECT planes_de_accion_gerencia.sugerencia_1, planes_de_accion_gerencia.sugerencia_2
FROM planes_de_accion_gerencia
INNER JOIN dimensiones
    ON dimensiones.id = planes_de_accion_gerencia.dimension_id
WHERE dimensiones.dimensiones = ? 
  AND planes_de_accion_gerencia.sugerencia_1 IS NOT NULL
  AND planes_de_accion_gerencia.sugerencia_2 IS NOT NULL
`,
                [dimensionName]
            );
            if (planResult.rows.length === 0) {
                planCompleto = false;
                break; // Si alguna dimensión con promedio <= 74 no tiene plan de acción, terminamos la verificación
            }
        }
        // Si todas las dimensiones con promedio <= 74 tienen un plan de acción, el plan está completo
        return new Response(JSON.stringify({ completo: planCompleto }), {
            status: 200
        });

    } catch (error) {
        console.error('Error en el servidor:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}