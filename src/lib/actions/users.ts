'use server';

import { db } from '../db'
import { clerkClient } from '@clerk/nextjs/server';
import { requireITAdmin } from '../auth';
import { getCurrentDbUserOrThrow } from '../users';
import { revalidatePath } from 'next/cache';

const ALLOWED_ROLES = ['BUYER', 'ADMIN_KK', 'ADMIN_IT'];
type Role = typeof ALLOWED_ROLES[number];

export async function updateUserRoleAction(userId: string, role: Role) {
  await requireITAdmin();

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('Invalid role');
  }

  const result = await db.query<{ clerk_user_id: string }>(
    `UPDATE users SET role = $2 WHERE id = $1 RETURNING clerk_user_id`,
    [userId, role]
  );

  const clerkUserId = result.rows[0]?.clerk_user_id;
  if (!clerkUserId) throw new Error('User not found');

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role },
  });
}

export async function updateNameAction(firstName: string, lastName: string) {
  const user = await getCurrentDbUserOrThrow();

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();

  if (!trimmedFirst) throw new Error('First name is required');

  // Update Clerk first — if it fails, DB remains unchanged
  const client = await clerkClient();
  await client.users.updateUser(user.clerk_user_id, {
    firstName: trimmedFirst,
    lastName: trimmedLast || undefined,
  });

  await db.query(
    `UPDATE users SET first_name = $2, last_name = $3 WHERE id = $1`,
    [user.id, trimmedFirst, trimmedLast || null]
  );

  revalidatePath('/account/settings');
}

export async function deleteOwnAccountAction() {
  const user = await getCurrentDbUserOrThrow();

  // Delete from Clerk first — if it fails, DB row is still intact
  const client = await clerkClient();
  await client.users.deleteUser(user.clerk_user_id);

  await db.query(`DELETE FROM users WHERE id = $1`, [user.id]);
}

export async function deleteUserAction(userId: string) {
  await requireITAdmin();

  const res = await db.query(
    `SELECT clerk_user_id FROM users WHERE id = $1`,
    [userId]
  )

  const clerkUserId = res.rows[0]?.clerk_user_id;
  if (!clerkUserId) throw new Error('User not found');

  await db.query(
    `DELETE FROM users WHERE id = $1`,
    [userId]
  );

  const client = await clerkClient();
  await client.users.deleteUser(clerkUserId);
}