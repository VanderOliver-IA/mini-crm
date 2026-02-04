require('dotenv').config({ path: '.env.local' });
const { db } = require('./lib/db/index');
const { users } = require('./lib/db/schema');

async function test() {
    console.log("Testing connection via lib/db...");
    try {
        const result = await db.select().from(users);
        console.log("Success! Data:", result);
    } catch (err) {
        console.error("Failed!", err.message);
    }
    process.exit(0);
}

test();
