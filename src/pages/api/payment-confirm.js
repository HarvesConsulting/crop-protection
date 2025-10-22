const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { transactionStatus, email } = req.body;

  if (transactionStatus === 'Approved' && email) {
    try {
      await resend.emails.send({
        from: 'Crop Protection <noreply@yourdomain.com>',
        to: email,
        subject: 'Ваш доступ до Crop Protection',
        html: `<p>Дякуємо за оплату! Відкрити застосунок можна <a href="https://crop-protection-rjxo.vercel.app/">тут</a>.</p>`,
      });
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  res.status(200).end();
}
