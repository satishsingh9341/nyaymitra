import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

/**
 * RiskBadge Component
 * PRD Rule 7: Risk badges ALWAYS carry a text label ("Standard"/"Attention"/"High Risk"), never color alone.
 */
export default function RiskBadge({ level = 'standard', className = '' }) {
  const normalized = (level || 'standard').toLowerCase();

  switch (normalized) {
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-riskHigh border border-red-200 ${className}`}
          title="High Risk Clause or Document"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-riskHigh" />
          <span>High Risk</span>
        </span>
      );

    case 'attention':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-riskAttention border border-amber-200 ${className}`}
          title="Attention Required"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-riskAttention" />
          <span>Attention</span>
        </span>
      );

    case 'standard':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-green-50 text-riskStandard border border-green-200 ${className}`}
          title="Standard Routine Terms"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-riskStandard" />
          <span>Standard</span>
        </span>
      );
  }
}
