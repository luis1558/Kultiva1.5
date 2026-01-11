import nodemailer from 'nodemailer';

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kultiva.encuesta.clima@gmail.com",
        pass: "qhmg uihj ekxx rccl",
      },
    });

    console.log("Enviando email de prueba...");
    
    const result = await transporter.sendMail({
      from: '"Kultiva Test" <kultiva.encuesta.clima@gmail.com>',
      to: "ldcastanedaj@gmail.com", // Tu correo para probar
      subject: "Test de Envío - Kultiva",
      text: "Este es un email de prueba para verificar que las credenciales de Gmail funcionan.",
      html: "<h1>Test de Envío</h1><p>Este es un email de prueba para verificar que las credenciales de Gmail funcionan.</p>",
    });

    console.log("✅ Email enviado exitosamente:", result.messageId);
    console.log("Revisa tu correo incluyendo la carpeta de spam!");
    
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    console.error("Error details:", error.code);
  }
}

testEmail();