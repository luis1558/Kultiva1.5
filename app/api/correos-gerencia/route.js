import nodemailer from "nodemailer";
import fetch from "node-fetch";
import { turso } from '../../seed/db';
// api para enviar correos a gerencia

export async function POST(req) {
  try {
    console.log("Inicio del endpoint POST /api/correos-gerencia");

    const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      console.warn("Token no encontrado en las cookies");
      return new Response(JSON.stringify({ message: "No autenticado" }), {
        status: 401,
      });
    }

    let jwtPayload;
    try {
      jwtPayload = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Error al decodificar el JWT:", error);
      return new Response(JSON.stringify({ message: "Token inválido" }), {
        status: 400,
      });
    }

    const correoUsuario = jwtPayload.correo;
    if (!correoUsuario) {
      console.warn("Correo no encontrado en el token");
      return new Response(
        JSON.stringify({ message: "Correo no encontrado en el token" }),
        { status: 400 }
      );
    }

    // 🛑 Verificar si ya se envió el correo
    const checkResult = await turso.execute(
      `SELECT correo_enviado_plan FROM empleados WHERE correo = ?`,
      [correoUsuario]
    );

    const yaEnviado = checkResult.rows?.[0]?.correo_enviado_plan;
    if (yaEnviado) {
      console.log("Correo ya fue enviado anteriormente");
      return new Response(JSON.stringify({ message: "Correo ya enviado" }), {
        status: 200,
      });
    }

    const correoGestionHumana = "mclaudia@thebisteam.com";
    const correodos= "carolina.a@thebisteam.com"
    console.log(
      "Iniciando descarga del archivo Excel desde /api/download-plan-gerencia"
    );
    const excelResponse = await fetch(
      "https://kultiva-encuesta-de-clima.vercel.app/api/download-plan-gerencia",
      {
        method: "GET",
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    if (!excelResponse.ok) {
      const errorMessage = await excelResponse.text();
      console.error("Error al descargar el archivo Excel:", errorMessage);
      throw new Error("Error al descargar el archivo Excel");
    }

    const excelBuffer = await excelResponse.arrayBuffer();
    console.log("Archivo Excel descargado exitosamente");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kultiva.encuesta.clima@gmail.com",
        pass: "qhmg uihj ekxx rccl",
      },
    });

    const mailOptions = {
      from: '"Kultiva" <kultiva.encuesta.clima@gmail.com>',
      to: `${correoUsuario}, ${correoGestionHumana}, ${correodos}`,
      subject: "Plan de acción gerencia: encuesta de clima organizacional",
      text: `
Hola, gerente.

Hemos recibido exitosamente tu plan de acción de gerencia.

Adjunto encontrarás un excel con las acciones de mejora que seleccionaste para las dimensiones donde tu organización obtuvo un resultado inferior al 75% en la encuesta de Clima Organizacional. Te recordamos la importancia de dar seguimiento al cumplimiento de cada una de estas acciones y de mantener una comunicación abierta con los equipos de tu organización para fomentar la retroalimentación y lograr una mejora continua.

Si necesitas apoyo adicional o tienes alguna consulta, no dudes en contactar a:
Maria Claudia Buendia Manotas - mclaudia@thebisteam.com

Agradecemos tu compromiso con la mejora del clima organizacional.
¡Contamos contigo!
    `,
      attachments: [
        {
          filename: "plan_de_accion_gerencia.xlsx",
          content: Buffer.from(excelBuffer),
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    };

    console.log("Enviando correo...");
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado exitosamente");

    // 🟢 Actualizar el estado en la base de datos
    await turso.execute(
      `UPDATE empleados SET correo_enviado_plan = TRUE WHERE correo = ?`,
      [correoUsuario]
    );

    return new Response(
      JSON.stringify({ message: "Correo enviado exitosamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return new Response(
      JSON.stringify({ message: "Error al enviar el correo" }),
      { status: 500 }
    );
  }
}
