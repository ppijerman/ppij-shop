import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncClerkUser, type SyncClerkUserInput } from "@/lib/users";

function buildSyncInputFromCurrentUser(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): SyncClerkUserInput {
  const primaryEmailAddress = user.primaryEmailAddress?.emailAddress ?? null;

  if (primaryEmailAddress === null) {
    throw new Error(`Unable to sync Clerk user without a primary email address: ${user.id}`);
  }

  if (user.firstName === null) {
    throw new Error(`Unable to sync Clerk user without a first name: ${user.id}`);
  }

  return {
    clerkUserId: user.id,
    email: primaryEmailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function POST(): Promise<Response> {
  try {
    const authState = await auth();

    if (authState.userId === null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    if (user === null) {
      return NextResponse.json({ error: "Authenticated Clerk user could not be loaded." }, { status: 400 });
    }

    const syncedUser = await syncClerkUser(buildSyncInputFromCurrentUser(user));

    return NextResponse.json({ user: syncedUser });
  } catch (error: unknown) {
    console.error("Clerk bootstrap sync failed", {
      error,
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown bootstrap sync error.",
      },
      { status: 400 },
    );
  }
}
