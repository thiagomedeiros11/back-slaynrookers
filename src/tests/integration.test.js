const request = require('supertest');
const app = require('../app'); 

let server;

beforeAll(() => {
    server = app.listen(3000);
});

afterAll((done) => {
    server.close(done);
});

jest.mock('../service/scraper', () => ({
    fetchHighscoreData: jest.fn().mockResolvedValue([
        { name: 'Name1', level: 9, points: 100 },
        { name: 'Name2', level: 9, points: 150 }
    ])
}));

describe('GET /api/highscores', () => {
    it('should return the highscores data as JSON', async () => {
        const response = await request(app).get('/api/highscores');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([
            { name: 'Name1', level: 9, points: 100 },
            { name: 'Name2', level: 9, points: 150 }
        ]);
    });

    it('should return a 500 status code when there is a server error', async () => {
        jest.spyOn(require('../service/scraper'), 'fetchHighscoreData').mockRejectedValue(new Error('Server Error'));

        const response = await request(app).get('/api/highscores');
        
        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('Failed to fetch highscores');
    });
});

