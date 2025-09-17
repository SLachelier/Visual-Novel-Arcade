'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginPageContent() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL search parameters for messages (like email verification)
  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
      // Clear the URL parameter without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (isRegistering) {
      if (!validateUsername(formData.username)) {
        newErrors.push('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      }
      
      if (!validatePassword(formData.password)) {
        newErrors.push('Password must meet all requirements');
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Passwords do not match');
      }
      
      if (!formData.agreeToTerms) {
        newErrors.push('You must agree to the Terms of Service and Privacy Policy');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Check your email to verify your account. Click the verification link to complete registration.');
        // Clear the form after successful registration
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          username: '',
          agreeToTerms: false
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ fontFamily: 'Federo, sans-serif' }}>
      <div className="grid gap-8 w-full max-w-md px-4">
        <div
          id="back-div"
          className="rounded-[26px]"
          style={{
            background: 'var(--gold-gradient)',
            padding: '4px',
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
              {isRegistering ? 'Create Account' : 'Log in'}
            </h1>

            <form onSubmit={isRegistering ? handleSignUp : handleSignIn} className="space-y-4">
              {/* Email Field */}
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
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Username Field (Registration Only) */}
              {isRegistering && (
                <div>
                  <label htmlFor="username" className="mb-2 text-lg" style={{ color: 'var(--foreground)' }}>Username</label>
                  <input
                    id="username"
                    name="username"
                    className="border p-3 shadow-md placeholder:text-base placeholder:text-gray-400 focus:scale-105 ease-in-out duration-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--foreground)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    type="text"
                    placeholder="Choose a username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {/* Password Field */}
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
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              {/* Confirm Password Field (Registration Only) */}
              {isRegistering && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 text-lg" style={{ color: 'var(--foreground)' }}>Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
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
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {/* Terms Agreement Checkbox (Registration Only) */}
              {isRegistering && (
                <div className="flex items-start space-x-3">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    required
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-white/30"
                    style={{
                      accentColor: '#ffaa2b'
                    }}
                  />
                  <label htmlFor="agreeToTerms" className="text-sm" style={{ color: 'var(--foreground)' }}>
                    I agree to the{" "}
                    <a href="#" className="text-amber-400 hover:text-amber-300 underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-amber-400 hover:text-amber-300 underline">
                      Privacy Policy
                    </a>, and confirm that I am 13 years of age or older.
                  </label>
                </div>
              )}

              {/* Password Requirements (Registration Only) */}
              {isRegistering && (
                <div className="bg-white/5 rounded-lg p-3 text-xs" style={{ color: 'var(--foreground)' }}>
                  <p className="font-semibold mb-2">Password Requirements:</p>
                  <ul className="space-y-1">
                    <li className={formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                      ✓ At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                      ✓ One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                      ✓ One lowercase letter
                    </li>
                    <li className={/\d/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                      ✓ One number
                    </li>
                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                      ✓ One special character
                    </li>
                  </ul>
                </div>
              )}

              {/* Forgot Password Link (Login Only) */}
              {!isRegistering && (
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
              )}

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-400 text-sm">{error}</p>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <button
                className="shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 transition duration-300 ease-in-out font-semibold hover:shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isRegistering ? 'CREATE ACCOUNT' : 'LOG IN')}
              </button>
            </form>

            {/* Toggle Between Login and Registration */}
            <div className="flex flex-col mt-4 items-center justify-center text-sm">
              <h3 style={{ color: 'var(--foreground)' }}>
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setErrors([]);
                    setMessage('');
                    setFormData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      username: '',
                      agreeToTerms: false
                    });
                  }}
                  className="group transition-all duration-100 ease-in-out bg-transparent border-none p-0 cursor-pointer"
                  style={{ color: '#ffaa2b' }}
                >
                  <span
                    className="bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #ffaa2b, #ffaa2b)',
                      backgroundSize: '0% 2px',
                      backgroundPosition: 'left bottom'
                    }}
                  >
                    {isRegistering ? 'Sign In' : 'Sign Up'}
                  </span>
                </button>
              </h3>
            </div>

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

            {/* Success/Error Messages */}
            {message && (
              <div className={`mt-4 p-4 text-center rounded-lg backdrop-blur-sm ${
                (message.includes('Check your email') || message.includes('verified successfully') || message.includes('complete registration')) 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : message.includes('Visual Novel Studio') || message.includes('access')
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`} style={{ 
                border: `1px solid ${
                  (message.includes('Check your email') || message.includes('verified successfully') || message.includes('complete registration'))
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : message.includes('Visual Novel Studio') || message.includes('access')
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'
                }`,
                color: 'var(--foreground)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                {message}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPageContent;