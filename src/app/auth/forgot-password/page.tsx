'use client';

import { useAuth, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthError, AuthInput, AuthNotice, AuthShell, AuthSubmitButton } from "@/components/auth/AuthUi";
import { getClerkErrorMessage } from "@/lib/clerkErrors";

type ResetStep = "request" | "reset";

function getRequiredStringValue(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing form field: ${fieldName}`);
  }

  return value.trim();
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { fetchStatus, signIn } = useSignIn();
  const [step, setStep] = useState<ResetStep>("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [authLoaded, isSignedIn, router]);

  async function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (signIn === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const nextEmail = getRequiredStringValue(formData, "email");

      const createResult = await signIn.create({ identifier: nextEmail });
      if (createResult.error !== null) {
        throw createResult.error;
      }

      const sendCodeResult = await signIn.resetPasswordEmailCode.sendCode();
      if (sendCodeResult.error !== null) {
        throw sendCodeResult.error;
      }

      setEmail(nextEmail);
      setStep("reset");
    } catch (caughtError: unknown) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (signIn === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const code = getRequiredStringValue(formData, "code");
      const password = getRequiredStringValue(formData, "password");
      const confirmPassword = getRequiredStringValue(formData, "confirmPassword");

      if (password !== confirmPassword) {
        throw new Error("Konfirmasi password tidak cocok.");
      }

      const verifyResult = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyResult.error !== null) {
        throw verifyResult.error;
      }

      const submitPasswordResult = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (submitPasswordResult.error !== null) {
        throw submitPasswordResult.error;
      }

      if (signIn.status !== "complete") {
        throw new Error("Reset password belum selesai. Coba lagi.");
      }

      const finalizeResult = await signIn.finalize();
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
      eyebrow={step === "request" ? "Recover Access" : "Check Your Inbox"}
      title={step === "request" ? "RESET PASSWORD" : "SET NEW PASSWORD"}
      footer={
        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: 32,
          }}
        >
          <Link
            href="/auth/login"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--black)",
              textDecoration: "none",
              borderBottom: "1px solid var(--black)",
            }}
          >
            Back to login
          </Link>
        </div>
      }
    >
      <AuthError message={error} />
      {step === "request" ? (
        <>
          <AuthNotice message="Masukkan email akun Anda untuk menerima kode reset password." />
          <form onSubmit={handleRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AuthInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
            />
            <AuthSubmitButton
              loading={loading || fetchStatus === "fetching"}
              loadingLabel="Sending..."
              idleLabel="Send Reset Code"
            />
          </form>
        </>
      ) : (
        <>
          <AuthNotice message={`Kami mengirim kode reset ke ${email}. Masukkan kode itu dan password baru Anda.`} />
          <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AuthInput
              label="Verification Code"
              name="code"
              type="text"
              placeholder="123456"
              autoComplete="one-time-code"
            />
            <AuthInput
              label="New Password"
              name="password"
              type="password"
              placeholder="••••••"
              autoComplete="new-password"
            />
            <AuthInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              autoComplete="new-password"
            />
            <AuthSubmitButton
              loading={loading || fetchStatus === "fetching"}
              loadingLabel="Updating..."
              idleLabel="Update Password"
            />
          </form>
        </>
      )}
    </AuthShell>
  );
}
