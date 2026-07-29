const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Ton middleware JWT

// Route GET pour consulter son profil (sécurisée)
router.get('/profile', authMiddleware, userController.getProfile);

// Route PUT pour modifier son profil (sécurisée)
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;