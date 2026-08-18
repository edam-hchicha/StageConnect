const db = require('../config/db');
const { sendApplicationResponseEmail } = require('../utils/sendEmail');
const { calculateMatchScore } = require('../utils/matchingIA');

// 1. Postuler à une offre de stage (avec gestion du CV)
exports.applyToJob = async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;
    const student_id = req.user.profile_id; // ID dans student_profiles

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: "Seuls les étudiants peuvent postuler à une offre." });
    }

    if (!job_id) {
      return res.status(400).json({ message: "L'identifiant de l'offre (job_id) est obligatoire." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Veuillez joindre votre CV au format PDF." });
    }

    const cv_url = `/uploads/cvs/${req.file.filename}`;

    // Vérifier si l'offre existe
    const [jobExists] = await db.query('SELECT id FROM jobs WHERE id = ?', [job_id]);
    if (jobExists.length === 0) {
      return res.status(404).json({ message: "L'offre de stage spécifiée n'existe pas." });
    }

    // Vérifier si l'étudiant a déjà postulé
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
      [job_id, student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." });
    }

    // Enregistrer la candidature
    const [result] = await db.query(
      'INSERT INTO applications (job_id, student_id, cover_letter, cv_url) VALUES (?, ?, ?, ?)',
      [job_id, student_id, cover_letter || '', cv_url]
    );

    res.status(201).json({
      message: "Candidature envoyée avec succès !",
      applicationId: result.insertId,
      cv_url: cv_url
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Récupérer les candidatures de l'étudiant connecté
exports.getStudentApplications = async (req, res) => {
  try {
    const student_id = req.user.profile_id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const [applications] = await db.query(
      `SELECT a.id, a.job_id, a.status, a.created_at, j.title, j.location, c.company_name 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN company_profiles c ON j.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [student_id]
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Récupérer les candidatures reçues par l'entreprise (Triées par score IA)
exports.getCompanyApplications = async (req, res) => {
  try {
    const company_id = req.user.profile_id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Accès refusé." });
    }

    // Récupération complète des données nécessaires au calcul de matching
    const [rows] = await db.query(
      `SELECT 
        a.id, a.status, a.cover_letter, a.cv_url, a.created_at,
        j.id AS job_id, j.title AS job_title, j.description AS job_description, j.location AS job_location, j.skills AS job_skills,
        s.id AS student_id, s.first_name, s.last_name, s.skills AS student_skills, s.bio, s.degree, s.domain, s.location AS student_location,
        u.email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN student_profiles s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE j.company_id = ?
       ORDER BY a.created_at DESC`,
      [company_id]
    );

    // Calcul du score de matching pour chaque candidat
    const applicationsWithScore = rows.map(app => {
      // Helper pour parser les compétences si stockées en string JSON ou séparées par virgule
      const parseSkills = (skillsData) => {
        if (!skillsData) return [];
        if (Array.isArray(skillsData)) return skillsData;
        try {
          return JSON.parse(skillsData);
        } catch {
          return String(skillsData).split(',').map(s => s.trim());
        }
      };

      const studentSkills = parseSkills(app.student_skills);
      const jobSkills = parseSkills(app.job_skills);

      const studentObj = {
        skills: studentSkills,
        bio: app.bio,
        degree: app.degree,
        domain: app.domain,
        location: app.student_location
      };

      const jobObj = {
        title: app.job_title,
        description: app.job_description,
        skills: jobSkills,
        location: app.job_location
      };

      const matchScore = calculateMatchScore(studentObj, jobObj);

      return {
        id: app.id,
        status: app.status,
        cover_letter: app.cover_letter,
        cv_url: app.cv_url,
        created_at: app.created_at,
        job_title: app.job_title,
        first_name: app.first_name,
        last_name: app.last_name,
        email: app.email,
        student_skills: studentSkills,
        matchScore: matchScore
      };
    });

    // 🏆 Tri décroissant du candidat le plus compatible au moins compatible
    applicationsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(applicationsWithScore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Mettre à jour le statut d'une candidature
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const company_id = req.user.profile_id;

    if (req.user.role !== 'company') {
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
       WHERE a.id = ? AND j.company_id = ?`,
      [status, id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Candidature non trouvée ou non autorisée." });
    }

    res.status(200).json({ message: `Le statut de la candidature est maintenant : ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Répondre et notifier l'étudiant par e-mail
exports.respondToApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interviewDate, notes } = req.body;

    // Correction de la jointure SQL pour student_profiles -> users
    const [rows] = await db.query(
      `SELECT 
         a.id,
         u.email AS student_email, 
         CONCAT(sp.first_name, ' ', sp.last_name) AS student_name,
         j.title AS job_title, 
         cp.company_name
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       JOIN company_profiles cp ON j.company_id = cp.id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    const app = rows[0];

    // Mettre à jour le statut en BDD
    await db.query(
      'UPDATE applications SET status = ?, notes = ?, interview_date = ? WHERE id = ?',
      [status, notes || '', interviewDate || null, id]
    );

    // Envoyer l'e-mail
    await sendApplicationResponseEmail({
      studentEmail: app.student_email,
      studentName: app.student_name,
      jobTitle: app.job_title,
      companyName: app.company_name,
      status: status,
      interviewDate: interviewDate,
      notes: notes
    });

    res.status(200).json({ message: "Réponse envoyée et candidat notifié par e-mail !" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse :", error);
    res.status(500).json({ error: error.message });
  }
};