import React from 'react';
import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    // Redirect authenticated users to the home page
    redirect('/');
  }

  const signIn = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(`/login?message=${error.message}`);
    }

    return redirect('/');
  };

  const signUp = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return redirect(`/login?message=${error.message}`);
    }

    return redirect('/login?message=Check email to confirm your account');
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)', fontFamily: 'Federo, sans-serif' }}>
      <div className="grid gap-8 w-full max-w-md px-4">
        <div
          id="back-div"
          className="rounded-[26px]"
          style={{
            background: 'var(--gold-gradient)',
            padding: '4px', // This creates the gold border thickness
          }}
        >
          {/* Dark purple gradient background layer */}
          <div
            className="rounded-[22px] relative"
            style={{
              background: 'linear-gradient(135deg, #2d1b69 0%, #1a0f3a 50%, #0f0624 100%)',
            }}
          >
            {/* Frosted glass overlay */}
            <div
              className="rounded-[22px] shadow-lg xl:p-8 2xl:p-8 lg:p-8 md:p-8 sm:p-6 p-6 backdrop-blur-xl backdrop-saturate-150"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)'
              }}
            >
            <h1 className="pt-8 pb-6 font-bold text-5xl text-center cursor-default text-white">
              Log in
            </h1>

            <form action={signIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 text-lg" style={{ color: 'var(--foreground)' }}>Email</label>
                <input
                  id="email"
                  name="email"
                  className="border p-3 shadow-md placeholder:text-base placeholder:text-gray-400 focus:scale-105 ease-in-out duration-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--foreground)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 text-lg" style={{ color: 'var(--foreground)' }}>Password</label>
                <input
                  id="password"
                  name="password"
                  className="border p-3 shadow-md placeholder:text-base placeholder:text-gray-400 focus:scale-105 ease-in-out duration-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--foreground)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <a
                  className="group transition-all duration-100 ease-in-out"
                  style={{ color: '#ffaa2b' }}
                  href="#"
                >
                  <span
                    className="bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out text-sm"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #ffaa2b, #ffaa2b)',
                      backgroundSize: '0% 2px',
                      backgroundPosition: 'left bottom'
                    }}
                  >
                    Forget your password?
                  </span>
                </a>
              </div>

              <button
                className="shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 transition duration-300 ease-in-out font-semibold hover:shadow-xl backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                }}
                type="submit"
              >
                LOG IN
              </button>
            </form>

            <div className="flex flex-col mt-4 items-center justify-center text-sm">
              <h3 style={{ color: 'var(--foreground)' }}>
                Don't have an account?{" "}
                <a className="group transition-all duration-100 ease-in-out" style={{ color: '#ffaa2b' }} href="#">
                  <span
                    className="bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #ffaa2b, #ffaa2b)',
                      backgroundSize: '0% 2px',
                      backgroundPosition: 'left bottom'
                    }}
                  >
                    Sign Up
                  </span>
                </a>
              </h3>
            </div>

            {/* Sign Up Form */}
            <form action={signUp} className="mt-2">
              <button
                className="shadow-lg p-2 text-white rounded-lg w-full hover:scale-105 transition duration-300 ease-in-out font-semibold hover:shadow-xl backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                }}
                type="submit"
              >
                CREATE ACCOUNT
              </button>
            </form>

            {/* Third Party Authentication Placeholder */}
            <div id="third-party-auth" className="flex items-center justify-center mt-5 flex-wrap">
              <p className="text-sm" style={{ color: '#f3d392' }}>
                Social login coming soon
              </p>
            </div>

            <div className="flex text-center flex-col mt-4 items-center text-sm" style={{ color: '#f3d392' }}>
              <p className="cursor-default">
                By signing in, you agree to our{" "}
                <a className="group transition-all duration-100 ease-in-out" style={{ color: '#ffaa2b' }} href="#">
                  <span 
                    className="cursor-pointer bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #ffaa2b, #ffaa2b)',
                      backgroundSize: '0% 2px',
                      backgroundPosition: 'left bottom'
                    }}
                  >
                    Terms
                  </span>
                </a>{" "}
                and{" "}
                <a className="group transition-all duration-100 ease-in-out" style={{ color: '#ffaa2b' }} href="#">
                  <span 
                    className="cursor-pointer bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #ffaa2b, #ffaa2b)',
                      backgroundSize: '0% 2px',
                      backgroundPosition: 'left bottom'
                    }}
                  >
                    Privacy Policy
                  </span>
                </a>
              </p>
            </div>

            {/* Error/Success Messages */}
            {params?.message && (
              <div className="mt-4 p-4 text-center rounded-lg backdrop-blur-sm" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--foreground)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                {params.message}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
