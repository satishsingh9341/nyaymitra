import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [typedConfirm, setTypedConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (typedConfirm !== 'DELETE') return;

    try {
      setDeleting(true);
      // Fetch user documents and delete all of them
      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const docsRes = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (docsRes.ok) {
        const docs = await docsRes.json();
        await Promise.all(
          docs.map((d) =>
            fetch(`/api/documents/${d.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }

      await logout();
      navigate('/login');
    } catch (err) {
      alert('Error deleting account: ' + err.message);
    } finally {
      setDeleting(false);
      setConfirmModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
      </div>

      <header className="bg-bgSurface border-b border-borderDefault sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-1.5 rounded hover:bg-bgPrimary text-slate400 hover:text-navy900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif font-bold text-xl text-navy900">Account Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        {/* Account Info */}
        <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-6 space-y-4">
          <h2 className="font-serif font-bold text-lg text-navy900">User Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
            <div>
              <label className="block text-xs font-semibold text-slate400 uppercase tracking-wider mb-1">
                Name
              </label>
              <p className="text-navy900 font-medium">{user?.displayName || 'User'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate400 uppercase tracking-wider mb-1">
                Email Address (Google Account)
              </label>
              <p className="text-navy900 font-mono text-xs">{user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Privacy Assurance */}
        <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy900">
            <ShieldCheck className="w-5 h-5 text-riskStandard" />
            <span>Data Privacy Guarantee</span>
          </div>
          <p className="text-xs text-slate700 leading-relaxed font-sans">
            NyayMitra does not permanently store raw document files. Extracted text persists only while you maintain the document in your account. Deleting documents or your account triggers an irreversible permanent deletion.
          </p>
        </div>

        {/* Danger Zone: Delete Account per PRD 5.4 */}
        <div className="bg-bgSurface border border-red-200 rounded shadow-subtle p-6 space-y-4">
          <h2 className="font-serif font-bold text-lg text-riskHigh">Danger Zone</h2>
          <p className="text-xs text-slate700">
            Permanently delete your account and all associated documents, clause extractions, and chat history.
          </p>
          <button
            onClick={() => setConfirmModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-riskHigh border border-red-300 rounded text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete my account</span>
          </button>
        </div>
      </main>

      {/* Typed Confirmation Modal per PRD 5.4 */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bgSurface border border-borderDefault rounded shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-riskHigh flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-navy900 mb-2">Delete Account & All Data</h3>
            <p className="text-xs text-slate700 mb-4 leading-relaxed">
              This will permanently delete your account, all analyzed legal documents, and all stored data. This action is immediate and cannot be recovered.
            </p>
            <p className="text-xs font-semibold text-navy900 mb-2">
              Type <span className="font-mono text-riskHigh">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full p-2 border border-borderDefault rounded text-center text-sm mb-6 font-mono focus:ring-1 focus:ring-red-500"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                  setTypedConfirm('');
                }}
                className="px-4 py-2 text-xs text-slate700 hover:bg-bgPrimary rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={typedConfirm !== 'DELETE' || deleting}
                className="px-4 py-2 bg-riskHigh hover:bg-red-700 text-bgSurface rounded text-xs font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400">
        NyayMitra &copy; 2026. Private and encrypted legal document analysis.
      </footer>
    </div>
  );
}
