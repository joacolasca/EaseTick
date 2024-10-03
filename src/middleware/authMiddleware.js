const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guarda el usuario decodificado en la solicitud
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = authMiddleware;
