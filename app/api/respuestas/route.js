import { NextResponse } from 'next/server';
import { turso } from '../../seed/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { jefe_id, empleado_id, respuestas } = body;

        if (!jefe_id || !empleado_id || !Array.isArray(respuestas)) {
            return NextResponse.json(
                { error: 'Datos insuficientes. Se requiere jefe_id, empleado_id y respuestas.' },
                { status: 400 }
            );
        }

        // Verificar si ya existen respuestas
        const checkResult = await turso.execute(
            `
            SELECT COUNT(*) as count
            FROM respuestas_encuesta
            WHERE empleado_id = ? AND jefe_id = ?;
            `,
            [empleado_id, jefe_id]
        );

        if (checkResult[0]?.count > 0) {
            return NextResponse.json(
                { error: 'Ya has respondido esta encuesta. No puedes enviar respuestas nuevamente.' },
                { status: 400 }
            );
        }

        // Mapeo de valores para respuestas cerradas
        const valorMapeo = {
            1: 0.0,
            2: 0.5,
            3: 0.85,
            4: 1,
        };

        // Procesar respuestas
        for (const { pregunta_id, respuesta } of respuestas) {
            if (!pregunta_id || respuesta === undefined) {
                return NextResponse.json(
                    { error: 'Faltan pregunta_id o respuesta en el formulario.' },
                    { status: 400 }
                );
            }

            let respuestaTransformada;

            if (!isNaN(respuesta)) {
                // Si es numérica, aplicar el mapeo
                respuestaTransformada = parseFloat(valorMapeo[respuesta], 10);
                if (isNaN(respuestaTransformada)) {
                    return NextResponse.json(
                        { error: `Respuesta inválida: ${respuesta}` },
                        { status: 400 }
                    );
                }
            } else {
                // Si es texto (respuesta abierta), usar directamente
                respuestaTransformada = respuesta;
            }

            await turso.execute(
                `
                INSERT INTO respuestas_encuesta (jefe_id, empleado_id, pregunta_id, respuesta)
                VALUES (?, ?, ?, ?);
                `,
                [jefe_id, empleado_id, pregunta_id, respuestaTransformada]
            );
        }

        // Verificar si ya está marcado como 'si' en la tabla empleados
        const checkEmpleado = await turso.execute(
            `SELECT encuesta FROM empleados WHERE id = ?;`,
            [empleado_id]
        );

        if (checkEmpleado[0]?.encuesta !== 'si') {
            // Actualizar la tabla empleados marcando que ha respondido la encuesta
            await turso.execute(
                `UPDATE empleados SET encuesta = 'si' WHERE id = ?;`,
                [empleado_id]
            );
        }

        return NextResponse.json(
            { message: 'Gracias por diligenciar la encuesta, respuestas guardadas exitosamente.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error al guardar respuestas:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
