const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email in request body' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Crop Protection <noreply@yourdomain.com>',
      to: email,
      subject: 'Ваш доступ до Crop Protection',
      html: `<p>Дякуємо за оплату! Натисніть <a href="https://crop-protection-rjxo.vercel.app/">тут</a>, щоб відкрити застосунок.</p>`,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Не вдалося надіслати email' });
  }
}
