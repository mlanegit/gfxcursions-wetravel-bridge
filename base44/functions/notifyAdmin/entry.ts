const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = 'info@mail-gfxcursions.net';
const FROM_NAME = 'gfXcursions | Lost In Jamaica';
const ADMIN_EMAIL = 'gfxsupport@gfxcursions.com';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const { subject, message } = await req.json();
    if (!subject || !message) {
      return Response.json({ error: 'Missing subject or message' }, { status: 400 });
    }

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#18181b;color:#fff;padding:32px;border-radius:8px">
        <h1 style="color:#f97316;font-size:20px;margin-bottom:4px">⚠️ Admin Alert</h1>
        <p style="color:#facc15;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-top:0">Lost In Jamaica Platform</p>
        <hr style="border-color:#27272a;margin:20px 0"/>
        <pre style="color:#e4e4e7;white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.6">${message}</pre>
        <hr style="border-color:#27272a;margin:20px 0"/>
        <p style="color:#52525b;font-size:11px">This is an automated alert from the Lost In Jamaica booking platform.</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject,
        html: htmlBody,
        text: message,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);
    return Response.json({ success: true, to: ADMIN_EMAIL });
  } catch (error) {
    console.error('notifyAdmin error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});