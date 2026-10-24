import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    role: 'user' | 'admin';
    isVerified: boolean;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
      isVerified: boolean;
    };
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    accessToken: string;
  }
}