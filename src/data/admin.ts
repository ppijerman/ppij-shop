import { Order, Bundle } from '@/types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    buyerName: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St, Berlin, Germany',
    totalPrice: 50,
    date: '2024-05-10',
    status: 'PAYMENT_CONFIRMATION',
    items: [
      { id: 1, name: 'Fang & Horn', size: 'M', quantity: 2, price: 25 }
    ],
    paymentProof: '/assets/v4/editorial-collage.jpeg'
  },
  {
    id: 'ORD-002',
    buyerName: 'Jane Smith',
    email: 'jane@example.com',
    address: '456 Oak Ave, Hamburg, Germany',
    totalPrice: 43,
    date: '2024-05-11',
    status: 'PENDING_PAYMENT',
    items: [
      { id: 2, name: 'Trio Komodores', size: 'S', quantity: 1, price: 25 },
      { id: 4, name: '"Einkaufen 101"', size: 'ONE SIZE', quantity: 1, price: 18 }
    ]
  },
  {
    id: 'ORD-003',
    buyerName: 'Ali Hassan',
    email: 'ali@example.com',
    address: '789 Pine Rd, Munich, Germany',
    totalPrice: 18,
    date: '2024-05-12',
    status: 'PROCESSING',
    items: [
      { id: 5, name: '"Mit Karte Bitte"', size: 'ONE SIZE', quantity: 1, price: 18 }
    ]
  }
];

export const MOCK_BUNDLES: Bundle[] = [
  {
    id: 1,
    name: 'Tote Duo',
    description: 'Two iconic canvas totes for your daily essentials.',
    price: 32,
    productIds: [4, 5]
  }
];

export type AdminUserRole = 'BUYER' | 'ADMIN_KK' | 'ADMIN_IT';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  joinedDate: string;
};

export const MOCK_USERS: AdminUser[] = [
  {
    id: 'USR-001',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'BUYER',
    joinedDate: '2024-05-10',
  },
  {
    id: 'USR-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'ADMIN_KK',
    joinedDate: '2024-05-11',
  },
  {
    id: 'USR-003',
    name: 'IT Admin',
    email: 'it.admin@example.com',
    role: 'ADMIN_IT',
    joinedDate: '2024-05-12',
  },
];