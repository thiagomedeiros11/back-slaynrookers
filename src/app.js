const express = require('express');
const cors = require('cors');
const { port, allowedOrigin } = require('./config/config');
const { getHighscores } = require('./controllers/highscoresController');
const { logger } = require('./utils/logger');

const app = express();

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

app.get('/api/highscores', getHighscores);

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
