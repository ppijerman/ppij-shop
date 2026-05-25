import { getCurrentDbUserOrThrow } from "./users";

export async function requireAdmin() {
  const user = await getCurrentDbUserOrThrow();
  if (user.role !== 'ADMIN_IT') {
    throw new Error('Forbidden');
  }
}