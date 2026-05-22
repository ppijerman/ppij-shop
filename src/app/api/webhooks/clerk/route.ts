import type { UserJSON } from "@clerk/backend";
import { verifyWebhook, type WebhookEvent } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { syncClerkUser, type SyncClerkUserInput } from "@/lib/users";

function getPrimaryEmailAddress(user: UserJSON): string | null {
  if (user.primary_email_address_id === null) {
    return null;
  }

  const primaryEmailAddress = user.email_addresses.find((emailAddress) => {
    return emailAddress.id === user.primary_email_address_id;
  });

  return primaryEmailAddress?.email_address ?? null;
}

function buildSyncInputFromWebhookEvent(event: WebhookEvent): SyncClerkUserInput {
  if (event.data.object !== "user") {
    throw new Error(`Unexpected Clerk webhook payload object for event: ${event.type}`);
  }

  const user = event.data as UserJSON;
  const primaryEmailAddress = getPrimaryEmailAddress(user);
  const firstName = user.first_name;

  if (primaryEmailAddress === null) {
    throw new Error(`Unable to sync Clerk webhook user without a primary email address: ${user.id}`);
  }

  if (firstName === null) {
    throw new Error(`Unable to sync Clerk webhook user without a first name: ${user.id}`);
  }

  return {
    clerkUserId: user.id,
    email: primaryEmailAddress,
    firstName,
    lastName: user.last_name,
  };
}

export async function POST(request: NextRequest): Promise<Response> {
  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request);
  } catch (error: unknown) {
    console.error("Clerk webhook verification failed", {
      error,
    });

    return NextResponse.json({ error: "Invalid Clerk webhook signature." }, { status: 400 });
  }

  const eventType = event.type;

  if (eventType !== "user.created" && eventType !== "user.updated") {
    return NextResponse.json({ handled: false, eventType });
  }

  try {
    const syncedUser = await syncClerkUser(buildSyncInputFromWebhookEvent(event));

    return NextResponse.json({
      handled: true,
      eventType,
      userId: syncedUser.id,
    });
  } catch (error: unknown) {
    const user = event.data;
    const primaryEmailAddress = user.object === "user" ? getPrimaryEmailAddress(user as UserJSON) : null;

    console.error("Clerk webhook sync failed", {
      error,
      eventType,
      clerkUserId: user.id,
      email: primaryEmailAddress,
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown Clerk webhook sync error.",
      },
      { status: 400 },
    );
  }
}
