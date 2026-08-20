const nodemailer = require('nodemailer');

// 1. Configuration du transporteur SMTP Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // stageconnect2026@gmail.com
    pass: process.env.EMAIL_PASS  // Mot de passe d'application
  }
});

/**
 * Envoie un mail à l'étudiant en fonction du statut de la candidature
 * @param {string} studentEmail - Email de l'étudiant (récupéré depuis la table user)
 * @param {string} studentName - Nom de l'étudiant
 * @param {string} jobTitle - Intitulé de l'offre
 * @param {string} companyName - Nom de l'entreprise
 * @param {'ACCEPTED' | 'REJECTED'} status - Statut de la décision
 */
const sendApplicationStatusEmail = async ({ studentEmail, studentName, jobTitle, companyName, status }) => {
  try {
    let subject = '';
    let htmlContent = '';

    if (status === 'ACCEPTED') {
      subject = `Félicitations ! Convocation à un entretien pour le poste : ${jobTitle}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #122621; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E1E5E0; border-radius: 12px;">
          <h2 style="color: #1E6F58;">Excellente nouvelle ! 🎉</h2>
          <p>Bonjour <strong>${studentName || 'Étudiant'}</strong>,</p>
          <p>L'entreprise <strong>${companyName}</strong> a examiné votre candidature et est très intéressée par votre profil pour l'offre : <strong>${jobTitle}</strong>.</p>
          <p><strong>Vous êtes convoqué(e) à un entretien !</strong> L'équipe de recrutement prendra directement contact avec vous pour fixer la date et l'heure de la rencontre.</p>
          <br>
          <p style="font-size: 13px; color: #657A73;">Bonne chance pour votre entretien !<br>L'équipe StageConnect</p>
        </div>
      `;
    } else if (status === 'REJECTED') {
      subject = `Mise à jour concernant votre candidature pour : ${jobTitle}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #122621; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E1E5E0; border-radius: 12px;">
          <h2 style="color: #B9752B;">Mise à jour de votre candidature</h2>
          <p>Bonjour <strong>${studentName || 'Étudiant'}</strong>,</p>
          <p>Nous vous remercions pour l'intérêt que vous avez porté à l'entreprise <strong>${companyName}</strong> ainsi que pour le temps accordé à votre candidature au poste de <strong>${jobTitle}</strong>.</p>
          <p>Après étude attentive de votre dossier, nous sommes au regret de vous informer que votre candidature n'a pas été retenue pour ce poste.</p>
          <p>Nous vous souhaitons pleine réussite dans vos futures démarches et opportunités sur StageConnect.</p>
          <br>
          <p style="font-size: 13px; color: #657A73;">Cordialement,<br>L'équipe StageConnect</p>
        </div>
      `;
    }

    const mailOptions = {
      from: `"StageConnect" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Email envoyé avec succès :', info.messageId);
    return true;
  } catch (error) {
    console.error(' Erreur lors de l’envoi de l’email :', error);
    return false;
  }
};

module.exports = { sendApplicationStatusEmail };