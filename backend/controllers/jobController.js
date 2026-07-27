const db = require('../config/db');

// 1. Récupérer TOUTES les offres de stage (Public)
exports.getAllJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT j.*, c.company_name, c.sector 
       FROM jobs j 
       JOIN company_profiles c ON j.company_id = c.id 
       ORDER BY j.created_at DESC`
    );
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Récupérer UNE SEULE offre par son ID (Public)
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const [jobs] = await db.query(
      `SELECT j.*, c.company_name, c.sector, c.website 
       FROM jobs j 
       JOIN company_profiles c ON j.company_id = c.id 
       WHERE j.id = ?`,
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Offre de stage non trouvée." });
    }

    res.status(200).json(jobs[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Créer une offre de stage (Protégée)
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, duration } = req.body;
    const company_id = req.user.profile_id; 

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Seules les entreprises peuvent publier des offres." });
    }

    if (!title || !description) {
      return res.status(400).json({ message: "Le titre et la description sont requis." });
    }

    const [result] = await db.query(
      'INSERT INTO jobs (company_id, title, description, location, duration) VALUES (?, ?, ?, ?, ?)',
      [company_id, title, description, location || '', duration || '']
    );

    res.status(201).json({
      message: "Offre de stage publiée avec succès !",
      jobId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Modifier une offre de stage (Protégée & Vérifiée)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, duration } = req.body;
    const company_id = req.user.profile_id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    // Mise à jour uniquement SI l'offre appartient à l'entreprise connectée
    const [result] = await db.query(
      `UPDATE jobs 
       SET title = ?, description = ?, location = ?, duration = ? 
       WHERE id = ? AND company_id = ?`,
      [title, description, location, duration, id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Offre introuvable ou vous n'avez pas l'autorisation de la modifier." });
    }

    res.status(200).json({ message: "Offre mise à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Supprimer une offre de stage (Protégée & Vérifiée)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.profile_id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    // Suppression uniquement SI l'offre appartient à l'entreprise connectée
    const [result] = await db.query('DELETE FROM jobs WHERE id = ? AND company_id = ?', [id, company_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Offre introuvable ou vous n'avez pas l'autorisation de la supprimer." });
    }

    res.status(200).json({ message: "Offre supprimée avec succès !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};