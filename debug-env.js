require('dotenv').config({ path: '.env.local' });

const url = process.env.DATABASE_URL;
console.log("Raw URL length:", url ? url.length : 'undefined');
console.log("Raw URL first 20 chars:", url ? url.substring(0, 20) : 'undefined');
console.log("Raw URL last 5 chars:", url ? url.substring(url.length - 5) : 'undefined');
console.log("Contains single quote?", url ? url.includes("'") : false);
console.log("Contains double quote?", url ? url.includes('"') : false);
