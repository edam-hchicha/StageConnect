const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Format de token invalide." });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_de_secours');
    
    // On attache les infos décodées à la requête
    req.user = decoded; 
    
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }
};