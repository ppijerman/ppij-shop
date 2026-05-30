"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClerkUserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
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

        const data = await response.json();
        const role = data.user?.role;
        const isAdminPage = pathname.startsWith('/admin');
        const isAuthPage = pathname.startsWith('/auth');

        if (role === 'ADMIN_IT' && !isAdminPage && !isAuthPage) {
          router.push('/admin/it');
        } else if (role === 'ADMIN_KK' && !isAdminPage && !isAuthPage) {
          router.push('/admin/kk');
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
  }, [isLoaded, isSignedIn, pathname, user, router]);

  return null;
}
