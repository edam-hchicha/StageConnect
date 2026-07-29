const db = require('../config/db');

// 1. CONSULTER LE PROFIL CONNECTÉ
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let sql = '';

    // Jointure dynamique selon le rôle de l'utilisateur
    if (role === 'student') {
      sql = `
        SELECT u.id, u.email, u.role, u.created_at,
               sp.id AS profile_id, sp.first_name, sp.last_name, sp.phone
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = ?
      `;
    } else if (role === 'company') {
      sql = `
        SELECT u.id, u.email, u.role, u.created_at,
               cp.id AS profile_id, cp.company_name, cp.description, cp.website
        FROM users u
        LEFT JOIN company_profiles cp ON u.id = cp.user_id
        WHERE u.id = ?
      `;
    } else {
      return res.status(400).json({ message: "Rôle non reconnu." });
    }

    const [users] = await db.query(sql, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(users[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. MODIFIER LE PROFIL CONNECTÉ
exports.updateProfile = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const userId = req.user.id;
    const role = req.user.role;

    await connection.beginTransaction();

    // 1️⃣ Mise à jour de l'email dans la table `users` (si envoyé)
    if (req.body.email) {
      // Vérifier si le nouvel email est déjà pris par un autre compte
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [req.body.email, userId]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte." });
      }

      await connection.query('UPDATE users SET email = ? WHERE id = ?', [req.body.email, userId]);
    }

    // 2️⃣ Mise à jour de la table de profil selon le rôle
    if (role === 'student') {
      const { first_name, last_name, phone } = req.body;
      const fields = [];
      const params = [];

      if (first_name !== undefined) { fields.push('first_name = ?'); params.push(first_name); }
      if (last_name !== undefined) { fields.push('last_name = ?'); params.push(last_name); }
      if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }

      if (fields.length > 0) {
        params.push(userId);
        await connection.query(
          `UPDATE student_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
          params
        );
      }

    } else if (role === 'company') {
      const { company_name, phone, description, website } = req.body;
      const fields = [];
      const params = [];

      if (company_name !== undefined) { fields.push('company_name = ?'); params.push(company_name); }
      //if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
      if (description !== undefined) { fields.push('description = ?'); params.push(description); }
      if (website !== undefined) { fields.push('website = ?'); params.push(website); }

      if (fields.length > 0) {
        params.push(userId);
        await connection.query(
          `UPDATE company_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
          params
        );
      }
    }

    // Valider la transaction
    await connection.commit();

    res.status(200).json({ message: "Profil mis à jour avec succès !" });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};