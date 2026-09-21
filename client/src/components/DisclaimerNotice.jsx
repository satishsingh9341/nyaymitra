import React from 'react';
import { Info } from 'lucide-react';

/**
 * Inline Disclaimer Notice for AI-generated blocks.
 * PRD Rule 6 & 5.6: Non-negotiable visible notice on all AI outputs.
 */
export default function DisclaimerNotice({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] text-slate400 font-sans ${className}`}>
      <Info className="w-3 h-3 text-slate400 flex-shrink-0" />
      <span>AI-generated — verify with a professional before relying on this.</span>
    </span>
  );
}
