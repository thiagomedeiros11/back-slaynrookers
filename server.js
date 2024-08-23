const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigin = [
    'https://front-slaynrookers-git-main-thiagomedeiros11s-projects.vercel.app',
    'https://front-slaynrookers.vercel.app'
];

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

let cachedHighscores = [];
let lastUpdated = new Date(0);


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
    cachedHighscores = characters;
    lastUpdated = new Date();
}

cron.schedule('55 7,19 * * *', () => {
    axios.get('https://back-slaynrookers.onrender.com/api/highscores')
    .then(response => console.log('Warm-up request made'))
    .catch(err => console.error('Warm-up request failed', err));
});

app.get('/api/highscores', (req, res) => {
    if (cachedHighscores.length === 0 || (new Date() - lastUpdated) > 24 * 60 * 60 * 1000) {
        updateHighscores().then(() => res.json(cachedHighscores)).catch(err => {
            console.error(err);
            res.status(500).send('Server error');
        });
    } else {
        res.json(cachedHighscores);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
