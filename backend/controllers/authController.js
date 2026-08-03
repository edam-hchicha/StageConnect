const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendEmail');

// 1. INSCRIPTION (Register) avec Génération de Token et Envoi d'Email
exports.register = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { email, password, role, first_name, last_name, company_name } = req.body;

    // Validation basique
    if (!email || !password || !role) {
      return res.status(400).json({ message: "L'email, le mot de passe et le rôle sont obligatoires." });
    }

    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ message: "Le rôle doit être 'student' ou 'company'." });
    }

    await connection.beginTransaction();

    // Vérifier si l'email existe déjà
    const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Génération d'un token aléatoire unique pour la vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insertion dans `users` avec is_verified = 0
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role, is_verified, verification_token) VALUES (?, ?, ?, 0, ?)',
      [email, hashedPassword, role, verificationToken]
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

    // Envoi de l'e-mail de vérification
    await sendVerificationEmail(email, verificationToken);

    await connection.commit();

    res.status(201).json({
      message: "Compte créé avec succès ! Un e-mail de confirmation vous a été envoyé.",
      userId
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// 2. VÉRIFICATION DE L'EMAIL (Validation du compte)
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token de vérification manquant." });
    }

    const [users] = await db.query('SELECT id FROM users WHERE verification_token = ?', [token]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    // Activer le compte et supprimer le token
    await db.query(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [users[0].id]
    );

    res.status(200).json({ message: "Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant vous connecter !" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. CONNEXION (Login) avec vérification de l'état du compte
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérifier si l'utilisateur a confirmé son e-mail
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Veuillez vérifier votre adresse e-mail avant de vous connecter."
      });
    }

    let profileId = null;
    if (user.role === 'student') {
      const [student] = await db.query('SELECT id FROM student_profiles WHERE user_id = ?', [user.id]);
      if (student.length > 0) profileId = student[0].id;
    } else if (user.role === 'company') {
      const [company] = await db.query('SELECT id FROM company_profiles WHERE user_id = ?', [user.id]);
      if (company.length > 0) profileId = company[0].id;
    }

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