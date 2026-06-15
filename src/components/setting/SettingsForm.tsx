'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DbUser } from '@/lib/users';
import { deleteOwnAccountAction, updateNameAction } from '@/lib/actions/users';

export default function SettingsForm({ user }: { user: DbUser }) {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [nameData, setNameData] = useState({
    firstName: user.first_name,
    lastName: user.last_name ?? '',
  });
  const [nameStatus, setNameStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameStatus(null);
    setIsSavingName(true);
    try {
      await updateNameAction(nameData.firstName, nameData.lastName);
      setNameStatus({ ok: true, msg: 'Name updated successfully.' });
    } catch (err) {
      setNameStatus({ ok: false, msg: err instanceof Error ? err.message : 'Failed to update name.' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!passwordData.newPassword) {
      setPasswordStatus({ ok: false, msg: 'New password is required.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ ok: false, msg: 'New passwords do not match.' });
      return;
    }
    if (!clerkUser) {
      setPasswordStatus({ ok: false, msg: 'Not authenticated.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      await clerkUser.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ ok: true, msg: 'Password updated successfully.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setPasswordStatus({ ok: false, msg });
    } finally {
      setIsSavingPassword(false);
    }
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

  const initialFirstName = user.first_name;
  const initialLastName = user.last_name ?? '';

  const getFieldStyle = (isChanged: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    border: '1px solid var(--line)',
    backgroundColor: isChanged ? '#fff7ed' : 'white',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  });

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    border: '1px solid var(--line)',
    backgroundColor: 'white',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--cream-2)',
    padding: 28,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    borderBottom: '1px solid var(--line)',
    paddingBottom: 10,
    margin: 0,
  };

  const saveButtonStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    padding: '12px 24px',
    background: 'var(--black)',
    color: 'var(--cream)',
    border: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.1em',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Personal Info */}
      <form onSubmit={handleNameSubmit} style={cardStyle}>
        <h3 style={sectionHeadingStyle}>PERSONAL INFORMATION</h3>
        <div className="r-stack-768" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>First Name</label>
            <input
              type="text"
              value={nameData.firstName}
              onChange={e => setNameData(prev => ({ ...prev, firstName: e.target.value }))}
              required
              style={getFieldStyle(nameData.firstName !== initialFirstName)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Last Name</label>
            <input
              type="text"
              value={nameData.lastName}
              onChange={e => setNameData(prev => ({ ...prev, lastName: e.target.value }))}
              required
              style={getFieldStyle(nameData.lastName !== initialLastName)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
          />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Email cannot be changed here.</span>
        </div>
        {nameStatus && (
          <p style={{ fontSize: 13, color: nameStatus.ok ? '#2e7d32' : '#c0392b', margin: 0 }}>
            {nameStatus.msg}
          </p>
        )}
        <button type="submit" disabled={isSavingName} style={saveButtonStyle}>
          {isSavingName ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>

      {/* Security */}
      <form onSubmit={handlePasswordSubmit} style={cardStyle}>
        <h3 style={sectionHeadingStyle}>SECURITY</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            placeholder="••••••••"
            style={getFieldStyle(passwordData.currentPassword !== '')}
          />
        </div>
        <div className="r-stack-768" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              style={getFieldStyle(passwordData.newPassword !== '')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              style={getFieldStyle(passwordData.confirmPassword !== '')}
            />
          </div>
        </div>
        {passwordStatus && (
          <p style={{ fontSize: 13, color: passwordStatus.ok ? '#2e7d32' : '#c0392b', margin: 0 }}>
            {passwordStatus.msg}
          </p>
        )}
        <button type="submit" disabled={isSavingPassword} style={saveButtonStyle}>
          {isSavingPassword ? 'SAVING...' : 'UPDATE PASSWORD'}
        </button>
      </form>

      {/* Danger Zone */}
      <div style={{ ...cardStyle, border: '1px solid rgba(192,57,43,0.25)', background: '#fff5f5' }}>
        <h3 style={{ ...sectionHeadingStyle, color: '#c0392b', borderBottomColor: 'rgba(192,57,43,0.25)' }}>
          DANGER ZONE
        </h3>
        {!showDeleteConfirm ? (
          <>
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
                fontSize: 12,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              DELETE ACCOUNT
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
              Are you sure? This will permanently delete your account and cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Type DELETE to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{ ...inputStyle, borderColor: 'rgba(192,57,43,0.4)' }}
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
                  fontSize: 12,
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
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
