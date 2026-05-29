import { auth, createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export type UserRole = "BUYER" | "ADMIN_KK" | "ADMIN_IT";

export interface DbUser {
  id: string;
  clerk_user_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface SyncClerkUserInput {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string | null;
}

function normalizeRequiredString(value: string, fieldName: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(`Missing required user sync field: ${fieldName}`);
  }

  return normalizedValue;
}

function normalizeOptionalString(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeSyncClerkUserInput(input: SyncClerkUserInput): SyncClerkUserInput {
  return {
    clerkUserId: normalizeRequiredString(input.clerkUserId, "clerkUserId"),
    email: normalizeRequiredString(input.email, "email"),
    firstName: normalizeRequiredString(input.firstName, "firstName"),
    lastName: normalizeOptionalString(input.lastName),
  };
}

export async function getUserByClerkUserId(clerkUserId: string): Promise<DbUser | null> {
  const normalizedClerkUserId = normalizeRequiredString(clerkUserId, "clerkUserId");
  const result = await db.query<DbUser>(
    `SELECT id, clerk_user_id, first_name, last_name, email, role, created_at, updated_at
     FROM users
     WHERE clerk_user_id = $1
     LIMIT 1`,
    [normalizedClerkUserId],
  );

  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const normalizedEmail = normalizeRequiredString(email, "email");
  const result = await db.query<DbUser>(
    `SELECT id, clerk_user_id, first_name, last_name, email, role, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [normalizedEmail],
  );

  return result.rows[0] ?? null;
}

async function updateUserById(id: string, input: SyncClerkUserInput): Promise<DbUser> {
  const normalizedId = normalizeRequiredString(id, "id");
  const normalizedInput = normalizeSyncClerkUserInput(input);
  const result = await db.query<DbUser>(
    `UPDATE users
     SET clerk_user_id = $2,
         first_name = $3,
         last_name = $4,
         email = $5
     WHERE id = $1
     RETURNING id, clerk_user_id, first_name, last_name, email, role, created_at, updated_at`,
    [
      normalizedId,
      normalizedInput.clerkUserId,
      normalizedInput.firstName,
      normalizedInput.lastName,
      normalizedInput.email,
    ],
  );

  const updatedUser = result.rows[0];

  if (updatedUser === undefined) {
    throw new Error(`Failed to update user record: ${normalizedId}`);
  }

  return updatedUser;
}

async function createUser(input: SyncClerkUserInput): Promise<DbUser> {
  const normalizedInput = normalizeSyncClerkUserInput(input);
  const result = await db.query<DbUser>(
    `INSERT INTO users (clerk_user_id, first_name, last_name, email, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, clerk_user_id, first_name, last_name, email, role, created_at, updated_at`,
    [
      normalizedInput.clerkUserId,
      normalizedInput.firstName,
      normalizedInput.lastName,
      normalizedInput.email,
      "BUYER",
    ],
  );

  const createdUser = result.rows[0];

  if (createdUser === undefined) {
    throw new Error(`Failed to create user record for Clerk user: ${normalizedInput.clerkUserId}`);
  }

  return createdUser;
}

export async function syncClerkUser(input: SyncClerkUserInput): Promise<DbUser> {
  const normalizedInput = normalizeSyncClerkUserInput(input);
  const existingUserByClerkUserId = await getUserByClerkUserId(normalizedInput.clerkUserId);

  if (existingUserByClerkUserId !== null) {
    return updateUserById(existingUserByClerkUserId.id, normalizedInput);
  }

  const existingUserByEmail = await getUserByEmail(normalizedInput.email);

  if (existingUserByEmail !== null) {
    return updateUserById(existingUserByEmail.id, normalizedInput);
  }

  return createUser(normalizedInput);
}

export async function getCurrentDbUserOrThrow(): Promise<DbUser> {
  const authState = await auth();

  if (authState.userId === null) {
    throw new Error("Unauthorized: no active Clerk session found.");
  }

  const user = await getUserByClerkUserId(authState.userId);

  if (user === null) {
    throw new Error(`Local user record not found for Clerk user: ${authState.userId}`);
  }

  await clerkClient.users.updateUserMetadata(user.clerk_user_id, {
    publicMetadata: {
      role: user.role,
    }
  })

  return user;
}
