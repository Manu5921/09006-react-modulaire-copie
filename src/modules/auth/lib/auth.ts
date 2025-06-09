// modules/auth/lib/auth.ts

// This file will contain the NextAuth.js configuration options.
// For more information on how to configure NextAuth.js, please refer to:
// https://next-auth.js.org/configuration/options

// Example structure (you will need to adapt this based on your chosen providers and adapter):
/*
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
// import { PrismaAdapter } from '@auth/prisma-adapter'; // If using Prisma
// import prisma from './prisma'; // Your Prisma client instance

export const authConfig: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Example for Prisma adapter
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
    // Add more providers here
  ],
  // session: {
  //   strategy: 'jwt', // or 'database'
  // },
  // pages: {
  //   signIn: '/auth/login', // Custom login page
  //   // signOut: '/auth/logout',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  //   // verifyRequest: '/auth/verify-request', // (e.g. check your email)
  //   // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  // },
  // callbacks: {
  //   async jwt({ token, user }) {
  //     // Persist the OAuth access_token to the token right after signin
  //     if (user) {
  //       token.accessToken = user.access_token;
  //     }
  //     return token;
  //   },
  //   async session({ session, token, user }) {
  //     // Send properties to the client, like an access_token from a provider.
  //     session.accessToken = token.accessToken;
  //     return session;
  //   },
  // },
  // secret: process.env.NEXTAUTH_SECRET, // Required for production
  // debug: process.env.NODE_ENV === 'development',
};
*/

console.log('Auth config placeholder loaded. Please configure your NextAuth.js options in modules/auth/lib/auth.ts');

export {}; // Ensure this is treated as a module if no actual exports are present yet
