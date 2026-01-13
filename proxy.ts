// Proxy is a runtime boundary adapter.
// = Protected routes will not start rendering until autheication is verified.

// - Why re-export the `auth` function from `auth.ts`?
// Extract the only safe, minimal piece of auth system and expose in a form that works
// in middleware, and does not drag the entire auth engine into every route bundle. 

import { auth } from '@/auth';
 
export default auth;
 
export const config = {
  // Exclude API routes, static files, image optimizations, and .png files
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};