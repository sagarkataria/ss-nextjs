import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any, req): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found');
          }
          if (!user.isVarified) {
            throw new Error('User not verified');
          }
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!isValidPassword) {
            throw new Error('Invalid password');
          }
          return { email: user.email, username: user.username, id: user._id };
        } catch (error: any) {
          throw new Error('Error in authorize', error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVarified = user.isVarified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVarified = token.isVarified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.JWT_SECRET,
};
