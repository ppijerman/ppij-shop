interface ClerkErrorItem {
  longMessage?: string;
  message?: string;
}

interface ClerkLikeError {
  errors?: ClerkErrorItem[];
  message?: string;
}

function isClerkLikeError(error: unknown): error is ClerkLikeError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "errors" in error || "message" in error;
}

export function getClerkErrorMessage(error: unknown): string {
  if (isClerkLikeError(error) && Array.isArray(error.errors) && error.errors.length > 0) {
    const [firstError] = error.errors;
    if (typeof firstError?.longMessage === "string" && firstError.longMessage.length > 0) {
      return firstError.longMessage;
    }

    if (typeof firstError?.message === "string" && firstError.message.length > 0) {
      return firstError.message;
    }
  }

  if (isClerkLikeError(error) && typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba lagi nanti.";
}
