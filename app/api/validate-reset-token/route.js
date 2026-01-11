import { turso } from '../../seed/db';

export async function POST(req) {
  try {
    console.log("Inicio del endpoint POST /api/validate-reset-token");

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ message: "Token no proporcionado" }),
        { status: 400 }
      );
    }

    // Verificar si el token existe y no ha expirado
    const result = await turso.execute(`
      SELECT correo, expires_at, used 
      FROM password_resets 
      WHERE token = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [token]);

    if (!result.rows || result.rows.length === 0) {
      console.log("Token no encontrado en la base de datos");
      return new Response(
        JSON.stringify({ message: "Token inválido o no encontrado" }),
        { status: 400 }
      );
    }

    const resetData = result.rows[0];
    const currentTime = Math.floor(Date.now() / 1000);

    // Verificar si el token ha expirado
    if (resetData.expires_at < currentTime) {
      console.log("Token expirado");
      return new Response(
        JSON.stringify({ message: "El token ha expirado. Solicita una nueva recuperación de contraseña" }),
        { status: 400 }
      );
    }

    // Verificar si el token ya fue usado
    if (resetData.used) {
      console.log("Token ya fue usado");
      return new Response(
        JSON.stringify({ message: "Este enlace ya fue utilizado. Solicita una nueva recuperación de contraseña" }),
        { status: 400 }
      );
    }

    console.log(`Token válido para correo: ${resetData.correo}`);
    return new Response(
      JSON.stringify({ message: "Token válido", correo: resetData.correo }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en /api/validate-reset-token:", error);
    return new Response(
      JSON.stringify({ message: "Error al validar el token" }),
      { status: 500 }
    );
  }
}