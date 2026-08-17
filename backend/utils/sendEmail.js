const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. Votre fonction d'origine pour le code de vérification
const sendVerificationEmail = async (email, code) => {
  console.log("🔍 TEST EMAIL_USER :", process.env.EMAIL_USER);
  console.log("🔍 TEST EMAIL_PASS :", process.env.EMAIL_PASS ? "Trouvé ✅" : "UNDEFINED ❌");

  await transporter.sendMail({
    from: `"StageConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Code de vérification - StageConnect',
    html: `<h3>Votre code de vérification est : <b>${code}</b></h3>`
  });
};

// 2. NOUVELLE FONCTION : Notification de réponse à une candidature
const sendApplicationResponseEmail = async ({
  studentEmail,
  studentName,
  jobTitle,
  companyName,
  status,
  interviewDate,
  notes
}) => {
  const isAccepted = status === 'accepted' || status === 'interview';

  const subject = isAccepted
    ? `🎉 Invitation à un entretien : ${jobTitle} chez ${companyName}`
    : `Mise à jour concernant votre candidature chez ${companyName}`;

  const htmlBody = isAccepted
    ? `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2563eb;">Bonjour ${studentName},</h2>
        <p>Bonne nouvelle ! Votre candidature pour le poste de <strong>${jobTitle}</strong> au sein de l'entreprise <strong>${companyName}</strong> a été retenue.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1e40af;">📅 Rendez-vous pour l'entretien technique</h3>
          <p><strong>Date & Heure / Modalités :</strong> ${interviewDate || 'Sera précisé très prochainement'}</p>
          ${notes ? `<p><strong>Message du recruteur :</strong><br>${notes}</p>` : ''}
        </div>

        <p>Merci de répondre directement à cet e-mail pour confirmer votre présence.</p>
        <p>Cordialement,<br>L'équipe <strong>${companyName}</strong></p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2>Bonjour ${studentName},</h2>
        <p>Nous vous remercions pour l'intérêt porté à l'offre <strong>${jobTitle}</strong> chez <strong>${companyName}</strong>.</p>
        <p>Après étude de votre profil, nous avons le regret de vous informer que votre candidature n'a pas été retenue.</p>
        ${notes ? `<p><strong>Remarque du recruteur :</strong><br>${notes}</p>` : ''}
        <p>Nous vous souhaitons bon courage dans la suite de vos recherches.</p>
        <p>Cordialement,<br>L'équipe <strong>${companyName}</strong></p>
      </div>
    `;

  await transporter.sendMail({
    from: `"${companyName} (via StageConnect)" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: subject,
    html: htmlBody
  });
};

// On exporte les 2 fonctions
module.exports = {
  sendVerificationEmail,
  sendApplicationResponseEmail
};