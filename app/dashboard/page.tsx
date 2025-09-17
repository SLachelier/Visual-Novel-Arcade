import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8" style={{ fontFamily: 'Federo, sans-serif' }}>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Welcome to Your Dashboard
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6" style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Account Information
          </h2>
          
          <div className="space-y-2 text-left">
            <p style={{ color: 'var(--foreground)' }}>
              <strong>Email:</strong> {user.email}
            </p>
            {user.user_metadata?.username && (
              <p style={{ color: 'var(--foreground)' }}>
                <strong>Username:</strong> {user.user_metadata.username}
              </p>
            )}
            <p style={{ color: 'var(--foreground)' }}>
              <strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}
            </p>
            <p style={{ color: 'var(--foreground)' }}>
              <strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="/vn-maker"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gold-gradient)',
              color: '#000',
              textDecoration: 'none'
            }}
          >
            Start Creating Visual Novels
          </a>
          
          <div className="mt-4">
            <form action="/auth/signout" method="post" className="inline">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}