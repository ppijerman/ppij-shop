export interface User {
  id: number
  name: string
  email: string
  role: 'BUYER' | 'ADMIN_KK' | 'ADMIN_IT'
  created_at: string
}

export const USERS: User[] = [
  {
    id: 1,
    name: 'Mulyono',
    email: 'mulyono@gmail.com',
    role: 'BUYER' as const,
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'John Pork',
    email: 'john@pork.com',
    role: 'BUYER' as const,
    created_at: '2026-04-03T14:00:00Z',
  },
  {
    id: 3,
    name: 'KK Admin',
    email: 'kk@ppij.org',
    role: 'ADMIN_KK' as const,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'IT Admin',
    email: 'it@ppij.org',
    role: 'ADMIN_IT' as const,
    created_at: '2026-01-01T00:00:00Z',
  },
]

export function getUserById(id: number): User | undefined {
  return USERS.find(u => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return USERS.find(u => u.email === email)
}