'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/profile');
      } else {
        setError("Login gagal. Silakan periksa kembali email dan password Anda.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 300px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      background: 'var(--cream)',
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
        animation: 'fadeUp 0.6s ease-out',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: 10, 
            color: 'var(--muted)', 
            letterSpacing: '0.22em', 
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            Welcome Back
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 48, 
            color: 'var(--black)', 
            letterSpacing: '0.02em',
            lineHeight: 1,
            margin: 0
          }}>
            LOG IN
          </h1>
        </div>

        {error && (
          <div style={{
            background: 'rgba(243, 146, 0, 0.1)',
            border: '1px solid var(--orange)',
            padding: '14px 18px',
            color: 'var(--black)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            borderRadius: 4,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label htmlFor="email" style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: 10, 
              color: 'var(--muted)', 
              letterSpacing: '0.18em', 
              textTransform: 'uppercase' 
            }}>
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              name="email" 
              placeholder="your@email.com" 
              required
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                padding: '16px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--black)',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--black)';
                e.currentTarget.style.background = 'white';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.background = 'var(--paper)';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: 10, 
                color: 'var(--muted)', 
                letterSpacing: '0.18em', 
                textTransform: 'uppercase' 
              }}>
                Password
              </label>
              <Link href="/auth/forgot-password" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--muted)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s',
              }}>
                Forgot?
              </Link>
            </div>
            <input 
              type="password" 
              id="password"
              name="password" 
              placeholder="••••••" 
              required
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                padding: '16px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--black)',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--black)';
                e.currentTarget.style.background = 'white';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.background = 'var(--paper)';
              }}
            />
          </div>

          <LoginButton loading={loading} />
        </form>
        
        <div style={{ 
          textAlign: 'center',
          borderTop: '1px solid var(--line)',
          paddingTop: 32,
        }}>
          <span style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 13, 
            color: 'var(--muted)' 
          }}>
            Don't have an account?{' '}
          </span>
          <Link href="/auth/register" style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 13, 
            fontWeight: 600,
            color: 'var(--black)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--black)',
            transition: 'opacity 0.2s',
          }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginButton({ loading }: { loading: boolean }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <button 
      type="submit" 
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        background: loading ? 'var(--muted)' : (hovered ? 'var(--orange)' : 'var(--black)'), 
        color: hovered && !loading ? 'var(--black)' : 'var(--cream)', 
        border: 'none', 
        padding: '18px', 
        fontFamily: 'var(--font-mono)', 
        fontSize: 12, 
        letterSpacing: '0.22em', 
        textTransform: 'uppercase', 
        cursor: loading ? 'not-allowed' : 'pointer', 
        borderRadius: 999, 
        transition: 'all 0.2s',
        marginTop: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
      }}
    >
      {loading ? 'Processing...' : (
        <>
          Login
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
          </svg>
        </>
      )}
    </button>
  );
}
