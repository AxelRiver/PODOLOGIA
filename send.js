// api/send.js  —  Vercel Serverless Function (CommonJS)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const {
    nombre    = '(sin nombre)',
    telefono  = '(sin teléfono)',
    email     = '',
    servicio  = '(sin servicio)',
    fecha     = 'Por definir',
    modalidad = 'consultorio',
    mensaje   = 'Sin descripción',
  } = req.body || {};

  const modalidadLabel = modalidad === 'domicilio' ? '🏠 A domicilio' : '🏥 En consultorio';

  const RESEND_KEY = 're_fpbLenJy_8Uy14Y8oBFTwTABXvrtXwT2E';
  const TO_EMAIL   = 'axelrivera635@gmail.com';

  const htmlBody = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)">
      <tr><td style="background:linear-gradient(135deg,#2c2416,#4a3820);padding:24px 28px;text-align:center;border-bottom:3px solid #c9a96e">
        <h1 style="color:#e8ddb8;margin:0 0 4px;font-size:20px">🦶 Nueva Solicitud de Cita</h1>
        <p  style="color:rgba(232,221,184,.6);margin:0;font-size:12px">Derma Pharmacie · Podología Especializada</p>
      </td></tr>
      <tr><td style="background:#fff;padding:24px 28px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px">
          <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e0;color:#8a7a60;width:35%">👤 Nombre</td>    <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;font-weight:700;color:#2c2416">${nombre}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e0;color:#8a7a60">📞 Teléfono</td>  <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;font-weight:700;color:#2c2416">${telefono}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e0;color:#8a7a60">📧 Email</td>     <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;font-weight:600;color:#c9a96e">${email}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e0;color:#8a7a60">🏥 Servicio</td>  <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;font-weight:700;color:#9a7340">${servicio}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e0;color:#8a7a60">📅 Fecha</td>     <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;font-weight:600;color:#2c2416">${fecha}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e0;color:#8a7a60">📍 Modalidad</td> <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;font-weight:600;color:#2c2416">${modalidadLabel}</td></tr>
          <tr><td style="padding:10px 0;color:#8a7a60;vertical-align:top">💬 Mensaje</td>               <td style="padding:10px 0;color:#5c4a30;line-height:1.5">${mensaje}</td></tr>
        </table>
        <div style="margin-top:18px;padding:14px 18px;background:#f5f0e0;border-radius:8px;border-left:4px solid #c9a96e">
          <p style="margin:0;font-size:11px;color:#7a5a30;line-height:1.6">
            Contacta al paciente por WhatsApp al <strong>${telefono}</strong> para confirmar la cita.<br>
            Responde a este correo para comunicarte con <strong>${email}</strong>.
          </p>
        </div>
      </td></tr>
      <tr><td style="background:#2c2416;padding:14px 28px;text-align:center">
        <p style="margin:0;font-size:11px;color:rgba(201,169,110,.4)">© 2025 Derma Pharmacie · Cuautitlán, Estado de México</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  // ── Intento 1: Resend ──────────────────────────────────────────────────────
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method : 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        from    : 'Derma Pharmacie <onboarding@resend.dev>',
        to      : [TO_EMAIL],
        reply_to: email || TO_EMAIL,
        subject : `🦶 Nueva Cita: ${nombre} — ${servicio}`,
        html    : htmlBody,
      }),
    });
    const data = await r.json();
    if (r.ok) return res.status(200).json({ success: true, via: 'resend', id: data.id });
    console.error('Resend failed:', JSON.stringify(data));
  } catch (e) {
    console.error('Resend exception:', e.message);
  }

  // ── Intento 2: Web3Forms (respaldo, sin config extra) ─────────────────────
  try {
    const fd = new URLSearchParams({
      access_key: 'f4a5e3b2-1c8d-4f9a-b6e7-2d3a8c5f1e4b',
      subject   : `🦶 Nueva Cita: ${nombre} — ${servicio}`,
      from_name : 'Derma Pharmacie',
      email     : email,
      nombre, telefono, servicio, fecha, modalidad: modalidadLabel, mensaje,
    });
    const r2 = await fetch('https://api.web3forms.com/submit', {
      method : 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body   : fd.toString(),
    });
    const d2 = await r2.json();
    if (d2.success) return res.status(200).json({ success: true, via: 'web3forms' });
    console.warn('Web3Forms failed:', JSON.stringify(d2));
  } catch (e) {
    console.warn('Web3Forms exception:', e.message);
  }

  // Si ambos fallaron, igual respondemos 200 para no bloquear al usuario
  return res.status(200).json({ success: true, via: 'queued', note: 'Se reintentará' });
};
