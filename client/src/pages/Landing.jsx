import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import DisclaimerNotice from '../components/DisclaimerNotice';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  MessageSquare,
  Lock,
  ArrowRight,
  FileText,
  FileCheck2,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState('tenant');

  const personas = {
    tenant: {
      role: 'Tenant signing a lease',
      need: '"Is this deposit clause normal? What if I break the lease early?"',
      solution: 'NyayMitra detects non-refundable deposit clauses, unreasonable lock-in penalties, and clarifies maintenance liabilities.',
    },
    freelancer: {
      role: 'Freelancer reviewing client contract',
      need: '"What am I liable for? Is this NDA one-sided?"',
      solution: 'NyayMitra flags unlimited liability, intellectual property overreaches, and delayed payment terms.',
    },
    business: {
      role: 'Small business comparing vendor contracts',
      need: '"Which contract has better termination and payment terms?"',
      solution: 'NyayMitra meaning-diffs two agreements line-by-line across payment terms, termination, and liability caps.',
    },
    prelawyer: {
      role: 'Anyone before a lawyer consultation',
      need: '"What should I actually ask, so I don’t waste billable hours?"',
      solution: 'Generates a focused, exportable list of concrete legal questions targeted at identified red flags.',
    },
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Skip to Content for Accessibility (PRD 5.5) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-bgSurface focus:rounded focus:shadow-md font-sans text-xs"
      >
        Skip to main content
      </a>

      {/* Institutional Top Banner Notice (PRD 5.6) */}
      <div className="bg-bgSurface border-b border-borderDefault py-2 px-4 text-center text-xs text-slate700 font-sans">
        <span className="font-semibold text-navy900">Notice:</span> NyayMitra provides automated document information, not legal advice or counsel.
      </div>

      {/* Main Navbar matching ReadyToGo clean theme logic */}
      <header className="bg-bgSurface border-b border-borderDefault sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy900 text-bgSurface flex items-center justify-center font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl text-navy900 tracking-tight block leading-tight">
                Nyay<span className="text-accent">Mitra</span>
              </span>
              <span className="text-[10px] text-slate400 tracking-widest uppercase font-semibold block">
                Legal Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate700">
            <a href="#capabilities" className="hover:text-accent transition-colors">Capabilities</a>
            <a href="#inspector-preview" className="hover:text-accent transition-colors">How It Works</a>
            <a href="#personas" className="hover:text-accent transition-colors">Use Cases</a>
            <a href="#disclaimer" className="hover:text-accent transition-colors">Trust & Privacy</a>
          </nav>

          {/* Nav Actions (Login + Sign Up Pills) */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-slate700 hover:text-navy900 rounded-full border border-borderDefault hover:bg-bgPrimary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-bgSurface bg-accent hover:bg-blue-700 rounded-full shadow-subtle hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Top Banner Ribbon Strip (ReadyToGo style) */}
      <section className="bg-bgPrimary pt-6 pb-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-center">
          <Link
            to="/login"
            className="group inline-flex items-center gap-3 bg-bgSurface border border-blue-200 hover:border-blue-400 rounded-full py-1.5 px-4 shadow-sm hover:shadow transition-all"
            title="Understand legal documents with NyayMitra"
          >
            {/* Trophy / Shield Badge */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-accent flex items-center justify-center">
                <Scale className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-navy900">
                NyayMitra Legal AI
              </span>
            </div>

            <span className="h-4 w-px bg-borderDefault hidden sm:block" />

            {/* Document Types */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate700">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate700">Leases</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate700">Contracts</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate700">NDAs</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate700">ToS</span>
            </div>

            <span className="h-4 w-px bg-borderDefault hidden md:block" />

            {/* Right Tagline + Blue Circle Arrow */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate700 font-serif italic hidden md:inline">
                "Samjho apna document, faisla khud lo."
              </span>
              <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Hero Section */}
      <main id="main-content" className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Col (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-navy900 leading-[1.15] tracking-tight">
                Understand Any Legal Contract &amp; <br />
                <span className="text-accent underline decoration-blue-200 underline-offset-8">
                  Decide With Confidence.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate700 font-sans leading-relaxed max-w-2xl">
                Master complex agreements, identify hidden obligations, and flag one-sided liabilities before signing. NyayMitra turns dense legalese into clear plain language, section by section.
              </p>

              {/* Mandatory In-Hero Disclaimer per PRD 5.4 */}
              <div className="p-3.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 max-w-xl font-sans">
                <AlertCircle className="w-4 h-4 text-riskAttention flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Important Notice:</strong> NyayMitra is an automated informational tool, not a law firm, and does not provide formal legal opinions or legal advice.
                </div>
              </div>

              {/* Hero Actions (Pill Buttons like ReadyToGo) */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="px-7 py-3.5 bg-accent hover:bg-blue-700 text-bgSurface font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                >
                  <span>Start Document Analysis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-bgSurface hover:bg-slate-50 text-navy900 border border-borderDefault font-semibold text-sm rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Try With Sample Lease</span>
                </Link>
              </div>

              {/* 2x2 Stats Chips Grid (ReadyToGo Theme Logic) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-borderDefault">
                {/* Chip 1 */}
                <div className="bg-bgSurface border border-borderDefault rounded-xl p-3.5 shadow-subtle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 text-riskStandard flex items-center justify-center flex-shrink-0 border border-green-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy900">100%</div>
                    <div className="text-[11px] text-slate400 font-medium">Plain English</div>
                  </div>
                </div>

                {/* Chip 2 */}
                <div className="bg-bgSurface border border-borderDefault rounded-xl p-3.5 shadow-subtle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-riskHigh flex items-center justify-center flex-shrink-0 border border-red-100">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy900">3-Tier</div>
                    <div className="text-[11px] text-slate400 font-medium">Risk Tagging</div>
                  </div>
                </div>

                {/* Chip 3 */}
                <div className="bg-bgSurface border border-borderDefault rounded-xl p-3.5 shadow-subtle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-accent flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <GitCompare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy900">Meaning</div>
                    <div className="text-[11px] text-slate400 font-medium">Diff Engine</div>
                  </div>
                </div>

                {/* Chip 4 */}
                <div className="bg-bgSurface border border-borderDefault rounded-xl p-3.5 shadow-subtle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy900">Zero</div>
                    <div className="text-[11px] text-slate400 font-medium">Raw Storage</div>
                  </div>
                </div>
              </div>

              {/* Tagline Strip */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate400 uppercase tracking-widest pt-2">
                <span className="h-px bg-borderDefault flex-1" />
                <span>SIMPLIFY • FLAG RISKS • COMPARE • ASK QUESTIONS</span>
                <span className="h-px bg-borderDefault flex-1" />
              </div>
            </div>

            {/* Right Hero Showcase Visual Composition (5 Cols) */}
            <div className="lg:col-span-5 relative" id="inspector-preview">
              <div className="relative mx-auto max-w-md bg-bgSurface border border-borderDefault rounded-2xl shadow-xl p-6 space-y-4">
                {/* Header of Mockup */}
                <div className="flex items-center justify-between border-b border-borderDefault pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-xs font-mono text-slate400 ml-2">Lease_Agreement_Bangalore.pdf</span>
                  </div>
                  <RiskBadge level="high" />
                </div>

                {/* Contract Excerpt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate400 uppercase tracking-wider">
                      § 4.2 Security Deposit Clause
                    </span>
                    <span className="text-[10px] text-riskHigh font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      High Risk Detected
                    </span>
                  </div>
                  <div className="bg-bgPrimary p-3 rounded-lg border border-borderDefault text-xs text-slate700 font-mono italic">
                    "Tenant shall deposit an advance security deposit of INR 2,00,000, which shall be strictly non-refundable upon lease termination under all conditions."
                  </div>
                </div>

                {/* Plain-Language Rewrite Card */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy900">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Plain-Language Translation</span>
                  </div>
                  <p className="text-xs text-slate700 leading-relaxed font-sans">
                    You will permanently lose your entire ₹2,00,000 deposit upon move-out, regardless of property condition. In customary residential leases, security deposits must be refundable.
                  </p>
                </div>

                {/* Lawyer Briefing Card */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <HelpCircle className="w-3.5 h-3.5 text-riskAttention" />
                    <span>Question Prepared for Lawyer</span>
                  </div>
                  <p className="text-xs text-slate700 leading-relaxed font-sans italic">
                    "Can we amend Clause 4.2 to require full refund within 14 days of inspection, deducting only documented structural damages?"
                  </p>
                </div>

                <DisclaimerNotice />
              </div>
            </div>
          </div>
        </section>

        {/* Explore Our Capabilities (Section cards matching ReadyToGo's Explore Grid) */}
        <section id="capabilities" className="bg-bgSurface border-y border-borderDefault py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Explore Capabilities</span>
                <h2 className="text-3xl font-serif font-bold text-navy900 mt-1">
                  Everything you need to parse legal contracts.
                </h2>
              </div>
              <Link
                to="/login"
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <span>View All Features</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-bgPrimary border border-borderDefault rounded-2xl p-6 flex flex-col justify-between hover:border-slate400 hover:shadow-subtle transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-accent flex items-center justify-center border border-blue-100 mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-navy900 mb-2">1. Section Simplifier</h3>
                  <p className="text-xs text-slate700 font-sans leading-relaxed">
                    Turns dense, convoluted paragraphs into plain-language bullet points without omitting key legal obligations.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-borderDefault flex items-center text-xs font-semibold text-accent">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-bgPrimary border border-borderDefault rounded-2xl p-6 flex flex-col justify-between hover:border-slate400 hover:shadow-subtle transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-riskAttention flex items-center justify-center border border-amber-100 mb-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-navy900 mb-2">2. Risk Highlighter</h3>
                  <p className="text-xs text-slate700 font-sans leading-relaxed">
                    Tags every single clause as Standard, Attention, or High Risk with a clear, one-line justification.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-borderDefault flex items-center text-xs font-semibold text-accent">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-bgPrimary border border-borderDefault rounded-2xl p-6 flex flex-col justify-between hover:border-slate400 hover:shadow-subtle transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-riskStandard flex items-center justify-center border border-green-100 mb-4">
                    <GitCompare className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-navy900 mb-2">3. Meaning Diff</h3>
                  <p className="text-xs text-slate700 font-sans leading-relaxed">
                    Compares two contract versions across Payment Terms, Termination, and Liability instead of word diffs.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-borderDefault flex items-center text-xs font-semibold text-accent">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-bgPrimary border border-borderDefault rounded-2xl p-6 flex flex-col justify-between hover:border-slate400 hover:shadow-subtle transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-navy900 mb-2">4. Grounded Q&amp;A</h3>
                  <p className="text-xs text-slate700 font-sans leading-relaxed">
                    Answers questions strictly from your document text and refuses external speculation when not mentioned.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-borderDefault flex items-center text-xs font-semibold text-accent">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Targeted Personas Section per PRD 3 */}
        <section id="personas" className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Built for Real Scenarios</span>
            <h2 className="text-3xl font-serif font-bold text-navy900 mt-1">
              Who is NyayMitra built for?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setActivePersona('tenant')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activePersona === 'tenant'
                  ? 'bg-bgSurface border-accent shadow-md scale-102'
                  : 'bg-bgPrimary border-borderDefault hover:bg-bgSurface'
              }`}
            >
              <Building className="w-5 h-5 text-accent mb-2" />
              <h4 className="font-serif font-bold text-sm text-navy900">Tenants</h4>
              <p className="text-[11px] text-slate400 font-sans">Lease &amp; Rental</p>
            </button>

            <button
              onClick={() => setActivePersona('freelancer')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activePersona === 'freelancer'
                  ? 'bg-bgSurface border-accent shadow-md scale-102'
                  : 'bg-bgPrimary border-borderDefault hover:bg-bgSurface'
              }`}
            >
              <UserCheck className="w-5 h-5 text-accent mb-2" />
              <h4 className="font-serif font-bold text-sm text-navy900">Freelancers</h4>
              <p className="text-[11px] text-slate400 font-sans">Client MSAs &amp; NDAs</p>
            </button>

            <button
              onClick={() => setActivePersona('business')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activePersona === 'business'
                  ? 'bg-bgSurface border-accent shadow-md scale-102'
                  : 'bg-bgPrimary border-borderDefault hover:bg-bgSurface'
              }`}
            >
              <FileCheck2 className="w-5 h-5 text-accent mb-2" />
              <h4 className="font-serif font-bold text-sm text-navy900">Businesses</h4>
              <p className="text-[11px] text-slate400 font-sans">Vendor Contracts</p>
            </button>

            <button
              onClick={() => setActivePersona('prelawyer')}
              className={`p-4 rounded-xl border text-left transition-all ${
                activePersona === 'prelawyer'
                  ? 'bg-bgSurface border-accent shadow-md scale-102'
                  : 'bg-bgPrimary border-borderDefault hover:bg-bgSurface'
              }`}
            >
              <Scale className="w-5 h-5 text-accent mb-2" />
              <h4 className="font-serif font-bold text-sm text-navy900">Pre-Lawyer</h4>
              <p className="text-[11px] text-slate400 font-sans">Consultation Prep</p>
            </button>
          </div>

          <div className="p-8 bg-bgSurface border border-borderDefault rounded-2xl shadow-subtle">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {personas[activePersona].role}
              </span>
              <p className="text-2xl font-serif font-bold text-navy900 italic">
                {personas[activePersona].need}
              </p>
              <p className="text-sm text-slate-700 font-sans leading-relaxed">
                {personas[activePersona].solution}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom-Right Assistant Widget (Ask Yukti style -> Ask NyayMitra) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/login"
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-navy900 hover:bg-slate-800 text-bgSurface rounded-full shadow-xl border border-slate-700 hover:scale-105 transition-all"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          <span className="text-xs font-semibold font-sans">✦ Ask NyayMitra</span>
        </Link>
      </div>

      {/* Footer per PRD 5.4 */}
      <footer id="disclaimer" className="border-t border-borderDefault bg-bgSurface py-10 text-xs text-slate400 font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Scale className="w-4 h-4 text-accent" />
              <span className="font-bold text-navy900 text-sm">NyayMitra</span>
            </div>
            <p className="text-slate-600">
              Automated legal document informational tool. Raw files are parsed in-memory and never permanently stored.
            </p>
          </div>
          <div className="text-center sm:text-right space-y-1">
            <p>NyayMitra &copy; 2026. All rights reserved.</p>
            <p className="text-slate-400">Strictly grounded on your uploaded agreements.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
