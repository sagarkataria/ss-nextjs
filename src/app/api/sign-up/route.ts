import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { email, username, password } = await request.json();

    const existingUserVerifyByUsername = await UserModel.findOne({
      username,
      isVarified: true,
    });

    if (existingUserVerifyByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username already exists',
        },
        {
          status: 400,
        },
      );
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.random().toString(36).substring(7);
    if (existingUserByEmail) {
      if (existingUserByEmail.isVarified) {
        return Response.json(
          {
            success: false,
            message: 'Email already exists',
          },
          {
            status: 400,
          },
        );
      }else{
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.varifyCode = verifyCode;
        existingUserByEmail.varifyCodeExpire = new Date();
        existingUserByEmail.varifyCodeExpire.setHours(existingUserByEmail.varifyCodeExpire.getHours() + 1);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        varifyCode: verifyCode,
        varifyCodeExpire: expiryDate,
        isVarified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
    }
    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        },
      );
    }
    return Response.json(
      {
        success: true,
        message: 'User created successfully',
      },
      {
        status: 200,
      },
    );
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
