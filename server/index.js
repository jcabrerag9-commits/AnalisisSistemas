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

const crudRoutes = require('./routes');
app.use('/api', crudRoutes);

// Inicializar BD y Servidor
async function startServer() {
    await db.initialize();

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

startServer();
