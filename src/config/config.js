const dotenv = require('dotenv');


const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });

module.exports = {
    port: process.env.PORT || 3000,
    allowedOrigin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : []
};
