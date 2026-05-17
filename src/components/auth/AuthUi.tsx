'use client';

import { ReactNode, useState } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

interface AuthInputProps {
  label?: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  allowVisibilityToggle?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AuthSubmitButtonProps {
  loading: boolean;
  loadingLabel: string;
  idleLabel: string;
  disabled?: boolean;
}

export function AuthShell({ eyebrow, title, children, footer }: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 300px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        background: "var(--cream)",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 40,
          animation: "fadeUp 0.6s ease-out",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              color: "var(--black)",
              letterSpacing: "0.02em",
              lineHeight: 1,
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (message === null) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(243, 146, 0, 0.1)",
        border: "1px solid var(--orange)",
        padding: "14px 18px",
        color: "var(--black)",
        fontSize: 13,
        fontFamily: "var(--font-body)",
        borderRadius: 4,
      }}
    >
      {message}
    </div>
  );
}

export function AuthNotice({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(14, 14, 14, 0.04)",
        border: "1px solid var(--line)",
        padding: "14px 18px",
        color: "var(--ink)",
        fontSize: 13,
        fontFamily: "var(--font-body)",
        borderRadius: 4,
        lineHeight: 1.6,
      }}
    >
      {message}
    </div>
  );
}

export function AuthInput({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  allowVisibilityToggle = false,
  value,
  onChange,
}: AuthInputProps) {
  const [showValue, setShowValue] = useState(false);
  const inputType = allowVisibilityToggle && type === "password" && showValue ? "text" : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label !== undefined && label.length > 0 && (
        <label
          htmlFor={name}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          id={name}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            background: "var(--paper)",
            border: "1px solid var(--line)",
            padding: allowVisibilityToggle ? "16px 74px 16px 16px" : "16px",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--black)",
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(event) => {
            event.currentTarget.style.borderColor = "var(--black)";
            event.currentTarget.style.background = "white";
          }}
          onBlur={(event) => {
            event.currentTarget.style.borderColor = "var(--line)";
            event.currentTarget.style.background = "var(--paper)";
          }}
        />
        {allowVisibilityToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowValue((currentValue) => !currentValue)}
            aria-label={showValue ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              top: "50%",
              right: 12,
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {showValue ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthSubmitButton({ loading, loadingLabel, idleLabel, disabled = false }: AuthSubmitButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = loading || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDisabled ? "var(--muted)" : hovered ? "var(--orange)" : "var(--black)",
        color: hovered && !isDisabled ? "var(--black)" : "var(--cream)",
        border: "none",
        padding: "18px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        cursor: isDisabled ? "not-allowed" : "pointer",
        borderRadius: 999,
        transition: "all 0.2s",
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      {loading ? (
        loadingLabel
      ) : (
        <>
          {idleLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </>
      )}
    </button>
  );
}
