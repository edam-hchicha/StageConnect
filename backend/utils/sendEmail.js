const path = require('path');
// Force la lecture du fichier .env situé dans le dossier parent (backend/.env)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code) => {
  // --- LIGNES DE DEBOGAGE (Affichent le résultat dans ton terminal VS Code) ---
  console.log("🔍 TEST EMAIL_USER :", process.env.EMAIL_USER);
  console.log("🔍 TEST EMAIL_PASS :", process.env.EMAIL_PASS ? "Trouvé ✅" : "UNDEFINED ❌");
  // ----------------------------------------------------------------------

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"StageConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Code de vérification - StageConnect',
    html: `<h3>Votre code de vérification est : <b>${code}</b></h3>`
  });
};

module.exports = sendVerificationEmail;