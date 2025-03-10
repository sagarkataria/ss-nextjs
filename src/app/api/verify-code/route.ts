import dbConnect from '@/lib/dbConnect';
import { z } from 'zod';
import UserModel from '@/model/User';
import { usernameValidation } from '@/schemas/signUpSchema';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {
          status: 404,
        },
      );
    }
    const isCodeValid = user.verifyCode === code;

    const isCodeNotExpired =
      new Date(user.varifyCodeExpire) > user.verifyCodeExpiry;

    if (isCodeValid && isCodeNotExpired) {
      user.isVarified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: 'User verified',
        },
        {
          status: 200,
        },
      );
    }else if(!isCodeNotExpired){
      return Response.json(
        {
          success: false,
          message: 'Verification code has expired please signup again to get new code',
        },
        {
          status: 400,
        },
      );
    }else{
        return Response.json(
            {
            success: false,
            message: 'Invalid Code',
            },
            {
            status: 400,
            },
        );
    }
  } catch (error) {
    console.log('Error in GET /api/ verify-code', error);
    return Response.json(
      {
        success: false,
        message: 'Error in GET /api/ verify-code',
      },
      {
        status: 500,
      },
    );
  }
}
