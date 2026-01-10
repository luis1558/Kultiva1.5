import { turso } from '../../seed/db';

export async function GET(req) {
    try {
        // Obtener el token de las cookies
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        //console.log('Token recibido:', token);

        if (!token) {
            return new Response(JSON.stringify({ message: 'No autenticado' }), { status: 401 });
        }

        // Decodificar el token para obtener el payload
        const jwtPayload = JSON.parse(atob(token.split('.')[1]));
        //console.log('Payload del JWT:', jwtPayload);

        const jefeId = jwtPayload.id; // Asegúrate de que este campo existe en tu token
        //console.log('ID del jefe:', jefeId);

        if (!jefeId) {
            return new Response(JSON.stringify({ message: 'No se encontró un ID de jefe' }), { status: 400 });
        }

        // Ejecutar la consulta usando la columna "id" en lugar de "jefe"
        const result = await turso.execute(
            'SELECT dimensiones, promedio_respuesta FROM vw_promedio_respuestas_por_jefe WHERE id = ?',
            [jefeId]  // Ahora pasamos el jefeId para buscarlo en la columna id
        );

        //console.log('Resultado de la consulta:', result);

        return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}
