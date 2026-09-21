import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import DisclaimerNotice from '../components/DisclaimerNotice';
import {
  FileText,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // summary | clauses | checklist | ask

  // Accordion state for clauses
  const [expandedClauses, setExpandedClauses] = useState({});

  // Client-side checklist tracking (PRD 6.1: client-tracked, not re-derived by AI)
  const [checklist, setChecklist] = useState([]);

  // Grounded chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Lawyer questions export
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState(null);
  const [allQuestionsCopied, setAllQuestionsCopied] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const res = await fetch(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load document analysis');
      }

      const data = await res.json();
      setDocument(data);
      setChecklist(data.checklist || []);
      setChatMessages(data.chatHistory || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  const toggleClause = (idx) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleChecklistItem = (idx) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, done: !item.done } : item))
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const query = chatInput.trim();
    setChatInput('');

    // Optimistic user bubble
    const userMsg = { role: 'user', message: query, timestamp: new Date().toISOString() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const res = await fetch(`/api/documents/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        throw new Error('Failed to get answer from AI');
      }

      const data = await res.json();
      setChatMessages(data.chatHistory || [
        ...chatMessages,
        userMsg,
        { role: 'assistant', message: data.answer, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: 'Error communicating with NyayMitra service. Please verify your connection or try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyQuestion = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(idx);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const handleExportAllQuestions = () => {
    if (!document?.lawyerQuestions) return;
    const markdown = `# Questions for Lawyer regarding ${document.filename}\n\n` +
      document.lawyerQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n\n') +
      `\n\n---\n*Exported from NyayMitra — Not legal advice*`;
    navigator.clipboard.writeText(markdown);
    setAllQuestionsCopied(true);
    setTimeout(() => setAllQuestionsCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
        <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
          <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-sm text-slate700 font-sans">Loading document analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-bgPrimary p-8">
        <div className="max-w-md mx-auto bg-bgSurface border border-borderDefault rounded p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-riskAttention mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold text-navy900 mb-2">Error Loading Document</h2>
          <p className="text-sm text-slate700 mb-6">{error || 'Document not found'}</p>
          <Link to="/dashboard" className="px-4 py-2 bg-accent text-bgSurface rounded text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const TABS = ['summary', 'clauses', 'checklist', 'ask'];
  const handleTabKeyDown = (e, currentTab) => {
    const currentIndex = TABS.indexOf(currentTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = TABS[(currentIndex + 1) % TABS.length];
      setActiveTab(nextTab);
      document.getElementById(`tab-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length];
      setActiveTab(prevTab);
      document.getElementById(`tab-${prevTab}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
      {/* 5.6 Global Disclaimer Banner */}
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides information, not legal advice.
      </div>

      {/* Top Header */}
      <header className="bg-bgSurface border-b border-borderDefault sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-1.5 rounded hover:bg-bgPrimary text-slate400 hover:text-navy900 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-serif font-bold text-navy900 truncate max-w-xs md:max-w-md" title={document.filename}>
                  {document.filename}
                </h1>
                <RiskBadge level={document.overallRisk} />
              </div>
              <p className="text-xs text-slate400 font-sans">
                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate700 hover:bg-bgPrimary border border-borderDefault rounded transition-colors"
              title="Re-fetch or refresh analysis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-riskHigh hover:bg-red-50 border border-red-200 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 4 Tabs (8 Cols on Desktop) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Accessible Tabs Header (role="tablist") */}
          <div className="flex border-b border-borderDefault mb-6" role="tablist" aria-label="Document Sections">
            <button
              id="tab-summary"
              role="tab"
              aria-controls="tabpanel-summary"
              aria-selected={activeTab === 'summary'}
              tabIndex={activeTab === 'summary' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'summary')}
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-slate700 hover:text-navy900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Summary</span>
            </button>

            <button
              id="tab-clauses"
              role="tab"
              aria-controls="tabpanel-clauses"
              aria-selected={activeTab === 'clauses'}
              tabIndex={activeTab === 'clauses' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'clauses')}
              onClick={() => setActiveTab('clauses')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'clauses'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-slate700 hover:text-navy900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Clauses & Risks</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {document.clauses?.length || 0}
              </span>
            </button>

            <button
              id="tab-checklist"
              role="tab"
              aria-controls="tabpanel-checklist"
              aria-selected={activeTab === 'checklist'}
              tabIndex={activeTab === 'checklist' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'checklist')}
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'checklist'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-slate700 hover:text-navy900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Checklist</span>
            </button>

            <button
              id="tab-ask"
              role="tab"
              aria-controls="tabpanel-ask"
              aria-selected={activeTab === 'ask'}
              tabIndex={activeTab === 'ask' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 'ask')}
              onClick={() => setActiveTab('ask')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ask'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-slate700 hover:text-navy900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Document</span>
            </button>
          </div>

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div id="tabpanel-summary" role="tabpanel" aria-labelledby="tab-summary" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-navy900">Plain-Language Summary</h2>
                <DisclaimerNotice />
              </div>

              {document.summary?.length > 0 ? (
                document.summary.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-bgSurface border border-borderDefault rounded shadow-subtle space-y-2"
                  >
                    <h3 className="font-serif font-semibold text-navy900 text-base">
                      {sec.heading}
                    </h3>
                    <p className="text-sm text-slate700 leading-relaxed font-sans">
                      {sec.plainText}
                    </p>
                    <DisclaimerNotice className="pt-2" />
                  </div>
                ))
              ) : (
                <div className="p-8 bg-bgSurface border border-borderDefault rounded text-center text-slate400 text-sm">
                  No summary generated for this document.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLAUSES & RISKS (Accordion per PRD 5.4) */}
          {activeTab === 'clauses' && (
            <div id="tabpanel-clauses" role="tabpanel" aria-labelledby="tab-clauses" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-serif font-bold text-navy900">Analyzed Clauses</h2>
                <DisclaimerNotice />
              </div>

              {document.clauses?.length > 0 ? (
                document.clauses.map((clause, idx) => {
                  const isExpanded = !!expandedClauses[idx];
                  return (
                    <div
                      key={idx}
                      className="bg-bgSurface border border-borderDefault rounded shadow-subtle overflow-hidden"
                    >
                      {/* Collapsed Header */}
                      <button
                        onClick={() => toggleClause(idx)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-bgPrimary/50 transition-colors"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-3 flex-wrap flex-1">
                          <RiskBadge level={clause.riskLevel} />
                          <span className="font-serif font-semibold text-navy900 text-sm">
                            {clause.title}
                          </span>
                          <span className="text-xs text-slate700 font-sans">
                            — {clause.reason}
                          </span>
                        </div>
                        <div className="text-slate400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-borderDefault bg-bgPrimary/30 space-y-3 mt-2">
                          <div>
                            <p className="text-xs font-semibold text-slate700 uppercase tracking-wider mb-1">
                              Plain-Language Explanation:
                            </p>
                            <p className="text-sm text-navy900 font-sans leading-relaxed">
                              {clause.plainText}
                            </p>
                          </div>

                          {clause.originalExcerpt && (
                            <div className="p-3 bg-bgSurface border-l-2 border-slate400 rounded text-xs text-slate700 font-mono italic">
                              "{clause.originalExcerpt}"
                            </div>
                          )}

                          <DisclaimerNotice />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 bg-bgSurface border border-borderDefault rounded text-center text-slate400 text-sm">
                  No individual clauses tagged for this document.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHECKLIST (Client-side tracking aid per PRD 5.4) */}
          {activeTab === 'checklist' && (
            <div id="tabpanel-checklist" role="tabpanel" aria-labelledby="tab-checklist" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-serif font-bold text-navy900">Obligations & Deadlines</h2>
                  <p className="text-xs text-slate400">Check off items as a personal tracking aid.</p>
                </div>
                <DisclaimerNotice />
              </div>

              {checklist?.length > 0 ? (
                <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle divide-y divide-borderDefault">
                  {checklist.map((item, idx) => (
                    <label
                      key={idx}
                      className="p-4 flex items-start gap-3 cursor-pointer hover:bg-bgPrimary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!item.done}
                        onChange={() => toggleChecklistItem(idx)}
                        className="mt-1 w-4 h-4 text-accent rounded border-borderDefault focus:ring-accent"
                      />
                      <div className="flex-1">
                        <span
                          className={`text-sm font-sans ${
                            item.done ? 'line-through text-slate400' : 'text-navy900'
                          }`}
                        >
                          {item.item}
                        </span>
                        {item.dueDate && (
                          <span className="block text-xs text-amber-700 font-medium mt-0.5">
                            Due: {item.dueDate}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-bgSurface border border-borderDefault rounded text-center text-slate400 text-sm">
                  No explicit deadlines or obligations found in this document.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASK (Grounded Chat per PRD 5.4) */}
          {activeTab === 'ask' && (
            <div id="tabpanel-ask" role="tabpanel" aria-labelledby="tab-ask" className="flex flex-col h-[560px] bg-bgSurface border border-borderDefault rounded shadow-subtle overflow-hidden">
              <div className="p-4 border-b border-borderDefault flex items-center justify-between bg-bgPrimary/30">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3 className="font-serif font-bold text-sm text-navy900">Grounded Q&A</h3>
                </div>
                <span className="text-xs text-slate400">Answers strictly from this document</span>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate400 text-sm">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate300" />
                    <p className="font-medium text-slate700">Ask any question about this document.</p>
                    <p className="text-xs text-slate400 max-w-xs mx-auto mt-1">
                      NyayMitra answers strictly from the contract text, refusing external speculation.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-lg p-3 rounded text-sm font-sans leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-navy900 text-bgSurface rounded-br-none'
                            : 'bg-bgPrimary border border-borderDefault text-navy900 rounded-bl-none'
                        }`}
                      >
                        {msg.message}
                      </div>

                      {/* Inline disclaimer tag on assistant reply as per PRD 5.4 */}
                      {msg.role === 'assistant' && (
                        <DisclaimerNotice className="mt-1" />
                      )}
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate400 italic">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing document text for answer...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-borderDefault flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about this document only..."
                  className="flex-1 px-3 py-2 border border-borderDefault rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-2 bg-accent hover:bg-blue-700 text-bgSurface rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Persistent Strip "Questions for your lawyer" (4 Cols on Desktop) per PRD 5.4 */}
        <div className="lg:col-span-4">
          <div className="bg-bgSurface border border-borderDefault rounded shadow-subtle p-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between border-b border-borderDefault pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent" />
                <h3 className="font-serif font-bold text-base text-navy900">
                  Questions for Lawyer
                </h3>
              </div>
              <button
                onClick={handleExportAllQuestions}
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                title="Export entire list as markdown"
              >
                {allQuestionsCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{allQuestionsCopied ? 'Copied' : 'Export All'}</span>
              </button>
            </div>

            <p className="text-xs text-slate700 font-sans">
              Key strategic questions to ask legal counsel to prevent unexpected liabilities:
            </p>

            {document.lawyerQuestions?.length > 0 ? (
              <div className="space-y-3">
                {document.lawyerQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-bgPrimary border border-borderDefault rounded text-xs text-navy900 flex items-start justify-between gap-2"
                  >
                    <span className="font-sans leading-relaxed">{q}</span>
                    <button
                      onClick={() => handleCopyQuestion(q, idx)}
                      className="p-1 text-slate400 hover:text-navy900 flex-shrink-0"
                      title="Copy question"
                    >
                      {copiedQuestionIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-riskStandard" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate400 italic">No specific questions generated.</p>
            )}

            <DisclaimerNotice className="pt-2 block" />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal per PRD 5.4 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-bgSurface border border-borderDefault rounded shadow-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 text-riskHigh flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-navy900 mb-2">Delete Document</h3>
            <p className="text-xs text-slate700 mb-6">
              This permanently deletes the document and its analysis. This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs text-slate700 hover:bg-bgPrimary rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-riskHigh hover:bg-red-700 text-bgSurface rounded text-xs font-semibold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-borderDefault bg-bgSurface py-4 text-center text-xs text-slate400">
        NyayMitra &copy; 2026. Private and encrypted legal document analysis.
      </footer>
    </div>
  );
}
