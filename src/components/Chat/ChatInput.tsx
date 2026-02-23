import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Attachment } from '../../types';

interface ChatInputProps {
  onSend: (content: string, attachments: Attachment[]) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((content.trim() || attachments.length > 0) && !disabled) {
      onSend(content, attachments);
      setContent('');
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: base64
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 bg-white border-t border-zinc-100">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full text-xs text-zinc-600 border border-zinc-200">
                <span className="truncate max-w-[120px]">{att.name}</span>
                <button 
                  type="button" 
                  onClick={() => removeAttachment(idx)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            disabled={disabled}
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your query or upload documents..."
            className="flex-1 max-h-32 min-h-[52px] py-3 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            disabled={disabled}
          />
          
          <button
            type="submit"
            disabled={(!content.trim() && attachments.length === 0) || disabled}
            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-200"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
