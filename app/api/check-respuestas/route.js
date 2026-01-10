import { NextResponse } from 'next/server';
import { turso } from '../../seed/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const empleado_id = searchParams.get('empleado_id');
        const jefe_id = searchParams.get('jefe_id');

        if (!empleado_id || !jefe_id) {
            return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
        }

        // Verificar si ya existen respuestas
        const result = await turso.execute(
            `
            SELECT COUNT(*) as count
            FROM respuestas_encuesta
            WHERE empleado_id = ? AND jefe_id = ?;
            `,
            [empleado_id, jefe_id]
        );

        console.log('Resultado de la consulta:', result);

        // Extraer correctamente el valor desde result.rows
        const count = result.rows?.[0]?.count || 0;
        const alreadyResponded = count > 0;

        return NextResponse.json({ alreadyResponded }, { status: 200 });
    } catch (error) {
        console.error('Error verificando respuestas:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
