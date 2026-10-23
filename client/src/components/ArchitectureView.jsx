import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, Cpu, Lock, ArrowRight, Zap, Database } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
          Hackathon Architecture & System Design
        </span>
        <h2 className="text-2xl font-black text-white">AgentPay: PayPal & AI Architecture</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Designed specifically for the <strong>Build What's Next with PayPal and AI</strong> hackathon. AgentPay bridges the gap between natural language product discovery and user-authorized PayPal checkout.
        </p>
      </div>

      {/* End to End 11-Step Flow */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>End-to-End User Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { step: '1', title: 'Intent Extraction', desc: 'AI extracts category, budget ceiling, RAM, and constraints from natural language prompt.' },
            { step: '2', title: 'Grounded Search', desc: 'Agent invokes search_products() tool with deterministic filters on server catalogue.' },
            { step: '3', title: 'Specification Compare', desc: 'Multiple candidates evaluated across RAM, CPU, battery, and value for money.' },
            { step: '4', title: 'Explainable Recommendation', desc: 'Presents top picks, highlights, trade-offs, and grounded pros/cons.' },
            { step: '5', title: 'Product Selection', desc: 'User clicks "Select & Review Order" for their desired item.' },
            { step: '6', title: 'Server Price Calculation', desc: 'Backend computes trusted subtotal, 5% tax, and total. Rejects client-supplied prices.' },
            { step: '7', title: 'Explicit User Authorization', desc: 'User reviews breakdown and ticks confirmation box before PayPal button unlocks.' },
            { step: '8', title: 'PayPal Sandbox Order v2', desc: 'Backend authenticates via OAuth2 and creates order with intent: CAPTURE.' },
            { step: '9', title: 'Buyer Approval', desc: 'Official PayPal checkout SDK renders modal where buyer approves payment in Sandbox.' },
            { step: '10', title: 'Backend Capture & Verify', desc: 'Server captures order, verifies status is COMPLETED, and checks amount matches.' },
            { step: '11', title: 'Transaction Receipt', desc: 'Displays verified PayPal Order ID, Capture ID, payer info, and timestamp.' },
          ].map((item) => (
            <div key={item.step} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start space-x-3">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                {item.step}
              </span>
              <div>
                <strong className="text-slate-100 block">{item.title}</strong>
                <span className="text-slate-400">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & PayPal Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Backend Secret Isolation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            PayPal Client Secret and AI API Keys remain server-side only. Client browser only accesses public Client ID for SDK initialization.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Zero Client Trust</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Prices, quantities, item totals, and currency codes are calculated and verified exclusively on the server against the catalogue.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Idempotent Captures</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Order store tracks capture status to prevent duplicate captures or double billing. Verifies exact amount and currency match.
          </p>
        </div>
      </div>
    </div>
  );
}
