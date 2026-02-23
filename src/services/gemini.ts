import { GoogleGenAI, Type } from "@google/genai";
import { Message, StructuredResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are Stratagem AI, a professional Strategic Decision & Risk Intelligence System designed to operate inside a structured web application environment.
You function as a modular strategic engine supporting a web-based SaaS interface.

CORE OBJECTIVE:
- Clarify user problems and provide structured strategic reasoning.
- Support decision-making by identifying risks and trade-offs.
- Provide actionable execution steps.
- Every response must move the user toward a clear decision or action.

MODULE HANDLING:
You will operate based on the context of the conversation.
- QUERY: Provide clear, concise, practical insight.
- DECISION: Compare options logically (Pros, Risks, Resource requirement, Final recommendation).
- STRATEGY: Provide structured growth or action plan with execution roadmap.
- DOCUMENT: Extract key points, obligations, risks, deadlines, and strategic implications.

RESPONSE FORMAT (STRICT):
You MUST return responses in the following JSON format ONLY. Do not include markdown or extra commentary.

{
  "summary": "...",
  "analysis": "...",
  "recommendation": "...",
  "execution": {
      "immediate": "...",
      "short_term": "..."
  },
  "risks": [
      {"risk": "...", "severity": "Low/Medium/High"}
  ],
  "next_step": "..."
}

TONE:
Professional, executive-level, clear, and confident. No fluff or motivational language.`;

export async function chatWithGemini(messages: Message[]) {
  const model = "gemini-3-flash-preview";
  
  try {
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [
        ...(msg.attachments || []).map(att => ({
          inlineData: {
            mimeType: att.type,
            data: att.data.split(',')[1] || att.data
          }
        })),
        { text: msg.content || (msg.attachments?.length ? "Analyze the attached documentation and provide structured strategic intelligence." : "") }
      ]
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            analysis: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            execution: {
              type: Type.OBJECT,
              properties: {
                immediate: { type: Type.STRING },
                short_term: { type: Type.STRING }
              },
              required: ["immediate", "short_term"]
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                },
                required: ["risk", "severity"]
              }
            },
            next_step: { type: Type.STRING }
          },
          required: ["summary", "analysis", "recommendation", "execution", "risks", "next_step"]
        }
      }
    });

    return response.text || JSON.stringify({
      summary: "Error generating response",
      analysis: "The system failed to generate a structured analysis.",
      recommendation: "Please try again.",
      execution: { immediate: "Retry request", short_term: "Contact support if issue persists" },
      risks: [{ risk: "System failure", severity: "High" }],
      next_step: "Would you like to try rephrasing your request?"
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return JSON.stringify({
      summary: "Technical disruption",
      analysis: "A technical error occurred during processing.",
      recommendation: "Re-initiate the request.",
      execution: { immediate: "Refresh page", short_term: "Check connection" },
      risks: [{ risk: "Connection error", severity: "Medium" }],
      next_step: "Shall we try again?"
    });
  }
}

export async function analyzeDocument(fileName: string, fileData: string, fileType: string): Promise<StructuredResponse> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `DOCUMENT ANALYZER MODULE
  Review the following document: ${fileName}. 
  1. Extract key points, obligations, risks, deadlines, and strategic implications.
  2. Provide structured strategic intelligence.
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: fileType,
              data: fileData.split(',')[1] || fileData
            }
          },
          { text: prompt }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          analysis: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          execution: {
            type: Type.OBJECT,
            properties: {
              immediate: { type: Type.STRING },
              short_term: { type: Type.STRING }
            },
            required: ["immediate", "short_term"]
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                risk: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
              },
              required: ["risk", "severity"]
            }
          },
          next_step: { type: Type.STRING }
        },
        required: ["summary", "analysis", "recommendation", "execution", "risks", "next_step"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse analysis result", e);
    return {
      summary: "Analysis failed",
      analysis: "Could not parse the document intelligence output.",
      recommendation: "Review document manually",
      execution: { immediate: "Check file format", short_term: "Retry analysis" },
      risks: [{ risk: "Parsing error", severity: "Medium" }],
      next_step: "Try another document?"
    };
  }
}
