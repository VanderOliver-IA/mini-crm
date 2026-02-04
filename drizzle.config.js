const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

console.log('DEBUG (JS): Config using URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'UNDEFINED');

module.exports = {
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};
