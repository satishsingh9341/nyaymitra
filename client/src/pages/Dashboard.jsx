import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import UploadModal from '../components/UploadModal';
import {
  Plus,
  LogOut,
  Settings,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  Trash2,
  ExternalLink,
  GitCompare,
  Search,
  Sparkles,
  FileCheck2,
  Shield,
  Filter,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // all | high | attention | standard

  // Delete modal state
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const res = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const res = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== documentToDelete.id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDocumentToDelete(null);
    }
  };

  // One-click load sample agreement for instant demo
  const loadSampleAgreement = async () => {
    try {
      setLoadingSample(true);
      const sampleText = `RESIDENTIAL LEASE AGREEMENT
Landlord: Rajesh Kumar
Tenant: Ankit Sharma
Premises: Flat 402, Lotus Heights, Bengaluru

1. RENT & SECURITY DEPOSIT:
Tenant agrees to pay monthly rent of INR 35,000 on or before the 5th of each calendar month. Tenant shall deposit an advance security deposit of INR 200,000, which shall be strictly non-refundable upon lease end.

2. TERMINATION & LOCK-IN:
There shall be a strict lock-in period of 12 months. If Tenant vacates the premises prior to completion of 12 months, Tenant shall forfeit the entire security deposit and remains liable for the full rent of the remaining lock-in period.

3. MAINTENANCE & REPAIRS:
Tenant shall be solely responsible for all structural, electrical, and plumbing repairs of the premises, regardless of whether damage was caused by normal wear and tear.

4. INDEMNIFICATION & LIABILITY:
Tenant agrees to indemnify and hold harmless the Landlord against all claims, liabilities, damages, and legal costs arising from any accident or event occurring on the premises, without limitation.`;

      const blob = new Blob([sampleText], { type: 'text/plain' });
      const file = new File([blob], 'Residential_Lease_Agreement_Bengaluru.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('document', file);

      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        navigate(`/document/${created.id}`);
      } else {
        alert('Failed to load sample agreement.');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading sample agreement: ' + e.message);
    } finally {
      setLoadingSample(false);
    }
  };

  // Filtered documents calculation
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = (doc.filename || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'all' || (doc.overallRisk || 'standard').toLowerCase() === riskFilter.toLowerCase();
      return matchesSearch && matchesRisk;
    });
  }, [documents, searchQuery, riskFilter]);

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      {/* Skip to Content for Accessibility (PRD 5.5) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-bgSurface focus:rounded focus:shadow-md font-sans text-xs"
      >
        Skip to main content
      </a>

      {/* 5.6 Global Disclaimer Banner */}
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700 font-sans">
        <span className="font-semibold text-navy900">Legal Notice:</span> NyayMitra provides automated document information, not formal legal advice.
      </div>

      {/* Top Bar */}
      <header className="bg-bgSurface border-b border-borderDefault sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-navy900 text-bgSurface flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              N
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-navy900 tracking-tight block leading-tight">
                NyayMitra
              </span>
              <span className="text-[10px] text-slate400 tracking-wider uppercase font-sans block">
                Workspace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-blue-700 text-bgSurface text-xs font-semibold rounded shadow-subtle transition-colors uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            {/* Avatar & User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 rounded hover:bg-bgPrimary transition-colors"
                aria-label="User menu"
              >
                <img
                  src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || 'U'}`}
                  alt={user?.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-borderDefault bg-bgPrimary"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-bgSurface border border-borderDefault rounded shadow-subtle py-1 z-40">
                  <div className="px-4 py-2 border-b border-borderDefault text-xs">
                    <p className="font-semibold text-navy900 truncate">{user?.displayName}</p>
                    <p className="text-slate400 truncate font-mono text-[11px]">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate700 hover:bg-bgPrimary"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings & Privacy</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-riskHigh hover:bg-bgPrimary"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-navy900">Legal Document Repository</h1>
            <p className="text-sm text-slate700 mt-1 font-sans">
              All parsed agreements are kept private to your account. Plain-language summaries, risk tags, and lawyer prep questions.
            </p>
          </div>

          {documents.length > 1 && (
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-4 py-2 border border-borderDefault bg-bgSurface hover:bg-bgPrimary text-xs font-semibold text-navy900 rounded shadow-subtle transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-accent" />
              <span>Compare Two Documents</span>
            </Link>
          )}
        </div>

        {/* Toolbar: Search & Risk Filters (Rendered when documents exist) */}
        {documents.length > 0 && (
          <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-bgPrimary border border-borderDefault rounded font-sans focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Filter:</span>
              </span>

              {['all', 'high', 'attention', 'standard'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(lvl)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors uppercase text-[11px] ${
                    riskFilter === lvl
                      ? 'bg-navy900 text-bgSurface font-semibold'
                      : 'bg-bgPrimary text-slate700 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State: Skeleton cards per PRD 5.4 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-5 animate-pulse space-y-4"
              >
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-20" />
                <div className="h-8 bg-slate-100 rounded w-full pt-2 border-t border-borderDefault" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* Empty State (First-time user) with 1-click sample per PRD 5.4 */
          <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-10 text-center max-w-2xl mx-auto my-6">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-accent">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-navy900 mb-2">
              Ready to analyze your first legal document
            </h2>
            <p className="text-sm text-slate700 max-w-md mx-auto mb-6 font-sans">
              Upload any PDF, DOCX, or TXT contract to unlock NyayMitra’s 4 core analysis capabilities:
            </p>

            <div className="grid grid-cols-2 gap-3 text-left mb-8 max-w-lg mx-auto">
              <div className="p-3 rounded border border-borderDefault bg-bgPrimary">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-navy900 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  <span>1. Simplify</span>
                </div>
                <p className="text-[11px] text-slate700">Plain-language section rewrites.</p>
              </div>

              <div className="p-3 rounded border border-borderDefault bg-bgPrimary">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-navy900 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-riskAttention" />
                  <span>2. Risk-Flag</span>
                </div>
                <p className="text-[11px] text-slate700">Standard / Attention / High Risk tags.</p>
              </div>

              <div className="p-3 rounded border border-borderDefault bg-bgPrimary">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-navy900 mb-1">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>3. Compare</span>
                </div>
                <p className="text-[11px] text-slate700">Structured meaning diffs between docs.</p>
              </div>

              <div className="p-3 rounded border border-borderDefault bg-bgPrimary">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-navy900 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-accent" />
                  <span>4. Ask</span>
                </div>
                <p className="text-[11px] text-slate700">Grounded Q&A strictly from your document.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-blue-700 text-bgSurface font-semibold text-xs rounded shadow-subtle transition-colors uppercase tracking-wider"
              >
                Upload Document
              </button>

              <button
                onClick={loadSampleAgreement}
                disabled={loadingSample}
                className="w-full sm:w-auto px-5 py-2.5 bg-bgPrimary hover:bg-slate-200 border border-borderDefault text-navy900 font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>{loadingSample ? 'Analyzing Sample...' : 'Try With Sample Lease'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Grid of Document Cards (3-col desktop / 1-col mobile) per PRD 5.4 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-5 flex flex-col justify-between hover:border-slate400 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="font-serif font-bold text-navy900 text-base truncate"
                      title={doc.filename}
                    >
                      {doc.filename}
                    </h3>
                    <RiskBadge level={doc.overallRisk} />
                  </div>

                  <p className="text-xs text-slate400 font-sans mb-4">
                    Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>

                  <div className="text-xs text-slate700 space-y-1.5 mb-6 font-sans">
                    <div className="flex items-center justify-between py-1 border-b border-borderDefault/50">
                      <span className="text-slate400">Summarized Sections:</span>
                      <span className="font-semibold text-navy900">{doc.summary?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-borderDefault/50">
                      <span className="text-slate400">Flagged Clauses:</span>
                      <span className="font-semibold text-navy900">{doc.clauses?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate400">Checklist Items:</span>
                      <span className="font-semibold text-navy900">{doc.checklist?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions: Open / Compare / Delete per PRD 5.4 */}
                <div className="pt-4 border-t border-borderDefault flex items-center justify-between text-xs font-sans">
                  <Link
                    to={`/document/${doc.id}`}
                    className="flex items-center gap-1.5 font-semibold text-accent hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Analysis</span>
                  </Link>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/compare`}
                      className="text-slate700 hover:text-navy900 flex items-center gap-1"
                      title="Compare with another document"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare</span>
                    </Link>

                    <button
                      onClick={() => setDocumentToDelete(doc)}
                      className="text-riskHigh hover:text-red-700 flex items-center gap-1"
                      title="Delete document permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Flow Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          fetchDocuments();
        }}
      />

      {/* Delete Confirmation Modal per PRD 5.4 */}
      {documentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy900/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm bg-bgSurface border border-borderDefault rounded shadow-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 text-riskHigh flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 id="delete-dialog-title" className="font-serif font-bold text-lg text-navy900 mb-2">
              Delete Document
            </h3>
            <p className="text-xs text-slate700 mb-6 font-sans">
              This permanently deletes the document and its analysis.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="px-4 py-2 text-xs text-slate700 hover:bg-bgPrimary rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-riskHigh hover:bg-red-700 text-bgSurface rounded text-xs font-semibold"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400 font-sans">
        NyayMitra &copy; 2026. Private and encrypted legal document analysis.
      </footer>
    </div>
  );
}
