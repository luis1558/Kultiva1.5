import { turso } from '../../seed/db';

// esta api te da el promedio de las respuestas de todos los colaboradores de todos los jefes en la tabla 

export async function GET(req) {
    try {
        // Ejecuta la consulta para obtener todos los datos de la vista 
        // vw_promedio_respuestas_general 
        const result = await turso.execute(
            'SELECT * FROM vw_promedio_respuestas_general'
        );

        return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}


