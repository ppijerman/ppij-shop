'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DbUser } from '@/lib/users';
import { deleteOwnAccountAction } from '@/lib/actions/users';

export default function SettingsForm({ user }: { user: DbUser }) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: `${user.first_name} ${user.last_name || ''}`.trim(),
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings updated (DB logic needed)');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteOwnAccountAction();
      router.push('/');
    } catch {
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Personal Info */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          PERSONAL INFORMATION
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Full Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ 
              padding: '12px 16px', 
              background: 'var(--cream-2)', 
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-body)',
              fontSize: 14
            }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ 
              padding: '12px 16px', 
              background: 'var(--cream-2)', 
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-body)',
              fontSize: 14
            }} 
          />
        </div>
      </section>

      {/* Password Update */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
          SECURITY
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Current Password</label>
          <input 
            type="password" 
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
            style={{ 
              padding: '12px 16px', 
              background: 'var(--cream-2)', 
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-body)',
              fontSize: 14
            }} 
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>New Password</label>
            <input 
              type="password" 
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              style={{ 
                padding: '12px 16px', 
                background: 'var(--cream-2)', 
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-body)',
                fontSize: 14
              }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ 
                padding: '12px 16px', 
                background: 'var(--cream-2)', 
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-body)',
                fontSize: 14
              }} 
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        style={{
          padding: '16px',
          background: 'var(--black)',
          color: 'var(--cream)',
          border: 'none',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          marginTop: 20
        }}
      >
        SAVE CHANGES
      </button>

      {/* Danger Zone */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c0392b', borderBottom: '1px solid #c0392b', paddingBottom: 10 }}>
          DANGER ZONE
        </h3>
        {!showDeleteConfirm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                alignSelf: 'flex-start',
                padding: '12px 24px',
                background: 'transparent',
                color: '#c0392b',
                border: '1px solid #c0392b',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              DELETE ACCOUNT
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, background: '#fff5f5', border: '1px solid #c0392b' }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
              Are you sure? This will permanently delete your account and cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{
                  padding: '12px 16px',
                  background: 'var(--cream-2)',
                  border: '1px solid #c0392b',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                style={{
                  padding: '12px 24px',
                  background: deleteConfirmText === 'DELETE' ? '#c0392b' : '#e0b0ac',
                  color: '#fff',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                }}
              >
                {isDeleting ? 'DELETING...' : 'CONFIRM DELETE'}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                disabled={isDeleting}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: 'var(--black)',
                  border: '1px solid var(--line)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </section>
    </form>
  );
}
