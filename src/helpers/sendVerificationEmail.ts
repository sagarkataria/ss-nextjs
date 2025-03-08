import { resend } from '@/lib/resend';
import VerificationEmail from './../../emails/VerificationEmail';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Verify your email',
      react: VerificationEmail({username, otp:verifyCode}),
    });
    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  } catch (emailError) {
    console.log('Error sending email error', emailError);
    return {
      success: false,
      message: 'Error sending email',
    };
  }
}
