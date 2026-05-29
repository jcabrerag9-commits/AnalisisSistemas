const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'contabilidad_secret_2026';

/**
 * Middleware que verifica el JWT en el header Authorization.
 * Si el token es válido, agrega req.usuario con los datos del usuario.
 * Si no, retorna 401.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Sesión expirada. Por favor inicie sesión nuevamente.', expired: true });
        }
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;
