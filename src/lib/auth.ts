import { getCurrentDbUserOrThrow } from "./users";

export async function requireAdmin() {
  const user = await getCurrentDbUserOrThrow();
  if (user.role !== 'ADMIN_IT' && user.role !== 'ADMIN_KK') {
    throw new Error('Forbidden');
  }

  return user;
}

export async function requireITAdmin() {
  const user = await getCurrentDbUserOrThrow();
  if (user.role !== 'ADMIN_IT') {
    throw new Error('Forbidden');
  }

  return user;
}

export async function requireOrderAdmin() {
  const user = await getCurrentDbUserOrThrow();
  if (user.role !== 'ADMIN_IT' && user.role !== 'ADMIN_KK') {
    throw new Error('Forbidden');
  }

  return user;
}
