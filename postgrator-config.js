const pg = require('pg');
pg.defaults.ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;