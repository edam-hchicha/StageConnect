const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importation de la connexion MySQL
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Route de test basique
app.get('/', (req, res) => {
  res.send('API StageConnect opérationnelle !');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});