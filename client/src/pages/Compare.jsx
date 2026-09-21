import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GitCompare, ArrowLeft, FileText, AlertCircle } from 'lucide-react';

export default function Compare() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docA, setDocA] = useState('');
  const [docB, setDocB] = useState('');

  useEffect(() => {
    async function loadDocs() {
      try {
        const token = user?.token || 'mock-firebase-token-demo-user-12345';
        const res = await fetch('/api/documents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
          if (data.length >= 2) {
            setDocA(data[0].id);
            setDocB(data[1].id);
          } else if (data.length === 1) {
            setDocA(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [user]);

  const handleCompare = () => {
    if (docA && docB && docA !== docB) {
      navigate(`/compare/${docA}/${docB}`);
    }
  };

  const isCompareReady = docA && docB && docA !== docB;

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
      </div>

      <header className="bg-bgSurface border-b border-borderDefault sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-1.5 rounded hover:bg-bgPrimary text-slate400 hover:text-navy900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif font-bold text-xl text-navy900">Compare Documents</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 py-12 flex-1">
        <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-accent flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-navy900 mb-2">Meaning-Diff Comparison</h2>
          <p className="text-sm text-slate700 mb-8 max-w-lg mx-auto">
            Select two agreements to compare substantive changes across Payment, Termination, and Liability terms.
          </p>

          {documents.length < 2 ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 text-riskAttention font-semibold text-sm mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>At least two documents required</span>
              </div>
              <p className="text-xs text-slate700 mb-4">
                Please upload another legal contract or lease to enable comparison.
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-4 py-2 bg-accent text-bgSurface rounded text-xs font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6 max-w-xl mx-auto text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document A Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate700 uppercase tracking-wider mb-2">
                    First Document (Baseline)
                  </label>
                  <select
                    value={docA}
                    onChange={(e) => setDocA(e.target.value)}
                    className="w-full p-2.5 bg-bgSurface border border-borderDefault rounded text-sm text-navy900 focus:ring-1 focus:ring-accent"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id} disabled={d.id === docB}>
                        {d.filename}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document B Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate700 uppercase tracking-wider mb-2">
                    Second Document (Comparison)
                  </label>
                  <select
                    value={docB}
                    onChange={(e) => setDocB(e.target.value)}
                    className="w-full p-2.5 bg-bgSurface border border-borderDefault rounded text-sm text-navy900 focus:ring-1 focus:ring-accent"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id} disabled={d.id === docA}>
                        {d.filename}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {docA === docB && (
                <p className="text-xs text-riskHigh">
                  Please select two different documents to compare.
                </p>
              )}

              <button
                onClick={handleCompare}
                disabled={!isCompareReady}
                className="w-full py-2.5 bg-accent hover:bg-blue-700 text-bgSurface font-semibold text-sm rounded shadow-subtle transition-colors disabled:opacity-50"
              >
                Run Meaning Diff
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400">
        NyayMitra &copy; 2026
      </footer>
    </div>
  );
}
