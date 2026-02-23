import React, { useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Message, StructuredResponse } from '../../types';
import { cn } from '../../lib/utils';
import { User, Bot, FileText, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

const StructuredMessage: React.FC<{ content: StructuredResponse }> = ({ content }) => {
  return (
    <div className="space-y-6 text-[#111827]">
      <section>
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Executive Summary</h3>
        <p className="text-sm leading-relaxed font-medium">{content.summary}</p>
      </section>

      <section>
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Strategic Analysis</h3>
        <p className="text-sm leading-relaxed text-zinc-600">{content.analysis}</p>
      </section>

      <section className="bg-white/50 p-3 rounded-xl border border-zinc-200/50">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Recommendation</h3>
        <p className="text-sm leading-relaxed text-emerald-700 font-medium">{content.recommendation}</p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section>
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Immediate Execution</h3>
          <p className="text-xs leading-relaxed text-zinc-600">{content.execution.immediate}</p>
        </section>
        <section>
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Short-Term Plan</h3>
          <p className="text-xs leading-relaxed text-zinc-600">{content.execution.short_term}</p>
        </section>
      </div>

      <section>
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Risk Assessment</h3>
        <div className="space-y-2">
          {content.risks.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <AlertTriangle size={12} className={cn(
                r.severity === 'High' ? "text-rose-500" : 
                r.severity === 'Medium' ? "text-amber-500" : "text-zinc-400"
              )} />
              <span className="text-zinc-600">{r.risk}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase",
                r.severity === 'High' ? "bg-rose-50 text-rose-600" : 
                r.severity === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-zinc-100 text-zinc-500"
              )}>{r.severity}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-2 border-t border-zinc-200/50 flex items-center gap-2">
        <ArrowRight size={14} className="text-emerald-500" />
        <p className="text-xs italic text-zinc-500">{content.next_step}</p>
      </section>
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderContent = (message: Message) => {
    if (message.role === 'user') {
      return <Markdown>{message.content}</Markdown>;
    }

    try {
      const structured = JSON.parse(message.content) as StructuredResponse;
      return <StructuredMessage content={structured} />;
    } catch (e) {
      // Fallback for initial message or non-JSON responses
      return <Markdown>{message.content}</Markdown>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full gap-4",
            message.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            message.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
          )}>
            {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
          </div>
          
          <div className={cn(
            "max-w-[85%] space-y-2",
            message.role === 'user' ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "rounded-2xl px-5 py-4 shadow-sm",
              message.role === 'user' 
                ? "bg-[#2563eb] text-white rounded-tr-none user-message" 
                : "bg-[#f8fafc] border border-zinc-200/50 text-[#111827] rounded-tl-none assistant-message"
            )}>
              <div className={cn(
                "prose prose-sm max-w-none prose-zinc",
                message.role === 'user' ? "prose-invert text-white" : "text-[#111827]"
              )}>
                {renderContent(message)}
              </div>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className={cn(
                  "mt-3 pt-3 border-t flex flex-wrap gap-2",
                  message.role === 'user' ? "border-white/20" : "border-zinc-200"
                )}>
                  {message.attachments.map((att, idx) => (
                    <div key={idx} className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded text-xs",
                      message.role === 'user' ? "bg-white/10 text-white" : "bg-zinc-200/50 text-zinc-600"
                    )}>
                      <FileText size={12} />
                      <span className="truncate max-w-[150px]">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 px-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
