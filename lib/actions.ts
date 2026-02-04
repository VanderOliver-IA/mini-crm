'use server';

import { db } from '@/lib/db';
import { leads, users, activities } from '@/lib/db/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function ensureUserExists() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, user.id),
  });

  if (!dbUser) {
    await db.insert(users).values({
      id: user.id,
      clerkUserId: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'no-email',
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatarUrl: user.imageUrl,
    });
  }
  return user.id;
}

export async function getLeads() {
  const userId = await ensureUserExists();
  return await db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
}

export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  estimatedValue?: number;
  status?: string;
  source?: string;
  nextContactAt?: Date;
}) {
  const userId = await ensureUserExists();
  const leadId = crypto.randomUUID();

  await db.insert(leads).values({
    id: leadId,
    userId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    estimatedValue: data.estimatedValue || 0,
    status: data.status || 'novo',
    source: data.source || 'direto',
    nextContactAt: data.nextContactAt || null,
  });

  // Log activity
  await logActivity(leadId, 'create', `Lead criado via ${data.source || 'direto'}`);

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}

export async function updateLeadStatus(leadId: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.update(leads)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leads.id, leadId), eq(leads.userId, userId)));

  await logActivity(leadId, 'status_change', `Status alterado para ${status}`);

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}

export async function logActivity(leadId: string, type: string, content: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.insert(activities).values({
    id: crypto.randomUUID(),
    userId,
    leadId,
    type,
    content,
  });
}

export async function getDashboardStats() {
  const userId = await ensureUserExists();

  // Total Pipeline Value
  const totalValueResult = await db.select({
    total: sql<number>`SUM(estimated_value)`
  }).from(leads).where(eq(leads.userId, userId));

  // Leads by status
  const statusCounts = await db.select({
    status: leads.status,
    count: sql<number>`COUNT(*)`,
    value: sql<number>`SUM(estimated_value)`
  }).from(leads).where(eq(leads.userId, userId)).groupBy(leads.status);

  // Leads by source
  const sourceCounts = await db.select({
    source: leads.source,
    count: sql<number>`COUNT(*)`
  }).from(leads).where(eq(leads.userId, userId)).groupBy(leads.source);

  // Follow-ups for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const followUpsToday = await db.select().from(leads)
    .where(and(
      eq(leads.userId, userId),
      sql`${leads.nextContactAt} >= ${today} AND ${leads.nextContactAt} < ${tomorrow}`
    ));

  return {
    totalPipeline: totalValueResult[0]?.total || 0,
    byStatus: statusCounts,
    bySource: sourceCounts,
    tasksToday: followUpsToday
  };
}

export async function deleteLead(leadId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.delete(leads)
    .where(and(eq(leads.id, leadId), eq(leads.userId, userId)));

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');
}

export async function getLeadActivities(leadId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return await db.select().from(activities)
    .where(and(eq(activities.leadId, leadId), eq(activities.userId, userId)))
    .orderBy(desc(activities.createdAt));
}
