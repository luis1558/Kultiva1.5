import { nanoid } from 'nanoid';
import { turso } from '../../seed/db';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    console.log("Inicio del endpoint POST /api/recuperar-contraseña");

    const { correo } = await req.json();

    if (!correo) {
      return new Response(
        JSON.stringify({ message: "El correo es requerido" }),
        { status: 400 }
      );
    }

    // Verificar si el correo existe en la tabla empleados
    const userResult = await turso.execute(
      `SELECT nombre FROM empleados WHERE correo = ?`,
      [correo.toLowerCase()]
    );

    console.log(`Resultado de búsqueda para ${correo}:`, userResult.rows);

    if (!userResult.rows || userResult.rows.length === 0) {
      console.log(`Correo no encontrado: ${correo}`);
      // Por seguridad, no revelamos si el correo existe o no
      return new Response(
        JSON.stringify({ 
          message: "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña" 
        }),
        { status: 200 }
      );
    }

    const usuario = userResult.rows[0];
    const nombreUsuario = usuario.nombre || "Usuario";

    // Generar token único y expiración (1 hora)
    const resetToken = nanoid(32);
    const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hora desde ahora

    // Guardar token en la base de datos
    await turso.execute(`
      INSERT INTO password_resets (correo, token, expires_at, used) 
      VALUES (?, ?, ?, FALSE)
    `, [correo.toLowerCase(), resetToken, expiresAt]);

    console.log(`Token de recuperación generado para ${correo}: ${resetToken}`);

    // Configurar transporter de Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kultiva.encuesta.clima@gmail.com",
        pass: "qhmg uihj ekxx rccl",
      },
    });

    // URL de recuperación (ajustar para production)
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://kultiva-encuesta-clima.vercel.app'
      : 'http://localhost:3000';
    
    const resetURL = `${baseURL}/reset-password?token=${resetToken}`;

    // HTML template personalizado
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - Kultiva</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo svg {
            width: 35px;
            height: 35px;
            color: #16a34a;
          }
          .content {
            padding: 40px 30px;
          }
          .title {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          .message {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .reset-button:hover {
            background: linear-gradient(135deg, #15803d 0%, #166534 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-text {
            color: #666;
            font-size: 14px;
            margin: 0;
          }
          .security-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: #e9ecef;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Kultiva</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Encuesta de Clima Organizacional</p>
          </div>
          
          <div class="content">
            <h2 class="title">Recuperación de Contraseña</h2>
            
            <div class="message">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            </div>
            
            <div class="security-note">
              <strong>⚠️ Importante:</strong> Este enlace es válido por solo <strong>1 hora</strong>. 
              Si no solicitaste esta recuperación, puedes ignorar este correo de forma segura.
            </div>
            
            <div class="button-container">
              <a href="${resetURL}" class="reset-button">
                Restablecer Mi Contraseña
              </a>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <span style="word-break: break-all; color: #16a34a; font-family: monospace;">
                ${resetURL}
              </span>
            </p>
          </div>
          
          <div class="footer">
            <div class="divider"></div>
            <p class="footer-text">
              <strong>¿Necesitas ayuda?</strong><br>
              Contacta a nuestro equipo de soporte:<br>
              📧 Maria Claudia Buendia Manotas - mclaudia@thebisteam.com<br>
              🌐 https://kultiva-encuesta-clima.vercel.app
            </p>
            <p class="footer-text" style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
              Este es un correo automático, por favor no respondas a este mensaje.<br>
              © 2024 Kultiva - Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"Kultiva - Soporte" <kultiva.encuesta.clima@gmail.com>',
      to: correo,
      subject: "🔐 Recuperación de Contraseña - Kultiva",
      html: htmlTemplate,
    };

    console.log("Enviando correo de recuperación...");
    await transporter.sendMail(mailOptions);
    console.log("Correo de recuperación enviado exitosamente");

    return new Response(
      JSON.stringify({ 
        message: "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña" 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en /api/recuperar-contraseña:", error);
    return new Response(
      JSON.stringify({ message: "Error al procesar la solicitud" }),
      { status: 500 }
    );
  }
}