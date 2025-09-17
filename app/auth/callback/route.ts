import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  if (token_hash && type) {
    const supabase = await createClient();
    
    // Handle email verification
    if (type === 'email') {
      const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash,
      });

      if (!error) {
        // Email verified successfully - redirect to login page with success message
        return NextResponse.redirect(
          new URL('/login?message=Email verified successfully! You can now log in with your credentials.', request.url)
        );
      } else {
        console.error('Email verification error:', error);
        return NextResponse.redirect(
          new URL('/login?message=Email verification failed. Please try registering again.', request.url)
        );
      }
    }

    // Handle other verification types (password reset, etc.)
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'recovery' | 'invite' | 'magiclink',
      token_hash,
    });

    if (!error) {
      // For non-email verifications, redirect to the specified next URL or dashboard
      return NextResponse.redirect(new URL(next || '/dashboard', request.url));
    }
  }

  // Handle case where link is invalid or expired
  return NextResponse.redirect(
    new URL('/login?message=Invalid or expired confirmation link. Please try again.', request.url)
  );
}