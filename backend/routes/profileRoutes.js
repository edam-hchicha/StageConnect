const express = require('express');
const router = express.Router();
const db = require('../config/db'); // adaptez le chemin vers votre fichier de BDD
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // votre middleware upload existant

// Routes actuelles
router.get('/me', authMiddleware, profileController.getProfile);
router.put('/me', authMiddleware, profileController.updateProfile);

// 🟢 NOUVELLE ROUTE : Pour ajouter ou modifier SEULEMENT le CV de l'étudiant
router.post('/upload-cv', authMiddleware, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu." });
    }

    const cvUrl = `/uploads/cvs/${req.file.filename}`;

    // On met à jour directement le champ cv_url pour l'utilisateur connecté
    await db.query(
      'UPDATE student_profiles SET cv_url = ? WHERE user_id = ?',
      [cvUrl, req.user.id]
    );

    res.status(200).json({ 
      message: "CV enregistré avec succès !", 
      cv_url: cvUrl 
    });
  } catch (error) {
    console.error("Erreur Upload CV :", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;