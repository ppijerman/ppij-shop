'use client';

import { MOCK_USER } from '@/data/account';
import { useState } from 'react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: MOCK_USER.name,
    email: MOCK_USER.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings updated (Mock)');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 32, letterSpacing: '0.02em' }}>
        ACCOUNT SETTINGS
      </h2>

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
      </form>
    </div>
  );
}
