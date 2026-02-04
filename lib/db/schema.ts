import { pgTable, text, timestamp, doublePrecision, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    clerkUserId: text('clerk_user_id').unique().notNull(),
    email: text('email').notNull(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at'),
});

export const leads = pgTable('leads', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    company: text('company'),

    estimatedValue: doublePrecision('estimated_value').default(0),
    status: text('status').default('novo'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

export const activities = pgTable('activities', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),

    type: text('type').notNull(),
    content: text('content'),
    metadata: text('metadata'), // Can use jsonb in PG, keeping text for simplicity if needed, but lets try text to be safe or jsonb if we prefer

    createdAt: timestamp('created_at').notNull().defaultNow(),
});
