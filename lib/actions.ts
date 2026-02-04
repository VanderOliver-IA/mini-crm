'use server';

import { db } from '@/lib/db';
import { leads, users } from '@/lib/db/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type NewLead = typeof leads.$inferInsert;

async function ensureUserExists() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, user.id),
  });

  if (!dbUser) {
    await db.insert(users).values({
      id: user.id, // Use Clerk ID as PK
      clerkUserId: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'no-email',
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatarUrl: user.imageUrl,
      createdAt: new Date(),
    });
  }
  return user.id;
}

export async function getLeads() {
  const userId = await ensureUserExists();
  return await db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
}

export async function createLead(data: { name: string; email?: string; phone?: string; company?: string; estimatedValue?: number; status?: string }) {
  const userId = await ensureUserExists();

  await db.insert(leads).values({
    id: crypto.randomUUID(),
    userId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    estimatedValue: data.estimatedValue || 0,
    status: data.status || 'novo',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}

export async function updateLeadStatus(leadId: string, status: string) {
  const { userId } = await auth(); // We can trust userId is correct here if logic is consistent, or use ensureUserExists
  if (!userId) throw new Error('Unauthorized');

  await db.update(leads)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leads.id, leadId), eq(leads.userId, userId)));

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}

export async function deleteLead(leadId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.delete(leads)
    .where(and(eq(leads.id, leadId), eq(leads.userId, userId)));

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}
