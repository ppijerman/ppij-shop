import { getCurrentDbUserOrThrow } from '@/lib/users';
import SettingsForm from '../../../components/setting/SettingsForm';

export default async function SettingsPage() {
  const user = await getCurrentDbUserOrThrow();

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 32, letterSpacing: '0.02em' }}>
        ACCOUNT SETTINGS
      </h2>
      <SettingsForm user={user} />
    </div>
  );
}
