'use server';

import { db } from '../db'
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '../auth';

const ALLOWED_ROLES = ['BUYER', 'ADMIN_KK', 'ADMIN_IT'];
type Role = typeof ALLOWED_ROLES[number];

export async function updateUserRoleAction(userId: string, role: Role) {
  await requireAdmin();

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('Invalid role');
  }

  await db.query(
    `
    UPDATE users
    SET role = $2
    WHERE id = $1
    `,
    [userId, role]
  );
}

export async function deleteOwnAccountAction() {
  const { getCurrentDbUserOrThrow } = await import('../users');
  const user = await getCurrentDbUserOrThrow();

  await db.query(`DELETE FROM users WHERE id = $1`, [user.id]);

  const client = await clerkClient();
  await client.users.deleteUser(user.clerk_user_id);
}

export async function deleteUserAction(userId: string) {
  await requireAdmin();

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