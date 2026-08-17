const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Ces deux routes requièrent d'être connecté (authMiddleware)
router.get('/me', authMiddleware, profileController.getProfile);
router.put('/me', authMiddleware, profileController.updateProfile);

module.exports = router;