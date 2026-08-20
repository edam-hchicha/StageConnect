const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // stageconnect2026@gmail.com
    pass: process.env.EMAIL_PASS  // Mot de passe d'application Gmail
  }
});

/**
 * Envoie un mail d'acceptation ou de refus d'une postulation
 */
const sendApplicationResponseEmail = async ({
  studentEmail,
  studentName,
  jobTitle,
  companyName,
  status,
  interviewDate,
  notes
}) => {
  try {
    const isAccepted = status.toLowerCase() === 'accepted';

    const subject = isAccepted
      ? ` Convocation à un entretien - ${jobTitle}`
      : `Mise à jour concernant votre candidature pour ${jobTitle}`;

    const dateFormatted = interviewDate 
      ? new Date(interviewDate).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
      : null;

    const htmlContent = isAccepted
      ? `
        <div style="font-family: Arial, sans-serif; color: #122621; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E1E5E0; border-radius: 16px;">
          <h2 style="color: #1E6F58;">Excellente nouvelle ! 🎉</h2>
          <p>Bonjour <strong>${studentName?.trim() || 'Étudiant'}</strong>,</p>
          <p>L'entreprise <strong>${companyName}</strong> a retenu votre profil pour l'offre : <strong>${jobTitle}</strong>.</p>
          ${dateFormatted ? `<p style="background: #E6F1EC; padding: 12px; border-radius: 8px; color: #154C3D;"><strong>📅 Date d'entretien proposée :</strong> ${dateFormatted}</p>` : ''}
          ${notes ? `<p><strong>Note de l'entreprise :</strong> ${notes}</p>` : ''}
          <p>L'équipe de recrutement vous contactera sous peu pour finaliser les détails de votre entretien.</p>
          <br>
          <p style="font-size: 13px; color: #657A73;">Cordialement,<br>L'équipe StageConnect</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; color: #122621; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E1E5E0; border-radius: 16px;">
          <h2 style="color: #B9752B;">Mise à jour de votre candidature</h2>
          <p>Bonjour <strong>${studentName?.trim() || 'Étudiant'}</strong>,</p>
          <p>Nous vous remercions pour l'intérêt porté à l'entreprise <strong>${companyName}</strong> pour le poste de <strong>${jobTitle}</strong>.</p>
          <p>Après étude de votre dossier, l'entreprise a le regret de vous informer que votre candidature n'a pas été retenue.</p>
          ${notes ? `<p><strong>Remarque :</strong> ${notes}</p>` : ''}
          <p>Nous vous souhaitons beaucoup de succès dans vos recherches sur StageConnect.</p>
          <br>
          <p style="font-size: 13px; color: #657A73;">Cordialement,<br>L'équipe StageConnect</p>
        </div>
      `;

    await transporter.sendMail({
      from: `"StageConnect" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: subject,
      html: htmlContent
    });

    console.log(` Email de statut (${status}) envoyé avec succès à ${studentEmail}`);
  } catch (error) {
    console.error("🔴 Erreur lors de l'envoi de l'email de candidature :", error);
  }
};

module.exports = { sendApplicationResponseEmail };