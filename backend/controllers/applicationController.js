const db = require('../config/db');
const { sendApplicationResponseEmail } = require('../utils/sendEmail');

// 1. Postuler à une offre de stage (Récupération automatique du CV du profil)
exports.applyForJob = async (req, res) => {
  try {
    const userId = req.user?.profile_id || req.user?.id || req.user?.user_id;
    const jobId = req.body?.jobId || req.body?.job_id;
    const coverLetter = req.body?.coverLetter || req.body?.cover_letter || '';

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    if (!jobId) {
      return res.status(400).json({ message: "L'identifiant de l'offre (jobId) est manquant." });
    }

    // Récupérer le CV de l'étudiant depuis son profil
    const [students] = await db.query(
      'SELECT id, cv_url FROM student_profiles WHERE user_id = ? OR id = ?',
      [userId, userId]
    );

    if (students.length === 0 || !students[0].cv_url) {
      return res.status(400).json({ 
        message: "Vous devez ajouter un CV dans votre profil avant de pouvoir postuler." 
      });
    }

    const student = students[0];
    const actualStudentId = student.id || userId;

    // Vérifier si l'étudiant a déjà postulé
    const [existingApp] = await db.query(
      'SELECT id FROM applications WHERE student_id = ? AND job_id = ?',
      [actualStudentId, jobId]
    );

    if (existingApp.length > 0) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." });
    }

    // Insertion sécurisée dans la table 'applications'
    await db.query(
      `INSERT INTO applications (student_id, job_id, status, cover_letter, cv_url, created_at) 
       VALUES (?, ?, 'pending', ?, ?, NOW())`,
      [actualStudentId, jobId, coverLetter, student.cv_url]
    );

    return res.status(201).json({ message: "Votre candidature a été envoyée avec succès !" });

  } catch (error) {
    console.error("🔴 Erreur applyForJob :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la postulation.", error: error.message });
  }
};

// 2. Récupérer les candidatures de l'étudiant connecté
exports.getStudentApplications = async (req, res) => {
  try {
    const userId = req.user?.profile_id || req.user?.id || req.user?.user_id;

    if (req.user?.role && req.user.role !== 'student') {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const [applications] = await db.query(
      `SELECT a.id, a.job_id, a.status, a.created_at, j.title, j.location, c.company_name 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       LEFT JOIN company_profiles c ON (j.company_id = c.id OR j.company_id = c.user_id)
       WHERE a.student_id = ? OR a.student_id IN (SELECT id FROM student_profiles WHERE user_id = ?)
       ORDER BY a.created_at DESC`,
      [userId, userId]
    );

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Erreur getStudentApplications :", error);
    return res.status(500).json({ error: error.message });
  }
};

// 3. Récupérer les candidatures reçues par l'entreprise
exports.getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.user?.profile_id || req.user?.id || req.user?.user_id;
    const { jobId } = req.query;

    let query = `
      SELECT 
        a.id AS application_id,
        a.job_id,
        a.cover_letter,
        a.status,
        a.created_at AS applied_at,
        j.title AS job_title,
        sp.id AS student_profile_id,
        sp.first_name,
        sp.last_name,
        sp.phone,
        sp.cv_url,
        sp.skills,
        u.email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN student_profiles sp ON (a.student_id = sp.user_id OR a.student_id = sp.id)
      JOIN users u ON sp.user_id = u.id
      WHERE (j.company_id = ? OR j.company_id IN (SELECT id FROM company_profiles WHERE user_id = ?))
    `;

    const queryParams = [companyId, companyId];

    if (jobId) {
      query += ` AND a.job_id = ?`;
      queryParams.push(jobId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [applications] = await db.query(query, queryParams);

    const formattedApplications = applications.map(app => {
      let parsedSkills = app.skills;
      if (typeof parsedSkills === 'string') {
        try { parsedSkills = JSON.parse(parsedSkills); } catch(e) { parsedSkills = []; }
      }
      return {
        ...app,
        skills: parsedSkills || []
      };
    });

    return res.status(200).json(formattedApplications);

  } catch (error) {
    console.error("Erreur getCompanyApplications :", error);
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// 4. Mettre à jour le statut d'une candidature
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = req.user?.profile_id || req.user?.id || req.user?.user_id;

    if (req.user?.role && req.user.role !== 'company') {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide. Choisir : pending, accepted ou rejected." });
    }

    const [result] = await db.query(
      `UPDATE applications a
       JOIN jobs j ON a.job_id = j.id
       SET a.status = ?
       WHERE a.id = ? AND (j.company_id = ? OR j.company_id IN (SELECT id FROM company_profiles WHERE user_id = ?))`,
      [status, id, companyId, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Candidature non trouvée ou non autorisée." });
    }

    return res.status(200).json({ message: `Le statut de la candidature est maintenant : ${status}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 5. Répondre et notifier l'étudiant par e-mail
exports.respondToApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interviewDate, notes } = req.body;

    const [rows] = await db.query(
      `SELECT 
         a.id,
         u.email AS student_email, 
         CONCAT(sp.first_name, ' ', sp.last_name) AS student_name,
         j.title AS job_title, 
         cp.company_name
       FROM applications a
       JOIN student_profiles sp ON (a.student_id = sp.id OR a.student_id = sp.user_id)
       JOIN users u ON sp.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       JOIN company_profiles cp ON (j.company_id = cp.id OR j.company_id = cp.user_id)
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    const app = rows[0];

    // Mise à jour sécurisée du statut
    try {
      await db.query(
        'UPDATE applications SET status = ?, notes = ?, interview_date = ? WHERE id = ?',
        [status, notes || '', interviewDate || null, id]
      );
    } catch (dbErr) {
      // Fallback au cas où les colonnes optionnelles 'notes' ou 'interview_date' n'existent pas
      await db.query(
        'UPDATE applications SET status = ? WHERE id = ?',
        [status, id]
      );
    }

    // Envoi de l'e-mail de notification
    if (typeof sendApplicationResponseEmail === 'function') {
      await sendApplicationResponseEmail({
        studentEmail: app.student_email,
        studentName: app.student_name,
        jobTitle: app.job_title,
        companyName: app.company_name,
        status: status,
        interviewDate: interviewDate,
        notes: notes
      });
    }

    return res.status(200).json({ message: "Réponse enregistrée et candidat notifié par e-mail !" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse :", error);
    return res.status(500).json({ error: error.message });
  }
};