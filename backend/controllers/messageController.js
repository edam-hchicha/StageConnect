const db = require('../config/db');

// 1. Récupérer l'historique des messages avec un autre utilisateur
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.user_id;
    const { otherUserId } = req.params;

    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );

    // Marquer les messages reçus comme lus
    await db.query(
      `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?`,
      [otherUserId, currentUserId]
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur getMessages :", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Envoyer un message (Sauvegarde BDD + Socket.io)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id || req.user.user_id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content.trim()) {
      return res.status(400).json({ error: "Destinataire et contenu requis." });
    }

    const [result] = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, NOW())`,
      [senderId, receiverId, content]
    );

    const newMessage = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: 0,
      created_at: new Date()
    };

    // Emission Socket.io au destinataire
    if (req.io) {
      req.io.to(`user_${receiverId}`).emit('receive_message', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Erreur sendMessage :", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Obtenir la liste des conversations/interlocuteurs
// controllers/messageController.js

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.user_id;

    const [rows] = await db.query(
      `SELECT 
        u.id AS partner_id,
        u.email AS partner_email,
        COALESCE(
          NULLIF(TRIM(CONCAT(sp.first_name, ' ', sp.last_name)), ''),
          cp.company_name,
          u.email
        ) AS partner_name,
        m.content AS last_message,
        m.created_at
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       LEFT JOIN company_profiles cp ON cp.user_id = u.id
       JOIN messages m ON m.id = (
         SELECT id FROM messages
         WHERE (sender_id = ? AND receiver_id = u.id) 
            OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY id DESC
         LIMIT 1
       )
       ORDER BY m.created_at DESC`,
      [currentUserId, currentUserId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur getConversations :", error);
    res.status(500).json({ error: error.message });
  }
};