const db       = require('../db');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'contabilidad_secret_2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;

        if (!usuario || !contrasena) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
        }

        // 1. Buscar usuario en la base de datos
        const SQL = `
            SELECT
                U.USU_USUARIO,
                U.USU_USER,
                U.USU_CONTRASEÑA,
                LISTAGG(R.ROL_NOMBRE, ',') WITHIN GROUP (ORDER BY R.ROL_NOMBRE) AS ROLES
            FROM CON_USUARIO U
            LEFT JOIN CON_USUARIO_ROL UR ON U.USU_USUARIO = UR.USU_USUARIO
            LEFT JOIN CON_ROL         R  ON UR.ROL_ROL    = R.ROL_ROL
            WHERE UPPER(U.USU_USER) = UPPER(:usuario)
            GROUP BY U.USU_USUARIO, U.USU_USER, U.USU_CONTRASEÑA
        `;
        const result = await db.executeQuery(SQL, { usuario });

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        }

        const user = result.rows[0];

        // 2. Verificar contraseña
        // Soporta tanto bcrypt hash como texto plano (para datos de prueba)
        let passwordValida = false;
        const hashGuardado = user.USU_CONTRASEÑA;

        if (hashGuardado && hashGuardado.startsWith('$2')) {
            // Es un hash bcrypt
            passwordValida = await bcrypt.compare(contrasena, hashGuardado);
        } else {
            // Texto plano (datos de prueba) — comparación directa
            passwordValida = (contrasena === hashGuardado);
        }

        if (!passwordValida) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        }

        // 3. Generar JWT
        const payload = {
            id:      user.USU_USUARIO,
            usuario: user.USU_USER,
            roles:   user.ROLES ? user.ROLES.split(',') : [],
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        // 4. Registrar en bitácora
        try {
            const BIT_SQL = `
                INSERT INTO CON_BITACORA (USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, BIT_DATOS_PREVIOS)
                VALUES (:id, 'CON_USUARIO', 'LOGIN', :datos)
            `;
            await db.executeQuery(BIT_SQL, {
                id:    user.USU_USUARIO,
                datos: JSON.stringify({ LOGIN: new Date().toISOString(), IP: req.ip }),
            });
        } catch (e) {
            // No fallar el login si la bitácora falla
            console.warn('Bitácora de login falló:', e.message);
        }

        res.json({
            token,
            usuario: {
                id:      user.USU_USUARIO,
                nombre:  user.USU_USER,
                roles:   user.ROLES ? user.ROLES.split(',') : [],
            },
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// POST /api/auth/logout  (solo limpia el lado cliente, el token expira solo)
exports.logout = (req, res) => {
    res.json({ message: 'Sesión cerrada correctamente.' });
};

// GET /api/auth/me  — verifica token y retorna datos del usuario
exports.me = (req, res) => {
    res.json({ usuario: req.usuario });
};
