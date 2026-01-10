import { NextResponse } from 'next/server';
import { turso } from '../../seed/db';

export async function GET() {
    try {
        const result = await turso.execute(`
            SELECT id, pregunta 
            FROM preguntas_encuesta
            ORDER BY id ASC
        `);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'No se encontraron preguntas en la base de datos' }, { status: 404 });
        }

        const dimensiones = [
            'Liderazgo',
            'Calidad de vida',
            'Compromiso',
            'Seguridad psicológica',
            'Comunicación',
            'Diversidad e inclusión',
            'Ética e integridad',
            'Seguridad y estabilidad',
            'Gestión del cambio',
            'Cultura organizacional',
            'Flexibilidad y autonomía',
            'Salud mental',
            'Preguntas abiertas',
        ];

        const preguntas = result.rows;

        const groupedPreguntas = dimensiones.map((dimension, index) => {
            if (dimension === 'Preguntas abiertas') {
                return {
                    dimension,
                    preguntas: preguntas.slice(-3), // Las últimas 3 preguntas son abiertas
                };
            }

            return {
                dimension,
                preguntas: preguntas.slice(index * 5, index * 5 + 5), // 5 preguntas por dimensión
            };
        });

        return NextResponse.json(groupedPreguntas, { status: 200 });
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        return NextResponse.json({ error: 'Error al obtener las preguntas' }, { status: 500 });
    }
}
