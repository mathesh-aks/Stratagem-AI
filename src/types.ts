export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string; // Will store JSON string for assistant messages
  timestamp: Date;
  attachments?: Attachment[];
  structuredContent?: StructuredResponse; // Optional parsed content
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
}

export interface StructuredResponse {
  summary: string;
  analysis: string;
  recommendation: string;
  execution: {
    immediate: string;
    short_term: string;
  };
  risks: Array<{
    risk: string;
    severity: 'Low' | 'Medium' | 'High';
  }>;
  next_step: string;
}

export interface AnalysisResult {
  summary: string[];
  strategies: Strategy[];
}

export interface Strategy {
  name: string;
  pros: string[];
  cons: string[];
}
