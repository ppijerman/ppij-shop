"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function ClerkUserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || user === null) {
      return;
    }

    if (lastSyncedUserIdRef.current === user.id) {
      return;
    }

    if (syncInFlightRef.current) {
      return;
    }

    syncInFlightRef.current = true;

    void fetch("/api/auth/sync", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          const responseBody = await response.text();

          throw new Error(`Bootstrap user sync failed with status ${response.status}: ${responseBody}`);
        }

        lastSyncedUserIdRef.current = user.id;
      })
      .catch((error: unknown) => {
        console.error("Client-triggered Clerk user sync failed", {
          error: error instanceof Error ? error.message : String(error),
          clerkUserId: user.id,
        });
      })
      .finally(() => {
        syncInFlightRef.current = false;
      });
  }, [isLoaded, isSignedIn, user]);

  return null;
}
