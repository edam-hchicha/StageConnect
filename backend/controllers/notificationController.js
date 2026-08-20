const db = require('../config/db');

// Récupérer les notifications de l'entreprise
exports.getCompanyNotifications = async (req, res) => {
  try {
    const companyUserId = req.user?.profile_id || req.user?.id || req.user?.user_id;

    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE company_user_id = ? 
       ORDER BY created_at DESC LIMIT 30`,
      [companyUserId]
    );

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur getCompanyNotifications :", error);
    return res.status(500).json({ error: error.message });
  }
};

// Marquer toutes les notifications comme lues
exports.markAsRead = async (req, res) => {
  try {
    const companyUserId = req.user?.profile_id || req.user?.id || req.user?.user_id;

    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE company_user_id = ?`,
      [companyUserId]
    );

    return res.status(200).json({ message: "Notifications marquées comme lues." });
  } catch (error) {
    console.error("Erreur markAsRead :", error);
    return res.status(500).json({ error: error.message });
  }
};