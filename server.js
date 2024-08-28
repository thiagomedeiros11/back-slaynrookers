const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigin = process.env.ALLOWED_ORIGIN.split(',');

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

async function updateHighscores() {
    const baseUrl = "https://www.slaynville.com/?highscores/experience";
    let page = 0;
    const characters = [];

    while (true) {
        const url = page === 0 ? baseUrl : `${baseUrl}/${page}`;
        console.log(`Fetching page: ${page}`);

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const rows = $('tr');
        if (rows.length === 0) {
            console.log("No more rows found.");
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

                if (level === 8) {
                    stopSearch = true;
                    return false;
                }
            }
        });

        if (stopSearch) {
            console.log("Stopping search, found level 8.");
            break;
        }

        page += 1;

    }
    return characters;
}

app.get('/api/highscores', (req, res) => {
    updateHighscores().then((characters) => res.json(characters)).catch(err => {
        console.error(err);
        res.status(500).send('Server error'); 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});
