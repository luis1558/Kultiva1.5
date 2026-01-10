import { turso } from '../../seed/db';
import { SignJWT } from 'jose'; // Importa métodos de jose
import bcrypt from 'bcryptjs';

const SECRET_KEY = new TextEncoder().encode(process.env.AUTH_SECRET || 'mysecretkey'); // Codifica la clave

export async function POST(req) {
    const { correo, contraseña } = await req.json();  // Cambia 'usuario' a 'correo'

    try {
        console.log('Correo recibido:', correo);
        const correoString = String(correo).trim();  // Elimina los espacios extra

        // Imprime el correo procesado para depuración
        console.log('Correo a buscar:', correoString);

        // Cambia la consulta para que use la tabla 'empleados' y el campo 'correo'
        const result = await turso.execute('SELECT * FROM empleados WHERE correo = ?', [correoString]);

        // Log de la consulta de base de datos
        console.log('Resultado de la consulta:', result);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Log para verificar el usuario encontrado
            console.log('Usuario encontrado:', user);

            // Comparar la contraseña ingresada con la encriptada
            const match = await bcrypt.compare(contraseña, user.contraseña);

            if (match) {
                // Genera un token JWT usando jose
                const token = await new SignJWT({ id: user.id, correo: user.correo })  // Cambia 'usuario' por 'correo'
                    .setProtectedHeader({ alg: 'HS256' })
                    .setExpirationTime('1h')
                    .sign(SECRET_KEY);

                // Log del token generado
                console.log('Token JWT generado:', token);

                return new Response(JSON.stringify({ message: 'Ingreso exitoso' }), {
                    status: 200,
                    headers: {
                        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Lax`,
                        'Content-Type': 'application/json',
                    },
                });
            } else {
                // Si las contraseñas no coinciden
                console.log('Contraseña incorrecta');
                return new Response(JSON.stringify({ message: 'Contraseña incorrecta' }), { status: 401 });
            }
        } else {
            // Si no se encuentra el correo
            console.log('Correo no encontrado');
            return new Response(JSON.stringify({ message: 'Correo no encontrado' }), { status: 404 });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor' }), { status: 500 });
    }
}
