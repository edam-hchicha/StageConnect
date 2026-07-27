const db = require('../config/db');

// 1. Postuler à une offre de stage (Sans cv_url pour le moment)
exports.applyToJob = async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;
    const student_id = req.user.profile_id; // Récupéré via le Token JWT

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: "Seuls les étudiants peuvent postuler à une offre." });
    }

    if (!job_id) {
      return res.status(400).json({ message: "L'identifiant de l'offre (job_id) est obligatoire." });
    }

    // Vérifier si l'offre existe
    const [jobExists] = await db.query('SELECT id FROM jobs WHERE id = ?', [job_id]);
    if (jobExists.length === 0) {
      return res.status(404).json({ message: "L'offre de stage spécifiée n'existe pas." });
    }

    // Vérifier si l'étudiant a déjà postulé à cette offre
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
      [job_id, student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." });
    }

    // Enregistrer la candidature dans MySQL (sans cv_url)
    const [result] = await db.query(
      'INSERT INTO applications (job_id, student_id, cover_letter) VALUES (?, ?, ?)',
      [job_id, student_id, cover_letter || '']
    );

    res.status(201).json({
      message: "Candidature envoyée avec succès !",
      applicationId: result.insertId
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
      `SELECT a.id, a.status, a.created_at, j.title, j.location, c.company_name 
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

// 3. Récupérer les candidatures reçues par l'entreprise
exports.getCompanyApplications = async (req, res) => {
  try {
    const company_id = req.user.profile_id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const [applications] = await db.query(
      `SELECT a.id, a.status, a.cover_letter, a.created_at, 
              j.title AS job_title, s.first_name, s.last_name, u.email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN student_profiles s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE j.company_id = ?
       ORDER BY a.created_at DESC`,
      [company_id]
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Mettre à jour le statut d'une candidature (Entreprise)
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