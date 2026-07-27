const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, applicationController.applyToJob);
router.get('/student', authMiddleware, applicationController.getStudentApplications);
router.get('/company', authMiddleware, applicationController.getCompanyApplications);

// Route pour qu'une entreprise accepte/refuse un candidat
router.put('/:id/status', authMiddleware, applicationController.updateApplicationStatus);

module.exports = router;