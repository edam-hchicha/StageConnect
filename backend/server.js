const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Vérification connexion DB
require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Déclaration des endpoints API
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API StageConnect opérationnelle ! 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});