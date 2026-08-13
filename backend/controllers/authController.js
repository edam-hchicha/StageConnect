const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../utils/sendEmail');

// 1. INSCRIPTION (Register) - Gestion des réexpéditions si le compte n'est pas encore vérifié
exports.register = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { email: rawEmail, password, role, first_name, last_name, company_name, name } = req.body;

    if (!rawEmail || !password || !role) {
      return res.status(400).json({ message: "L'email, le mot de passe et le rôle sont obligatoires." });
    }

    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ message: "Le rôle doit être 'student' ou 'company'." });
    }

    const email = String(rawEmail).trim().toLowerCase();

    await connection.beginTransaction();

    // Extraction du nom / prénom
    let studentFirstName = first_name || '';
    let studentLastName = last_name || '';
    if (!first_name && name) {
      const parts = name.trim().split(' ');
      studentFirstName = parts[0] || '';
      studentLastName = parts.slice(1).join(' ') || '';
    }
    const compName = company_name || (role === 'company' && name ? name : 'Entreprise');

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await connection.query(
      'SELECT id, is_verified FROM users WHERE LOWER(TRIM(email)) = ?',
      [email]
    );

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    let userId;

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      // CAS A : Le compte existe ET est déjà vérifié
      if (existingUser.is_verified === 1) {
        await connection.rollback();
        return res.status(400).json({ message: "Cet email est déjà utilisé par un compte actif." });
      }

      // CAS B : Le compte existe MAIS n'est pas vérifié -> On met à jour le code et le mot de passe
      userId = existingUser.id;

      await connection.query(
        'UPDATE users SET password = ?, role = ?, verification_token = ? WHERE id = ?',
        [hashedPassword, role, verificationCode, userId]
      );

      if (role === 'student') {
        await connection.query(
          'UPDATE student_profiles SET first_name = ?, last_name = ? WHERE user_id = ?',
          [studentFirstName, studentLastName, userId]
        );
      } else if (role === 'company') {
        await connection.query(
          'UPDATE company_profiles SET company_name = ? WHERE user_id = ?',
          [compName, userId]
        );
      }

    } else {
      // CAS C : Nouvel utilisateur -> Création
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, role, is_verified, verification_token) VALUES (?, ?, ?, 0, ?)',
        [email, hashedPassword, role, verificationCode]
      );
      userId = userResult.insertId;

      if (role === 'student') {
        await connection.query(
          'INSERT INTO student_profiles (user_id, first_name, last_name) VALUES (?, ?, ?)',
          [userId, studentFirstName, studentLastName]
        );
      } else if (role === 'company') {
        await connection.query(
          'INSERT INTO company_profiles (user_id, company_name) VALUES (?, ?)',
          [userId, compName]
        );
      }
    }

    // Envoi de l'e-mail de vérification avec le code
    await sendVerificationEmail(email, verificationCode);

    await connection.commit();

    res.status(201).json({
      message: "Un code de vérification vous a été envoyé par e-mail.",
      userId
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// 2. VÉRIFICATION DE L'EMAIL (Validation du code)
exports.verifyEmail = async (req, res) => {
  try {
    const rawEmail = req.body.email || req.query.email;
    const rawCode = req.body.code || req.body.token || req.query.token;

    if (!rawCode || !rawEmail) {
      return res.status(400).json({ message: "L'adresse email et le code de vérification sont obligatoires." });
    }

    const email = String(rawEmail).trim().toLowerCase();
    const code = String(rawCode).trim();

    const [users] = await db.query(
      'SELECT id, verification_token, is_verified FROM users WHERE LOWER(TRIM(email)) = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Adresse e-mail introuvable." });
    }

    const user = users[0];

    if (user.is_verified === 1) {
      return res.status(200).json({ message: "Votre compte est déjà vérifié. Vous pouvez vous connecter !" });
    }

    const dbToken = user.verification_token ? String(user.verification_token).trim() : null;

    if (!dbToken || dbToken !== code) {
      return res.status(400).json({ message: "Code de vérification invalide ou expiré." });
    }

    await db.query(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    res.status(200).json({ message: "Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant vous connecter !" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. CONNEXION (Login)
exports.login = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
    }

    const email = String(rawEmail).trim().toLowerCase();

    const [users] = await db.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

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