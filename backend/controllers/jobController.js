const db = require('../config/db');
const { calculateMatchScore } = require('../utils/matchingIA');
const path = require('path');
const fs = require('fs');
const extractTextFromPDF = require('../utils/pdfExtractor');

// Helper pour convertir les compétences (JSON/String/Null) en tableau JS sécurisé
const parseSkills = (skillsData) => {
  if (!skillsData) return [];
  if (Array.isArray(skillsData)) return skillsData;
  try {
    const parsed = JSON.parse(skillsData);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Si ce n'est pas un JSON valide, découper par virgule
  }
  return String(skillsData).split(',').map(s => s.trim()).filter(Boolean);
};

// 1. Récupérer TOUTES les offres de stage (Public + Recherche & Filtres + Détection Offre Pourvue)
exports.getAllJobs = async (req, res) => {
  try {
    const { keyword, location, city } = req.query;
    const searchLocation = location || city;

    // Ajout de 'is_closed' pour détecter si un candidat a été accepté
    let sql = `
      SELECT j.*, 
             COALESCE(c.company_name, 'Entreprise') AS company_name, 
             c.sector,
             EXISTS(
               SELECT 1 FROM applications a 
               WHERE a.job_id = j.id AND a.status = 'accepted'
             ) AS is_closed
      FROM jobs j 
      LEFT JOIN company_profiles c ON j.company_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (keyword && keyword.trim() !== '') {
      sql += ' AND (j.title LIKE ? OR j.description LIKE ?)';
      params.push(`%${keyword.trim()}%`, `%${keyword.trim()}%`);
    }

    if (searchLocation && searchLocation.trim() !== '') {
      sql += ' AND j.location LIKE ?';
      params.push(`%${searchLocation.trim()}%`);
    }

    sql += ' ORDER BY j.created_at DESC';

    const [jobs] = await db.query(sql, params);

    // Formater les compétences et convertir is_closed en booléen
    const formattedJobs = jobs.map(job => ({
      ...job,
      is_closed: Boolean(job.is_closed),
      skills: parseSkills(job.skills)
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error('Erreur getAllJobs:', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des offres.", error: error.message });
  }
};

// 2. Récupérer les offres triées par MATCHING IA pour l'étudiant connecté
exports.getStudentJobs = async (req, res) => {
  try {
    const studentId = req.user?.profile_id || req.user?.id || req.user?.user_id;

    // 1. Récupérer le profil de l'étudiant connecté
    const [studentRows] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ? OR id = ?',
      [studentId, studentId]
    );

    // 2. Récupérer toutes les offres avec leur statut d'acceptation
    const [jobs] = await db.query(`
      SELECT j.*,
        EXISTS(
          SELECT 1 FROM applications a 
          WHERE a.job_id = j.id AND a.status = 'accepted'
        ) AS is_closed
      FROM jobs j
    `);

    // Helper pour parser les compétences en toute sécurité
    const parseSkillsLocal = (skills) => {
      if (Array.isArray(skills)) return skills;
      if (typeof skills === 'string') {
        try { return JSON.parse(skills); } catch (e) { return []; }
      }
      return [];
    };

    // Si le profil n'existe pas ou n'a pas encore de CV enregistré dans cv_url
    if (studentRows.length === 0 || !studentRows[0].cv_url) {
      console.log("⚠️ Aucun CV (cv_url) trouvé dans le profil étudiant.");
      const formattedJobs = jobs.map(job => ({
        ...job,
        is_closed: Boolean(job.is_closed),
        skills: parseSkillsLocal(job.skills),
        matchScore: 0
      }));
      return res.status(200).json(formattedJobs);
    }

    const student = studentRows[0];

    // 3. Résolution sécurisée du chemin du fichier CV et extraction du texte
    let cvText = "";
    const cleanPath = student.cv_url.replace(/\\/g, '/').replace(/^\/+/, '');
    const fullCvPath = path.resolve(process.cwd(), cleanPath);

    if (fs.existsSync(fullCvPath)) {
      try {
        cvText = await extractTextFromPDF(fullCvPath);
        console.log(`✅ CV analysé avec succès pour l'IA (${cvText.length} caractères extraits).`);
      } catch (err) {
        console.error("⚠️ Erreur lors de la lecture du fichier PDF :", err.message);
      }
    } else {
      console.warn(`⚠️ Fichier CV introuvable au chemin : ${fullCvPath}`);
    }

    // Préparation des compétences de l'étudiant
    const studentSkills = parseSkillsLocal(student.skills);

    const studentDataForIA = {
      ...student,
      skills: studentSkills,
      cv_text: cvText
    };

    // 4. Calculer le score de matching IA pour CHAQUE offre
    const scoredJobs = jobs.map(job => {
      const jobSkills = parseSkillsLocal(job.skills);
      const matchScore = calculateMatchScore(studentDataForIA, { ...job, skills: jobSkills });

      return {
        ...job,
        is_closed: Boolean(job.is_closed),
        skills: jobSkills,
        matchScore
      };
    });

    // 5. Trier automatiquement par score de compatibilité
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json(scoredJobs);

  } catch (error) {
    console.error("Erreur dans getStudentJobs :", error);
    return res.status(500).json({ 
      message: "Erreur serveur lors de la récupération des offres.", 
      error: error.message 
    });
  }
};

// 3. Récupérer UNE SEULE offre par son ID (Public)
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const [jobs] = await db.query(
      `SELECT j.*, 
              COALESCE(c.company_name, 'Entreprise') AS company_name, 
              c.sector, 
              c.website,
              EXISTS(
                SELECT 1 FROM applications a 
                WHERE a.job_id = j.id AND a.status = 'accepted'
              ) AS is_closed 
       FROM jobs j 
       LEFT JOIN company_profiles c ON j.company_id = c.id 
       WHERE j.id = ?`,
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Offre de stage non trouvée." });
    }

    const job = {
      ...jobs[0],
      is_closed: Boolean(jobs[0].is_closed),
      skills: parseSkills(jobs[0].skills)
    };

    res.status(200).json(job);
  } catch (error) {
    console.error('Erreur getJobById:', error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Créer une offre de stage (Protégée Entreprise)
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, duration, skills } = req.body;
    const company_id = req.user.profile_id || req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Seules les entreprises peuvent publier des offres." });
    }

    if (!title || !description) {
      return res.status(400).json({ message: "Le titre et la description sont requis." });
    }

    const skillsFormatted = Array.isArray(skills) ? JSON.stringify(skills) : (skills || '');

    const [result] = await db.query(
      'INSERT INTO jobs (company_id, title, description, location, duration, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [company_id, title, description, location || '', duration || '', skillsFormatted]
    );

    res.status(201).json({
      message: "Offre de stage publiée avec succès !",
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Erreur createJob:', error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Modifier une offre de stage (Protégée Entreprise)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, duration, skills } = req.body;
    const company_id = req.user.profile_id || req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    const skillsFormatted = Array.isArray(skills) ? JSON.stringify(skills) : (skills || '');

    const [result] = await db.query(
      `UPDATE jobs 
       SET title = ?, description = ?, location = ?, duration = ?, skills = ?
       WHERE id = ? AND company_id = ?`,
      [title, description, location, duration, skillsFormatted, id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Offre introuvable ou vous n'avez pas l'autorisation de la modifier." });
    }

    res.status(200).json({ message: "Offre mise à jour avec succès !" });
  } catch (error) {
    console.error('Erreur updateJob:', error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Supprimer une offre de stage (Protégée Entreprise)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.profile_id || req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    const [result] = await db.query('DELETE FROM jobs WHERE id = ? AND company_id = ?', [id, company_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Offre introuvable ou vous n'avez pas l'autorisation de la supprimer." });
    }

    res.status(200).json({ message: "Offre supprimée avec succès !" });
  } catch (error) {
    console.error('Erreur deleteJob:', error);
    res.status(500).json({ error: error.message });
  }
};

// 7. Récupérer UNIQUEMENT les offres de l'entreprise connectée
exports.getCompanyJobs = async (req, res) => {
  try {
    const company_id = req.user.profile_id || req.user.id;

    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC',
      [company_id]
    );

    const formattedJobs = jobs.map(job => ({
      ...job,
      skills: parseSkills(job.skills)
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error('Erreur getCompanyJobs:', error);
    res.status(500).json({ error: error.message });
  }
};