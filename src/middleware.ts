import { clerkMiddleware, createRouteMatcher, createClerkClient } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (userId) {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role;

    if (isAdminRoute(req)) {
      if (role !== 'ADMIN_IT' && role !== 'ADMIN_KK') {
        return Response.redirect(new URL('/', req.url));
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
