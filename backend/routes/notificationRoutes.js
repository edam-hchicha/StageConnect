const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// ⚠️ Remplacez cette ligne par le chemin exact utilisé dans vos autres routes (ex: authRoutes.js ou jobRoutes.js)
const verifyToken = require('../middleware/authMiddleware'); // ou '../middleware/auth' ou '../middlewares/auth'

router.get('/', verifyToken, notificationController.getCompanyNotifications);
router.put('/read-all', verifyToken, notificationController.markAsRead);

module.exports = router;