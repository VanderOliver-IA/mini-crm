const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function update() {
    console.log("Adding PRO columns to Supabase...");
    try {
        await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direto';`;
        await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_contact_at TIMESTAMP;`;
        console.log("Schema updated successfully!");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await sql.end();
    }
}

update();
