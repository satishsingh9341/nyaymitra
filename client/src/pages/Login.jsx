import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError('Unable to complete Google sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      {/* Top Banner Notice */}
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
      </div>

      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-navy900 text-bgSurface flex items-center justify-center font-serif font-bold text-lg">
            N
          </div>
          <span className="font-serif font-bold text-2xl text-navy900 tracking-tight">NyayMitra</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-bgSurface border border-borderDefault rounded shadow-subtle p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-bgPrimary border border-borderDefault rounded-full flex items-center justify-center mx-auto mb-4 text-navy900">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-navy900 mb-2">
              Sign in to NyayMitra
            </h1>
            <p className="text-sm text-slate700">
              Understand your legal documents before you sign.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-riskHigh text-xs rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-navy900 hover:bg-slate700 text-bgSurface font-medium rounded transition-colors text-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {/* Reassurance line under the button as strictly required by PRD 5.4 */}
            <p className="text-center text-xs text-slate400 flex items-center justify-center gap-1.5 pt-1">
              <Lock className="w-3 h-3 text-slate400" />
              <span>Your documents are private to your account.</span>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-borderDefault text-center">
            <p className="text-xs text-slate400">
              By continuing, you acknowledge that NyayMitra provides informational analysis and is not a substitute for qualified legal advice.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400">
        NyayMitra &copy; 2026. Private and encrypted legal document analysis.
      </footer>
    </div>
  );
}
