'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        router.push('/auth/login?registered=true');
      } else {
        const data = await response.json();
        setError(data.message || "Registrasi gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi nanti.");
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
            Join the Community
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 48, 
            color: 'var(--black)', 
            letterSpacing: '0.02em',
            lineHeight: 1,
            margin: 0
          }}>
            REGISTER
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <InputField 
            label="Full Name" 
            name="name" 
            type="text" 
            placeholder="John Doe" 
          />
          <InputField 
            label="Email Address" 
            name="email" 
            type="email" 
            placeholder="your@email.com" 
          />
          <InputField 
            label="Password" 
            name="password" 
            type="password" 
            placeholder="••••••" 
          />
          <InputField 
            label="Confirm Password" 
            name="confirmPassword" 
            type="password" 
            placeholder="••••••" 
          />

          <RegisterButton loading={loading} />
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
            Already have an account?{' '}
          </span>
          <Link href="/auth/login" style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 13, 
            fontWeight: 600,
            color: 'var(--black)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--black)',
            transition: 'opacity 0.2s',
          }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type, placeholder }: { label: string, name: string, type: string, placeholder: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label htmlFor={name} style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: 10, 
        color: 'var(--muted)', 
        letterSpacing: '0.18em', 
        textTransform: 'uppercase' 
      }}>
        {label}
      </label>
      <input 
        type={type} 
        id={name}
        name={name} 
        placeholder={placeholder} 
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
  );
}

function RegisterButton({ loading }: { loading: boolean }) {
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
      {loading ? 'Creating Account...' : (
        <>
          Create Account
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
          </svg>
        </>
      )}
    </button>
  );
}
