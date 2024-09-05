const { fetchHighscoreData } = require('../service/scraper');
const { logger } = require('../utils/logger');

const getHighscores = async (req, res) => {
    try {
        const characters = await fetchHighscoreData();
        res.status(200).json(characters);
    } catch (error) {
        logger.error('Error fetching highscore data', error);
        res.status(500).json({message: 'Failed to fetch highscores', error: error.message });
    }
};

module.exports = {
    getHighscores
};
