const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Ejemplo de ruta que conecta a BD
app.get('/api/users', async (req, res) => {
    try {
        // Ejemplo de query (Asegúrate de que la tabla exista o cámbiala)
        // const result = await db.executeQuery('SELECT * FROM users');
        // res.json(result.rows);

        // Simulación por ahora para evitar fallos si no hay BD conectada aún
        res.json([
            { id: 1, name: 'Usuario Prueba 1', email: 'test1@example.com' },
            { id: 2, name: 'Usuario Prueba 2', email: 'test2@example.com' }
        ]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inicializar BD y Servidor
async function startServer() {
    // Aquí puedes descomentar db.initialize() si ya tienes tus credenciales listas
    // await db.initialize();

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

startServer();
