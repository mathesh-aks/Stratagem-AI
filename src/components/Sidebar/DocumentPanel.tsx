import React from 'react';
import { StructuredResponse } from '../../types';
import { FileText, Lightbulb, CheckCircle2, AlertCircle, Loader2, Target, Zap, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface DocumentPanelProps {
  analysis: StructuredResponse | null;
  isAnalyzing: boolean;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({ analysis, isAnalyzing }) => {
  return (
    <div className="h-full flex flex-col bg-zinc-50 border-l border-zinc-200 w-80 shrink-0 overflow-y-auto">
      <div className="p-6 border-b border-zinc-200 bg-white">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} className="text-emerald-600" />
          Document Intelligence
        </h2>
      </div>

      <div className="flex-1 p-6 space-y-8">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center space-y-4"
            >
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Processing intelligence...</p>
            </motion.div>
          ) : analysis ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Section */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Executive Summary</h3>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium">{analysis.summary}</p>
              </section>

              {/* Analysis Section */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Strategic Analysis</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{analysis.analysis}</p>
              </section>

              {/* Recommendation Section */}
              <section className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-2">
                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <Target size={12} /> Recommendation
                </h3>
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">{analysis.recommendation}</p>
              </section>

              {/* Execution Section */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Execution Roadmap</h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-[10px] font-bold text-zinc-900 uppercase mb-1 flex items-center gap-1">
                      <Zap size={10} className="text-amber-500" /> Immediate
                    </div>
                    <p className="text-xs text-zinc-600">{analysis.execution.immediate}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-[10px] font-bold text-zinc-900 uppercase mb-1 flex items-center gap-1">
                      <Target size={10} className="text-blue-500" /> Short-Term
                    </div>
                    <p className="text-xs text-zinc-600">{analysis.execution.short_term}</p>
                  </div>
                </div>
              </section>

              {/* Risks Section */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <ShieldAlert size={12} /> Risk Assessment
                </h3>
                <div className="space-y-2">
                  {analysis.risks.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-zinc-100">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                        r.severity === 'High' ? "bg-rose-500" : 
                        r.severity === 'Medium' ? "bg-amber-500" : "bg-zinc-300"
                      )} />
                      <div className="space-y-0.5">
                        <p className="text-xs text-zinc-700 leading-tight">{r.risk}</p>
                        <span className={cn(
                          "text-[8px] font-bold uppercase",
                          r.severity === 'High' ? "text-rose-600" : 
                          r.severity === 'Medium' ? "text-amber-600" : "text-zinc-500"
                        )}>{r.severity} Severity</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40"
            >
              <FileText className="w-12 h-12 text-zinc-300" />
              <p className="text-sm text-zinc-500">Upload documentation for intelligence review</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
