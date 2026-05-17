'use client';

import { useAuth, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthError, AuthInput, AuthNotice, AuthShell, AuthSubmitButton } from "@/components/auth/AuthUi";
import { getClerkErrorMessage } from "@/lib/clerkErrors";

function getRequiredStringValue(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing form field: ${fieldName}`);
  }

  return value.trim();
}

export default function RegisterPage() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { fetchStatus, signUp } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMismatchMessage = "Konfirmasi password tidak cocok.";
  const hasPasswordMismatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
  const visibleError = error === passwordMismatchMessage ? null : error;

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [authLoaded, isSignedIn, router]);

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (signUp === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const firstName = getRequiredStringValue(formData, "firstName");
      const lastName = getRequiredStringValue(formData, "lastName");
      const email = getRequiredStringValue(formData, "email");
      const formPassword = getRequiredStringValue(formData, "password");
      const formConfirmPassword = getRequiredStringValue(formData, "confirmPassword");

      if (formPassword !== formConfirmPassword) {
        throw new Error(passwordMismatchMessage);
      }

      const createResult = await signUp.create({
        emailAddress: email,
        password: formPassword,
        firstName,
        lastName,
      });

      if (createResult.error !== null) {
        throw createResult.error;
      }

      const sendCodeResult = await signUp.verifications.sendEmailCode();
      if (sendCodeResult.error !== null) {
        throw sendCodeResult.error;
      }

      setVerificationEmail(email);
      setPendingVerification(true);
    } catch (caughtError: unknown) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    if (error !== null) {
      setError(null);
    }
  }

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
    if (error !== null) {
      setError(null);
    }
  }

  async function handleVerificationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (signUp === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const code = getRequiredStringValue(formData, "code");
      const verifyResult = await signUp.verifications.verifyEmailCode({ code });

      if (verifyResult.error !== null) {
        throw verifyResult.error;
      }

      if (signUp.status !== "complete") {
        throw new Error("Verifikasi email belum selesai. Coba lagi.");
      }

      const finalizeResult = await signUp.finalize();
      if (finalizeResult.error !== null) {
        throw finalizeResult.error;
      }

      router.replace("/");
    } catch (caughtError: unknown) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  if (!authLoaded || isSignedIn) {
    return null;
  }

  return (
    <AuthShell
      eyebrow={pendingVerification ? "Almost There" : "Join the Community"}
      title={pendingVerification ? "VERIFY EMAIL" : "REGISTER"}
      footer={
        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: 32,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            Already have an account?{" "}
          </span>
          <Link
            href="/auth/login"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--black)",
              textDecoration: "none",
              borderBottom: "1px solid var(--black)",
              transition: "opacity 0.2s",
            }}
          >
            Login here
          </Link>
        </div>
      }
    >
      <AuthError message={visibleError} />
      {pendingVerification ? (
        <>
          <AuthNotice message={`Masukkan kode verifikasi yang dikirim ke ${verificationEmail}.`} />
          <form onSubmit={handleVerificationSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AuthInput
              label="Verification Code"
              name="code"
              type="text"
              placeholder="123456"
              autoComplete="one-time-code"
            />
            <AuthSubmitButton
              loading={loading || fetchStatus === "fetching"}
              loadingLabel="Verifying..."
              idleLabel="Verify Email"
            />
          </form>
        </>
      ) : (
        <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <AuthInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="John"
              autoComplete="given-name"
            />
            <AuthInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>
          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
          />
          <AuthInput
            label="Password"
            name="password"
            type="password"
            placeholder="••••••"
            autoComplete="new-password"
            allowVisibilityToggle
            value={password}
            onChange={handlePasswordChange}
          />
          <AuthInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••"
            autoComplete="new-password"
            allowVisibilityToggle
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {hasPasswordMismatch && (
            <div
              style={{
                marginTop: -12,
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--orange-deep)",
              }}
            >
              {passwordMismatchMessage}
            </div>
          )}
          <div id="clerk-captcha" />
          <AuthSubmitButton
            loading={loading || fetchStatus === "fetching"}
            loadingLabel="Creating Account..."
            idleLabel="Create Account"
            disabled={hasPasswordMismatch}
          />
        </form>
      )}
    </AuthShell>
  );
}
