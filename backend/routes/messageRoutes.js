const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware'); // Ajustez selon le nom de votre middleware

router.get('/conversations', verifyToken, messageController.getConversations);
router.get('/:otherUserId', verifyToken, messageController.getMessages);
router.post('/', verifyToken, messageController.sendMessage);

module.exports = router;