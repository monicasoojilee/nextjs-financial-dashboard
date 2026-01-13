import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import z from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const authConfig = {
  // Specify URLs to be used to create custom sign in, sign out, and error pages.
  // - Overrides automatically created pages from NextAuth.js
  pages: {
    signIn: '/login',
  },
  // Async functions to control what happens when an action is performed.
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate email and password.
        const parsedCredentials = z.object({ 
          email: z.string().email(), 
          password: z.string().min(6) 
        }).safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user;
        }
        
        console.log('Invalid credentials.')
        return null;
      },
  })],
} satisfies NextAuthConfig;