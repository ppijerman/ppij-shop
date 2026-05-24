import { getAllUsers } from '@/lib/dal/users';
import UserManagementForm from '../../../../components/admin/UserManagementForm';

export default async function AdminItPage() {
  const users = await getAllUsers();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>
          USER MANAGEMENT
        </h1>
      </div>
      <UserManagementForm initialUsers={users} />
    </div>
  );
}