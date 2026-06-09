'use client';

import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { updateUserRoleAction, deleteUserAction } from '@/lib/actions/users';
import { useRouter } from 'next/navigation';

export default function UserManagementForm({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setEditingUserId(null);
        setDeletingUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalUsers = users.length;
  const adminItUsers = users.filter((user) => user.role === 'ADMIN_IT').length;
  const adminKkUsers = users.filter((user) => user.role === 'ADMIN_KK').length;
  const filteredUsers = users.filter((user) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (roleFilter && user.role !== roleFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      user.first_name,
      user.last_name,
      user.email,
      user.role,
    ].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch);
  });
  const hasFilters = Boolean(search || roleFilter);

  const changeRole = (userId: string, role: string) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, role } : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId)
    );
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 48 }}>
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Admin IT" value={adminItUsers} highlight />
        <StatCard label="Admin KK" value={adminKkUsers} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em', marginBottom: 24, textTransform: 'uppercase', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
        Users
      </h2>

      {actionError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{actionError}</span>
          <button 
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ background: 'var(--cream-2)', borderRadius: 8, border: '1px solid var(--line)', padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr minmax(180px, 1fr) auto', gap: 10, alignItems: 'end' }}>
          <label style={filterLabelStyle}>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email, or role"
              style={filterControlStyle}
            />
          </label>
          <label style={filterLabelStyle}>
            Role
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              style={filterControlStyle}
            >
              <option value="">All roles</option>
              <option value="BUYER">Buyer</option>
              <option value="ADMIN_KK">Admin KK</option>
              <option value="ADMIN_IT">Admin IT</option>
            </select>
          </label>
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setSearch('');
              setRoleFilter('');
            }}
            style={{
              height: 38,
              padding: '0 14px',
              border: '1px solid var(--line)',
              borderRadius: 4,
              background: hasFilters ? 'white' : 'transparent',
              color: hasFilters ? 'var(--black)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: hasFilters ? 'pointer' : 'not-allowed',
            }}
          >
            Clear
          </button>
        </div>
        <p style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
              <th style={tableHeadStyle}>Name</th>
              <th style={tableHeadStyle}>Email</th>
              <th style={tableHeadStyle}>Role</th>
              <th style={tableHeadStyle}>Joined Date</th>
              <th style={{ ...tableHeadStyle, width: 320 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={tableCellStyle}>{user.first_name} {user.last_name}</td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>                  
                    {isEditing ? (
                      <select
                        value={user.role}
                        onChange={(event) => changeRole(user.id, event.target.value)}
                        style={selectStyle}
                      >
                        <option value="BUYER">Buyer</option>
                        <option value="ADMIN_KK">Admin KK</option>
                        <option value="ADMIN_IT">Admin IT</option>
                      </select>
                    ) : (
                      <span>{user.role}</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                  <td style={{ ...tableCellStyle, minWidth: 280 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {deletingUserId === user.id ? (
                        <>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginRight: 8, color: 'var(--black)' }}>Confirm?</span>
                          <button 
                            onClick={async () => {
                                try {
                                  setActionError(null);
                                  await deleteUserAction(user.id);
                                  deleteUser(user.id);
                                  setDeletingUserId(null);
                                  router.refresh();
                                } catch (err) {
                                  setActionError('Failed to delete user.');
                                  setDeletingUserId(null);
                                }
                            }}
                            style={{ ...dangerButtonStyle, minWidth: 60 }}
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => setDeletingUserId(null)}
                            style={{ ...secondaryButtonStyle, minWidth: 60 }}
                          >
                            No
                          </button>
                        </>
                      ) : isEditing ? (
                        <>
                          <button 
                          onClick={async () => {
                            try {
                              setActionError(null);
                              await updateUserRoleAction(user.id, user.role);
                              setEditingUserId(null);
                              router.refresh();
                            } catch (err) {
                              setActionError('Failed to save changes. Please try again.');
                            }
                            
                          }} 
                          style={{ ...secondaryButtonStyle, minWidth: 80}}
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => {
                                setEditingUserId(null);
                                router.refresh();
                            }}
                            style={{ ...secondaryButtonStyle, minWidth: 80 }}
                          >
                            Discard
                          </button>
                          <button 
                          onClick={() => setDeletingUserId(user.id)}
                          style={{ ...dangerButtonStyle, minWidth: 80 }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setEditingUserId(user.id)} style={{ ...secondaryButtonStyle, minWidth: 130 }}>Edit Account</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} style={{ padding: 28, color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{ padding: '32px', background: highlight ? 'var(--orange)' : 'white', borderRadius: 12, border: '1px solid var(--line)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, color: highlight ? 'var(--black)' : 'var(--muted)' }}>{label}</p>
      <p style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{value}</p>
    </div>
  );
}

const tableHeadStyle: React.CSSProperties = { textAlign: 'left', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' };
const tableCellStyle: React.CSSProperties = { padding: '16px', fontSize: 14, fontFamily: 'var(--font-mono)' };
const selectStyle: React.CSSProperties = { padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, background: 'white', color: 'var(--black)' };
const secondaryButtonStyle: React.CSSProperties = { padding: '8px 10px', background: 'white', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer' };
const dangerButtonStyle: React.CSSProperties = { padding: '8px 10px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer' };
const filterLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
};
const filterControlStyle: React.CSSProperties = {
  width: '100%',
  height: 37,
  border: '1px solid var(--line)',
  borderRadius: 4,
  background: 'white',
  color: 'var(--black)',
  fontFamily: 'inherit',
  fontSize: 11,
  letterSpacing: 0,
  textTransform: 'none',
  padding: '0 10px',
  boxSizing: 'border-box',
};
