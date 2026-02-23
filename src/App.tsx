import { useState, useEffect, useCallback } from 'react';
import { Message, Attachment, StructuredResponse } from './types';
import { MessageList } from './components/Chat/MessageList';
import { ChatInput } from './components/Chat/ChatInput';
import { DocumentPanel } from './components/Sidebar/DocumentPanel';
import { chatWithGemini, analyzeDocument } from './services/gemini';
import { Briefcase, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "STRATAGEM AI\nStrategic Intelligence & Decision Advisory\n\nSelect your objective:\n\n1. Strategic Planning\n2. Decision Evaluation\n3. Risk & Scenario Analysis\n4. Operational Optimization\n5. Document Intelligence Review\n\nReply with the number or describe your situation.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState<StructuredResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSendMessage = useCallback(async (content: string, attachments: Attachment[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      attachments,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // If there's a document attachment, trigger analysis
    const documentAttachment = attachments.find(a => 
      a.type.includes('pdf') || a.type.includes('text') || a.type.includes('word') || a.name.endsWith('.txt')
    );

    if (documentAttachment) {
      setIsAnalyzing(true);
      analyzeDocument(documentAttachment.name, documentAttachment.data, documentAttachment.type)
        .then(result => {
          setAnalysis(result);
          setIsAnalyzing(false);
        })
        .catch(err => {
          console.error("Analysis failed", err);
          setIsAnalyzing(false);
        });
    }

    try {
      const response = await chatWithGemini([...messages, userMessage]);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-white text-zinc-900 font-sans overflow-hidden">
      {/* Left Navigation Rail */}
      <nav className="w-16 md:w-20 bg-zinc-900 flex flex-col items-center py-8 gap-8 shrink-0">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Briefcase size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          <button className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
            <LayoutDashboard size={22} />
          </button>
          <button className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
            <Settings size={22} />
          </button>
        </div>

        <button className="p-3 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
          <LogOut size={22} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-zinc-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg tracking-tight">Stratagem <span className="text-emerald-600">AI</span></h1>
            <div className="h-4 w-[1px] bg-zinc-200 mx-2" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Strategic Advisory</span>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={messages} />
          
          {isTyping && (
            <div className="px-6 py-2 flex items-center gap-2 text-xs text-zinc-400 italic animate-pulse">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Stratagem is thinking...
            </div>
          )}
          
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </main>

      {/* Right Sidebar - Analysis */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="overflow-hidden"
          >
            <DocumentPanel analysis={analysis} isAnalyzing={isAnalyzing} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
