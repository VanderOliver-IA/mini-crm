import type { Config } from 'drizzle-kit';

export default {
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://postgres.pctsueorgbyejcylmszy:MiniCrm2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
    },
} satisfies Config;
