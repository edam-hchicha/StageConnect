require('dotenv').config(); // 1. Toujours en tout premier !
const mysql = require('mysql2/promise'); // 2. On importe directement la version Promise

// Création du pool de connexions MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stageconnect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de la connexion (Version async/await)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connecté avec succès à la base de données MySQL !');
    connection.release();
  } catch (err) {
    console.error('❌ Erreur de connexion à MySQL :', err.message);
  }
})();

module.exports = pool;