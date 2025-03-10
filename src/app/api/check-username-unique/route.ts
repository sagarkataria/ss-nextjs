import dbConnect from '@/lib/dbConnect';
import { z } from 'zod';
import UserModel from '@/model/User';
import { usernameValidation } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    // localhost:3000/api/check-uniqueness-username?username=sagarsingh121
    const queryParam = {
      username: searchParams.get('username'),
    };
    // validate with zode

    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log('result: ', result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid username',
        },
        {
          status: 400,
        },
      );
    }

    const { username } = result.data;

    const existingVarifiedUser = await UserModel.findOne({
      username,
      isVarified: true,
    });

    if (existingVarifiedUser) {
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
    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      { status: 400 },
    );
  } catch (error) {
    console.log('Error in GET /api/check-uniqueness-username', error);
    return Response.json(
      {
        success: false,
        message: 'Error in GET /api/check-uniqueness-username',
      },
      {
        status: 500,
      },
    );
  }
}
