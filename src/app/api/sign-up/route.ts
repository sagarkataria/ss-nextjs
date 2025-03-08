import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { email, username, password } = await request.json();
    
  } catch (error) {
    console.log('Error signing up', error);
    return Response.json(
      {
        success: false,
        message: 'Error signing up',
      },
      {
        status: 500,
      },
    );
  }
}
