const functions = require("firebase-functions");
const { Resend } = require("resend");

const resend = new Resend("re_Zp13c6S1_9iPtC47rt8dPLNsSz42ChYJh");

exports.sendThankYouEmail = functions.https.onRequest(async (req, res) => {
  try {
    const { email } = req.body;

    const result = await resend.emails.send({
      from: 'Crop Protection <noreply@yourdomain.com>',
      to: email,
      subject: 'Дякуємо за оплату!',
      html: `<p>Вітаємо! 👋<br>Дякуємо за покупку додатку <b>Crop Protection</b>!<br>
      Ось ваше посилання на застосунок: <a href="https://crop-protection-rjxo.vercel.app/">Відкрити застосунок</a></p>`
    });

    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Помилка при надсиланні листа.");
  }
});
