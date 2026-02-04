const postgres = require('postgres');

// Hardcoded for debugging
const connectionString = 'postgresql://postgres:MiniCrm2026@db.pctsueorgbyejcylmszy.supabase.co:5432/postgres';

console.log("Testing hardcoded URL...");
const sql = postgres(connectionString);

async function test() {
    try {
        const result = await sql`SELECT 1+1 AS result`;
        console.log("Connection successful!", result);
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        await sql.end();
    }
}

test();
