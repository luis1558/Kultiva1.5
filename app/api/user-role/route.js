import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers'; // Para obtener cookies
import { turso } from '../../seed/db'; // Tu cliente de base de datos

const SECRET_KEY = new TextEncoder().encode(process.env.AUTH_SECRET || 'mysecretkey');

export async function GET() {
    // Espera a que cookies() se resuelva correctamente
    const cookieStore = await cookies();  // Ahora usamos await para esperar la resolución
    const tokenCookie = cookieStore.get('token'); // Obtiene la cookie 'token'
    const token = tokenCookie?.value;

    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }
    
    try {
        // Decodifica y verifica el token
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const userId = payload.id;

        // Consulta los datos del usuario y sus roles
        const query = `
      SELECT 
        e.id AS empleado_id,
        e.nombre,
        GROUP_CONCAT(r.nombre, ', ') AS roles
      FROM empleados e
      LEFT JOIN rol_empleado re ON e.id = re.empleado_id
      LEFT JOIN roles r ON re.rol_id = r.id
      WHERE e.id = ?
      GROUP BY e.id, e.nombre
    `;
        const result = await turso.execute(query, [userId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const user = result.rows[0];
        
        // Convertir el string de roles a array
        user.roles = user.roles ? user.roles.split(',').map(r => r.trim()) : [];
        
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Error en la verificación del token o consulta:', error);
        return NextResponse.json({ error: 'Token inválido o consulta fallida' }, { status: 401 });
    }
}
