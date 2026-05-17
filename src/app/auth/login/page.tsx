'use client';

import { useAuth, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthError, AuthInput, AuthShell, AuthSubmitButton } from "@/components/auth/AuthUi";
import { getClerkErrorMessage } from "@/lib/clerkErrors";

function getRequiredStringValue(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing form field: ${fieldName}`);
  }

  return value.trim();
}

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { fetchStatus, signIn } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [authLoaded, isSignedIn, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (signIn === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = getRequiredStringValue(formData, "email");
      const password = getRequiredStringValue(formData, "password");
      const createResult = await signIn.create({
        identifier: email,
        password,
      });

      if (createResult.error !== null) {
        throw createResult.error;
      }

      if (signIn.status !== "complete") {
        throw new Error("Login could not be completed.");
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
      eyebrow="Welcome Back"
      title="LOG IN"
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
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href="/auth/register"
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
            Register here
          </Link>
        </div>
      }
    >
      <AuthError message={error} />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--muted)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderBottom: "1px solid transparent",
                transition: "border-color 0.2s",
              }}
            >
              Forgot?
            </Link>
          </div>
          <AuthInput
            label=""
            name="password"
            type="password"
            placeholder="••••••"
            autoComplete="current-password"
            allowVisibilityToggle
          />
        </div>
        <AuthSubmitButton
          loading={loading || fetchStatus === "fetching"}
          loadingLabel="Processing..."
          idleLabel="Login"
        />
      </form>
    </AuthShell>
  );
}
