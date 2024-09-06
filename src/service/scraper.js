const axios = require('axios');
const cheerio = require('cheerio');
const { logger } = require('../utils/logger');

const BASE_URL = "https://www.slaynville.com/?highscores/experience";
const MINIMUM_LEVEL = 8;

const fetchHighscoreData = async () => {
    let page = 0;
    const characters = [];

    while (true) {
        const url = page === 0 ? BASE_URL : `${BASE_URL}/${page}`;
        logger.info(`Fetching page: ${page}`);

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const rows = $('tr');
        if (rows.length === 0) {
            logger.info("No more rows found.");
            break;
        }

        let stopSearch = false;
        rows.each((index, row) => {
            const columns = $(row).find('td');
            if (columns.length >= 4) {
                const nameAndVocation = $(columns[2]).text().trim().split('\n');
                const name = nameAndVocation[0]?.trim() || "";
                const vocation = nameAndVocation[1]?.trim() || "";
                const level = parseInt($(columns[3]).text().trim().replace(',', ''), 10);
                const points = parseInt($(columns[4]).text().trim().replace(',', ''), 10);

                    if (vocation.toLowerCase() === "none" && level >= 9) {
                        characters.push({ name, level, points });
                    }

                    if (level === MINIMUM_LEVEL) {
                        stopSearch = true;
                        return false;
                    }
            }
        });

        if (stopSearch) {
            logger.info("Stopping seach, found level 8.");
            break;
        }

        page += 1;
    }

    return characters;
};

module.exports = {
    fetchHighscoreData
};
            
