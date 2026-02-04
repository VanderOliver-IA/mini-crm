require('dotenv').config({ path: '.env.local' });

const url = process.env.DATABASE_URL;
console.log("---------------------------------------------------");
console.log("DEBUG: What Node.js sees in .env.local:");
console.log("Full URL Length:", url ? url.length : 0);
console.log("Host part:", url ? url.split('@')[1] : 'undefined');
console.log("Starting chars:", url ? url.substring(0, 30) : 'undefined');
console.log("Ending chars:", url ? url.substring(url.length - 20) : 'undefined');
console.log("---------------------------------------------------");

const postgres = require('postgres');
try {
    const sql = postgres(url, { connect_timeout: 5 });
    console.log("Attempting ping (5s timeout)...");
    sql`SELECT 1`.then(() => {
        console.log("Ping SUCCESS!");
        process.exit(0);
    }).catch(err => {
        console.log("Ping FAILED:", err.message);
        process.exit(1);
    });
} catch (e) {
    console.log("Init FAILED:", e.message);
}
