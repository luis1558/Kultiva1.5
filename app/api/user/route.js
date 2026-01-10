import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { turso } from '../../seed/db';

const SECRET_KEY = new TextEncoder().encode(process.env.AUTH_SECRET || 'mysecretkey');

export async function GET(req) {
    // Obtener token desde los headers
    const authHeader = req.headers.get("Authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    // Si no hay token en el header, intentar obtenerlo desde las cookies
    if (!token) {
        const tokenCookie = req.cookies.get('token');
        token = tokenCookie?.value;
    }

    // Si no hay token en ningún lado, devolver error
    if (!token) {
        return NextResponse.json({ error: 'No autenticado: Token no encontrado' }, { status: 401 });
    }

    try {
        // Verificar el token JWT
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const userId = payload.id;

        // Consulta para obtener datos del empleado y su jefe
        const result = await turso.execute(`
            SELECT 
                e.id AS id, 
                e.nombre, 
                e.correo, 
                j.nombre AS jefe_nombre, 
                j.id AS jefe_id
            FROM empleados e
            LEFT JOIN jefe_empleado je ON e.id = je.empleado_id
            LEFT JOIN empleados j ON je.jefe_id = j.id
            WHERE e.id = ?
        `, [userId]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Normalización de datos para que coincidan con el contexto
            const normalizedUser = {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                jefe_nombre: user.jefe_nombre || null,
                jefe_id: user.jefe_id || null,
            };

            return NextResponse.json({ user: normalizedUser }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error al verificar el token o consultar la base de datos:', error);
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
}
