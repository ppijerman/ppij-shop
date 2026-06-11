'use server';

import { db } from '../db'
import { clerkClient } from '@clerk/nextjs/server';
import { requireITAdmin } from '../auth';

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

export async function deleteOwnAccountAction() {
  const { getCurrentDbUserOrThrow } = await import('../users');
  const user = await getCurrentDbUserOrThrow();

  await db.query(`DELETE FROM users WHERE id = $1`, [user.id]);

  const client = await clerkClient();
  await client.users.deleteUser(user.clerk_user_id);
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