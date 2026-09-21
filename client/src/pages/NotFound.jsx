import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();
  const returnPath = user ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-bgSurface border border-borderDefault rounded shadow-subtle p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-riskAttention">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-navy900 mb-2">404</h1>
          <h2 className="text-xl font-serif font-semibold text-navy900 mb-3">Page not found</h2>
          <p className="text-sm text-slate700 mb-6">
            The legal document or route you were looking for does not exist or has been moved.
          </p>
          <Link
            to={returnPath}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-blue-700 text-bgSurface text-sm font-medium rounded shadow-subtle transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {user ? 'Dashboard' : 'Home'}</span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400">
        NyayMitra &copy; 2026
      </footer>
    </div>
  );
}
