import { getCurrentDbUserOrThrow } from '@/lib/users';
import SettingsForm from '@/components/setting/SettingsForm';
import Link from 'next/link';

export default async function AdminSettingsPage() {
 const user = await getCurrentDbUserOrThrow()
 return (
   <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>SETTINGS</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 40 }}>
        {/* Profile Section (Matches Buyer Layout) */}
        <section style={{ background: 'var(--cream-2)', padding: 32, border: '1px solid var(--line)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24, letterSpacing: '0.02em' }}>
            ADMIN PROFILE
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Full Name</label>
              <p style={{ fontSize: 16, fontWeight: 500 }}>{user.first_name} {user.last_name || ''}</p>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email Address</label>
              <p style={{ fontSize: 16, fontWeight: 500 }}>{user.email}</p>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Management Access</label>
              <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--accent-deep)' }}>{user.role}</p>
            </div>
          </div>
        </section>
        {/* Account Security Section */}
        <section style={{ background: 'var(--cream-2)', padding: 32, border: '1px solid var(--line)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24, letterSpacing: '0.02em' }}>
            ACCOUNT SECURITY
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Manage your password and authentication methods.
          </p>
          
          <SettingsForm user={user} />
          
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
             <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
               Internal Security Level: High
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}