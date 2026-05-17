export interface User {
  id: number
  clerk_user_id: string
  first_name: string
  last_name: string | null
  email: string
  role: 'BUYER' | 'ADMIN_KK' | 'ADMIN_IT'
  created_at: string
  updated_at: string | null
}

export const USERS: User[] = [
  {
    id: 1,
    clerk_user_id: "user_2NNEqL2nrIRdJ194ndJiSCjFMnP",
    first_name: 'Mulyono',
    last_name: null,
    email: 'mulyono@gmail.com',
    role: 'BUYER' as const,
    created_at: '2026-04-01T10:00:00Z',
    updated_at: null
  },
  {
    id: 2,
    clerk_user_id: "user_2NNEqL2nrIRdJ194ndJiSCjFMnQ",
    first_name: 'John',
    last_name: 'Pork',
    email: 'john@pork.com',
    role: 'BUYER' as const,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2026-04-03T14:00:00Z'
  },
  {
    id: 3,
    clerk_user_id: "user_2NNEqL2nrIRdJ194ndJiSCjFMnR",
    first_name: 'Budi',
    last_name: 'Santoso',
    email: 'budi@ppij.org',
    role: 'ADMIN_KK' as const,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null
  },
  {
    id: 4,
    clerk_user_id: "user_4GGFEqLgargergegrfndJiSCj76R",
    first_name: 'Siti',
    last_name: null,
    email: 'it@ppij.org',
    role: 'ADMIN_IT' as const,
    created_at: '22024-02-01T10:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
]

export function getUserById(id: number): User | undefined {
  return USERS.find(u => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return USERS.find(u => u.email === email)
}