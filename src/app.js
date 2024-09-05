const express = require('express');
const cors = require('cors');
const { port, allowedOrigin } = require('./src/config/config');
const { getHighscores } = require('./src/controllers/highscoresController');
const { logger } = require('./src/utils/logger');

const app = express();

// Configuração do CORS
app.use(cors({
    origin: allowedOrigin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
}));

// Desabilitar cache
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Rota de highscores
app.get('/api/highscores', getHighscores);

// Iniciar o servidor
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

