// Vercel Serverless Function — api/send.js
// Receives form data from the frontend and sends email via Resend
// This runs server-side so the API key stays secure and CORS is not an issue.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    nombre = '',
    telefono = '',
    email = '',
    servicio = '',
    fecha = 'Por definir',
    modalidad = 'consultorio',
    mensaje = 'Sin descripción adicional',
  } = req.body || {};

  if (!nombre || !email || !servicio) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const modalidadLabel = modalidad === 'domicilio' ? '🏠 Consulta a domicilio' : '🏥 En consultorio';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e0;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e0;padding:32px 16px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(139,115,85,.15)">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#2c2416,#4a3820);padding:28px 32px;text-align:center;border-bottom:3px solid #c9a96e">
        <h1 style="color:#e8ddb8;margin:0 0 4px;font-size:22px;font-family:Georgia,serif;letter-spacing:.05em">🦶 Nueva Solicitud de Cita</h1>
        <p style="color:rgba(232,221,184,.6);margin:0;font-size:13px">Derma Pharmacie · Podología Especializada</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:#fff;padding:28px 32px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr style="border-bottom:1px solid #f5f0e0">
            <td style="padding:12px 0;color:#8a7a60;font-size:13px;width:38%">👤 Nombre</td>
            <td style="padding:12px 0;font-weight:700;font-size:14px;color:#2c2416">${nombre}</td>
          </tr>
          <tr style="border-bottom:1px solid #f5f0e0">
            <td style="padding:12px 0;color:#8a7a60;font-size:13px">📞 Teléfono</td>
            <td style="padding:12px 0;font-weight:700;font-size:14px;color:#2c2416">${telefono}</td>
          </tr>
          <tr style="border-bottom:1px solid #f5f0e0">
            <td style="padding:12px 0;color:#8a7a60;font-size:13px">📧 Email</td>
            <td style="padding:12px 0;font-weight:600;font-size:13px;color:#c9a96e">${email}</td>
          </tr>
          <tr style="border-bottom:1px solid #f5f0e0">
            <td style="padding:12px 0;color:#8a7a60;font-size:13px">🏥 Servicio</td>
            <td style="padding:12px 0;font-weight:700;font-size:14px;color:#9a7340">${servicio}</td>
          </tr>
          <tr style="border-bottom:1px solid #f5f0e0">
            <td style="padding:12px 0;color:#8a7a60;font-size:13px">📅 Fecha</td>
            <td style="padding:12px 0;font-weight:600;font-size:13px;color:#2c2416">${fecha}</td>
          </tr>
          <tr style="border-bottom:1px solid #f5f0e0">
            <td style="padding:12px 0;color:#8a7a60;font-size:13px">📍 Modalidad</td>
            <td style="padding:12px 0;font-weight:600;font-size:13px;color:#2c2416">${modalidadLabel}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#8a7a60;font-size:13px;vertical-align:top">💬 Mensaje</td>
            <td style="padding:12px 0;font-size:13px;color:#5c4a30;line-height:1.5">${mensaje}</td>
          </tr>
        </table>
        <!-- CTA -->
        <div style="margin-top:24px;padding:16px 20px;background:#f5f0e0;border-radius:10px;border-left:4px solid #c9a96e">
          <p style="margin:0;font-size:12px;color:#7a5a30;line-height:1.6">
            Responde a este correo directamente para contactar al paciente, 
            o escríbele por WhatsApp al <strong>${telefono}</strong> para confirmar su cita.
          </p>
        </div>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#2c2416;padding:16px 32px;text-align:center">
        <p style="margin:0;font-size:11px;color:rgba(201,169,110,.5)">© 2025 Derma Pharmacie · Cuautitlán, Estado de México</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_fpbLenJy_8Uy14Y8oBFTwTABXvrtXwT2E',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Derma Pharmacie <onboarding@resend.dev>',
        to: ['axelrivera635@gmail.com'],
        reply_to: email,
        subject: `🦶 Nueva Cita: ${nombre} — ${servicio}`,
        html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, id: data.id });
    } else {
      console.error('Resend error:', data);
      return res.status(response.status).json({ success: false, error: data.message || 'Error enviando email' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: 'Error del servidor' });
  }
}
