import { turso } from '../../seed/db';

export async function GET(req) {
    try {
        // Obtener el token de las cookies
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) {
            return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });
        }

        // Decodificar el token para obtener el payload
        const jwtPayload = JSON.parse(atob(token.split('.')[1]));
        const empleadoId = jwtPayload.id; // Asegúrate de que este campo existe en tu token

        if (!empleadoId) {
            return new Response(JSON.stringify({ message: 'No se encontró un ID de empleado' }), { status: 400 });
        }

        // Obtener las dimensiones con promedio <= 74 usando la vista vw_promedio_respuestas_por_jefe
        const dimensionesResult = await turso.execute(
            `
            SELECT dimensiones, promedio_respuesta
            FROM vw_promedio_respuestas_por_jefe
            WHERE id = ? 
              AND promedio_respuesta <= 74
              AND dimensiones != 'Preguntas Abiertas'
            `,
            [empleadoId]
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
                `
                SELECT planes_de_accion.sugerencia_1, planes_de_accion.sugerencia_2
                FROM planes_de_accion
                INNER JOIN dimensiones
                    ON dimensiones.dimensiones = ?
                WHERE empleado_id = ? 
                  AND dimensiones.id = planes_de_accion.dimension_id
                  AND planes_de_accion.sugerencia_1 IS NOT NULL
                  AND planes_de_accion.sugerencia_2 IS NOT NULL
                `,
                [dimensionName, empleadoId]
            );

            if (planResult.rows.length === 0) {
                planCompleto = false;
                break; // Si alguna dimensión con promedio <= 74 no tiene plan de acción, terminamos la verificación
            }
        }

        // Si todas las dimensiones con promedio <= 74 tienen planes de acción realizados
        return new Response(JSON.stringify({ completo: planCompleto }), { status: 200 });

    } catch (error) {
        console.error('Error en el servidor:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}
