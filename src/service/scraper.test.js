const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { fetchHighscoreData } = require('./scraper');

describe('fetchHighscoreData', () => {
    let mock;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    afterAll(() => {
        mock.restore();
    });

    it('should fetch highscores correctly from the first page', async () => {
        mock.onGet("https://www.slaynville.com/?highscores/experience").reply(200, `
            <table>
                <tr><td></td><td></td><td>Name\nNone</td><td>9</td><td>100</td></tr>
                <tr><td></td><td></td><td>Name2\nNone</td><td>8</td><td>50</td></tr>
            </table>
        `);

        const result = await fetchHighscoreData();
        
        expect(result).toEqual([
            { name: 'Name', level: 9, points: 100 }
        ]);
    });

    it('should stop fetching when it finds a character with level 8', async () => {
        // Simula resposta de múltiplas páginas
        mock.onGet("https://www.slaynville.com/?highscores/experience").reply(200, `
            <table>
                <tr><td></td><td></td><td>Name1\nNone</td><td>9</td><td>100</td></tr>
                <tr><td></td><td></td><td>Name2\nNone</td><td>8</td><td>50</td></tr>
            </table>
        `);

        const result = await fetchHighscoreData();

        expect(result).toEqual([
            { name: 'Name1', level: 9, points: 100 }
        ]);
    });
});
