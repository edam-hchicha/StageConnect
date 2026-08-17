const db = require('../config/db');

// 1. Récupérer le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Récupéré depuis le token JWT via authMiddleware
    const role = req.user.role;

    // Informations de base (table users)
    const [userRows] = await db.query(
      'SELECT id, email, role FROM users WHERE id = ?', 
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    let profileData = { ...userRows[0], profile: {} };

    // Si c'est un étudiant -> charger student_profiles
    if (role === 'student') {
      const [studentRows] = await db.query(
        'SELECT * FROM student_profiles WHERE user_id = ?', 
        [userId]
      );
      profileData.profile = studentRows[0] || {};
    } 
    // Si c'est une entreprise -> charger company_profiles
    else if (role === 'company') {
      const [companyRows] = await db.query(
        'SELECT * FROM company_profiles WHERE user_id = ?', 
        [userId]
      );
      profileData.profile = companyRows[0] || {};
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Erreur récupération profil :", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'student') {
      const { first_name, last_name, phone, university, degree, skills } = req.body;

      const [existing] = await db.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);

      if (existing.length > 0) {
        await db.query(
          `UPDATE student_profiles 
           SET first_name = ?, last_name = ?, phone = ?, university = ?, degree = ?, skills = ? 
           WHERE user_id = ?`,
          [first_name, last_name, phone, university, degree, skills, userId]
        );
      } else {
        await db.query(
          `INSERT INTO student_profiles (user_id, first_name, last_name, phone, university, degree, skills) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, first_name, last_name, phone, university, degree, skills]
        );
      }
    } else if (role === 'company') {
      const { company_name, sector, website, description } = req.body;

      const [existing] = await db.query('SELECT id FROM company_profiles WHERE user_id = ?', [userId]);

      if (existing.length > 0) {
        await db.query(
          `UPDATE company_profiles 
           SET company_name = ?, sector = ?, website = ?, description = ? 
           WHERE user_id = ?`,
          [company_name, sector, website, description, userId]
        );
      } else {
        await db.query(
          `INSERT INTO company_profiles (user_id, company_name, sector, website, description) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, company_name, sector, website, description]
        );
      }
    }

    res.status(200).json({ message: "Profil mis à jour avec succès !" });
  } catch (error) {
    console.error("Erreur mise à jour profil :", error);
    res.status(500).json({ error: error.message });
  }
};