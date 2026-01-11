import bcrypt from "bcryptjs";
import { turso } from '../../seed/db';

export async function POST(req) {
  try {
    console.log("Inicio del endpoint POST /api/reset-password");

    const { token, contraseña } = await req.json();

    if (!token || !contraseña) {
      return new Response(
        JSON.stringify({ message: "Token y contraseña son requeridos" }),
        { status: 400 }
      );
    }

    if (contraseña.length < 6) {
      return new Response(
        JSON.stringify({ message: "La contraseña debe tener al menos 6 caracteres" }),
        { status: 400 }
      );
    }

    // Verificar y obtener el token
    const tokenResult = await turso.execute(`
      SELECT correo, expires_at, used 
      FROM password_resets 
      WHERE token = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [token]);

    if (!tokenResult.rows || tokenResult.rows.length === 0) {
      console.log("Token no encontrado");
      return new Response(
        JSON.stringify({ message: "Token inválido" }),
        { status: 400 }
      );
    }

    const resetData = tokenResult.rows[0];
    const currentTime = Math.floor(Date.now() / 1000);

    // Verificar expiración y uso
    if (resetData.expires_at < currentTime) {
      console.log("Token expirado");
      return new Response(
        JSON.stringify({ message: "El token ha expirado. Solicita una nueva recuperación" }),
        { status: 400 }
      );
    }

    if (resetData.used) {
      console.log("Token ya usado");
      return new Response(
        JSON.stringify({ message: "Este enlace ya fue utilizado" }),
        { status: 400 }
      );
    }

    const correo = resetData.correo;

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    console.log(`Actualizando contraseña para correo: ${correo}`);

    // Actualizar contraseña del empleado
    await turso.execute(`
      UPDATE empleados 
      SET contraseña = ? 
      WHERE correo = ?
    `, [hashedPassword, correo]);

    // Marcar el token como usado
    await turso.execute(`
      UPDATE password_resets 
      SET used = TRUE 
      WHERE token = ?
    `, [token]);

    // Opcional: Invalidar todos los tokens anteriores para este correo
    await turso.execute(`
      UPDATE password_resets 
      SET used = TRUE 
      WHERE correo = ? AND token != ? AND used = FALSE
    `, [correo, token]);

    console.log("Contraseña actualizada exitosamente");

    return new Response(
      JSON.stringify({ 
        message: "Contraseña actualizada exitosamente. Redirigiendo al login..." 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en /api/reset-password:", error);
    return new Response(
      JSON.stringify({ message: "Error al actualizar la contraseña" }),
      { status: 500 }
    );
  }
}