import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisclaimerNotice from '../components/DisclaimerNotice';
import { ArrowLeft, GitCompare, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Payment Terms', 'Termination', 'Liability', 'Other'];

export default function CompareResults() {
  const { idA, idB } = useParams();
  const { user } = useAuth();

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDiff() {
      try {
        setLoading(true);
        setError(null);
        const token = user?.token || 'mock-firebase-token-demo-user-12345';
        const res = await fetch('/api/documents/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ docIdA: idA, docIdB: idB }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to compare documents');
        }

        const data = await res.json();
        setComparison(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error comparing documents');
      } finally {
        setLoading(false);
      }
    }

    fetchDiff();
  }, [idA, idB, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
        <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
          <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-sm text-slate700 font-sans">Generating meaning-based comparison with Gemini AI...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="min-h-screen bg-bgPrimary p-8">
        <div className="max-w-md mx-auto bg-bgSurface border border-borderDefault rounded p-6 text-center">
          <AlertCircle className="w-10 h-10 text-riskHigh mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold text-navy900 mb-2">Comparison Failed</h2>
          <p className="text-sm text-slate700 mb-6">{error || 'Unable to load comparison'}</p>
          <Link to="/compare" className="px-4 py-2 bg-accent text-bgSurface rounded text-sm font-medium">
            Back to Compare Picker
          </Link>
        </div>
      </div>
    );
  }

  const { documentA, documentB, diff = [] } = comparison;

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
      </div>

      <header className="bg-bgSurface border-b border-borderDefault sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/compare" className="p-1.5 rounded hover:bg-bgPrimary text-slate400 hover:text-navy900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-lg text-navy900 flex items-center gap-2">
                <span>{documentA.filename}</span>
                <span className="text-slate400 text-xs">vs</span>
                <span>{documentB.filename}</span>
              </h1>
              <p className="text-xs text-slate400">Meaning diff analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        <div className="flex items-center justify-between border-b border-borderDefault pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-navy900">Substantive Differences</h2>
            <p className="text-xs text-slate700 mt-1">
              Meaning-based changes grouped by core legal categories.
            </p>
          </div>
          <DisclaimerNotice />
        </div>

        {/* Grouped by fixed categories per PRD 5.4 */}
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryDiffs = diff.filter(
              (d) => (d.category || '').toLowerCase() === category.toLowerCase()
            );

            return (
              <div
                key={category}
                className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-6"
              >
                <div className="flex items-center justify-between mb-4 border-b border-borderDefault pb-2">
                  <h3 className="font-serif font-bold text-lg text-navy900">{category}</h3>
                  <span className="text-xs text-slate400">
                    {categoryDiffs.length} {categoryDiffs.length === 1 ? 'difference' : 'differences'}
                  </span>
                </div>

                {categoryDiffs.length === 0 ? (
                  <p className="text-xs text-slate400 italic">
                    No meaningful differences found in this category.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryDiffs.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-bgPrimary border border-borderDefault rounded space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-200 text-slate-800">
                            {item.diffType || 'Modified'}
                          </span>
                          {item.favors && (
                            <span className="text-xs text-slate700 font-medium">
                              • Favors: <strong className="text-navy900">{item.favors}</strong>
                            </span>
                          )}
                        </div>

                        <p className="text-navy900 font-sans leading-relaxed">
                          {item.description}
                        </p>

                        <DisclaimerNotice className="pt-1 block" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400">
        NyayMitra &copy; 2026. Non-legal advice informational platform.
      </footer>
    </div>
  );
}
