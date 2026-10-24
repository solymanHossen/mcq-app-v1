import { getServerSession, type NextAuthOptions } from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/validators';
import api from '@/lib/api';

type LoginResponse = {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isVerified: boolean;
  };
  accessToken: string;
};

export const authOptions: NextAuthOptions = {
  pages: authConfig.pages,
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const { data } = await api.post<LoginResponse>('/auth/login', parsed.data);
          // return shape must match User type in next-auth.d.ts
          return {
            id: String(data.user._id),
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            isVerified: data.user.isVerified,
            accessToken: data.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
        session.user.isVerified = token.isVerified as boolean;
      }

      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}