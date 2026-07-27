const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. INSCRIPTION (Register) avec Transaction SQL
exports.register = async (req, res) => {
  // Obtenir une connexion pour gérer la transaction
  const connection = await db.getConnection();

  try {
    const { email, password, role, first_name, last_name, company_name } = req.body;

    // Validation basique
    if (!email || !password || !role) {
      return res.status(400).json({ message: "L'email, le mot de passe et le rôle sont obligatoires." });
    }

    // Vérifier si le rôle est valide
    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ message: "Le rôle doit être 'student' ou 'company'." });
    }

    // Début de la transaction SQL
    await connection.beginTransaction();

    // Vérifier si l'email existe déjà
    const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await connection.rollback(); // Annuler si l'email existe
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion dans la table `users`
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    const userId = userResult.insertId;

    // Création du profil associé
    if (role === 'student') {
      await connection.query(
        'INSERT INTO student_profiles (user_id, first_name, last_name) VALUES (?, ?, ?)',
        [userId, first_name || '', last_name || '']
      );
    } else if (role === 'company') {
      await connection.query(
        'INSERT INTO company_profiles (user_id, company_name) VALUES (?, ?)',
        [userId, company_name || 'Entreprise']
      );
    }

    // Valider la transaction si tout s'est bien passé
    await connection.commit();

    res.status(201).json({ message: "Compte créé avec succès !", userId });

  } catch (error) {
    // En cas d'erreur, annuler toute modification en BDD
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    // Libérer la connexion BDD
    connection.release();
  }
};

// 2. CONNEXION (Login) avec Récupération des IDs de profil
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
    }

    // Récupérer l'utilisateur
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const user = users[0];

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    // Récupérer le profile_id correspondant au rôle
    let profileId = null;
    if (user.role === 'student') {
      const [student] = await db.query('SELECT id FROM student_profiles WHERE user_id = ?', [user.id]);
      if (student.length > 0) profileId = student[0].id;
    } else if (user.role === 'company') {
      const [company] = await db.query('SELECT id FROM company_profiles WHERE user_id = ?', [user.id]);
      if (company.length > 0) profileId = company[0].id;
    }

    // Génération du Token JWT (on inclut profile_id dans le payload)
    const token = jwt.sign(
      { id: user.id, profile_id: profileId, role: user.role },
      process.env.JWT_SECRET || 'secret_de_secours',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Connexion réussie !",
      token,
      user: {
        id: user.id,
        profile_id: profileId,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};