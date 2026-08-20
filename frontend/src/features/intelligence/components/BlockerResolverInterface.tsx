import React, { useState } from 'react';
import { useResolveBlocker } from '../hooks/useIntelligence';
import type { BlockerMessage } from '../types/intelligence.types';
import {
  IconSparkles,
  IconSend,
  IconBrain,
  IconCopy,
  IconCheck,
  IconDatabase,
  IconBolt,
  IconCpu,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'How to resolve the critical path delay on the Auth API migration?',
  'Why is the capacity heatmap showing an overload on backend engineers this week?',
  'Suggest mitigation strategy for database lock contentions under high load.',
  'Analyze dependency cascade between Task #TSK-101 and Task #TSK-104.',
];

export function BlockerResolverInterface() {
  const [prompt, setPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BlockerMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your Autonomous Engineering Copilot powered by Google Gemini 3.5 Flash and Pinecone Vector Memory. Ask any question regarding milestone bottlenecks, task dependencies, code architecture, or resource capacity to synthesize past solutions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'Gemini 3.5 Flash + Pinecone RAG',
      references: ['Project Memory Index', 'Task Dependency Graph', 'Engineering Worklogs'],
    },
  ]);

  const resolveMutation = useResolveBlocker();

  const handleSend = async (questionText?: string) => {
    const query = questionText || prompt.trim();
    if (!query || resolveMutation.isPending) return;

    const userMsg: BlockerMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');

    const start = performance.now();
    try {
      const response = await resolveMutation.mutateAsync(query);
      const latency = Math.round(performance.now() - start);

      const aiMsg: BlockerMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer || 'No specific answer was synthesized. Please refine your query context.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Gemini 3.5 Flash',
        latencyMs: latency,
        references: response.references || ['Pinecone Vector DB', 'Historical Solutions Vector Space'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      // Error handled by mutation toast
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Solution copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="d-flex flex-column h-100 space-y-4">
      {/* Stream Container */}
      <div
        className="card glass-surface p-4 flex-fill overflow-y-auto space-y-4 shadow-sm border-0"
        style={{ minHeight: '480px', maxHeight: 'calc(100vh - 360px)' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            {msg.sender === 'user' ? (
              <div
                className="p-3.5 rounded-3 bg-primary text-white shadow-sm"
                style={{ maxWidth: '75%', borderRadius: '16px 16px 4px 16px' }}
              >
                <div className="d-flex align-items-center justify-content-between gap-3 mb-1">
                  <span className="small fw-bold opacity-75">You</span>
                  <span className="small opacity-50" style={{ fontSize: '0.68rem' }}>
                    {msg.timestamp}
                  </span>
                </div>
                <div className="small lh-base" style={{ fontSize: '0.875rem' }}>
                  {msg.text}
                </div>
              </div>
            ) : (
              <div
                className="p-4 rounded-3 card glass-surface shadow-sm border-0 position-relative w-100"
                style={{
                  maxWidth: '92%',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%)',
                }}
              >
                {/* AI Provenance Header */}
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary-subtle flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-1.5 rounded-2 bg-purple-subtle text-purple border border-purple-subtle d-flex align-items-center justify-content-center">
                      <IconSparkles size={16} />
                    </div>
                    <div>
                      <span className="fw-bold text-body small">Autonomous Synthesis</span>
                      {msg.model && (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-2 font-monospace px-2 py-0.5 rounded-pill small" style={{ fontSize: '0.68rem' }}>
                          {msg.model}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {msg.latencyMs && (
                      <span className="badge bg-body-tertiary text-secondary border border-secondary-subtle small font-monospace d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                        <IconBolt size={12} className="text-warning" />
                        <span>{msg.latencyMs}ms</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="btn btn-sm btn-icon btn-ghost-secondary rounded-2"
                      title="Copy Solution"
                    >
                      {copiedId === msg.id ? <IconCheck size={14} className="text-success" /> : <IconCopy size={14} />}
                    </button>
                  </div>
                </div>

                {/* AI Markdown Content */}
                <div className="text-body small lh-lg mb-3" style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {/* References / Vector Memory Tags */}
                {msg.references && msg.references.length > 0 && (
                  <div className="d-flex align-items-center gap-1.5 flex-wrap pt-2 border-top border-secondary-subtle">
                    <span className="text-secondary small d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                      <IconDatabase size={13} className="text-primary" />
                      <span>Vector Sources:</span>
                    </span>
                    {msg.references.map((ref, idx) => (
                      <span
                        key={idx}
                        className="badge bg-body-secondary text-secondary border border-secondary-subtle px-2 py-0.5 rounded-pill small"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Pulsing Neural Skeleton when RAG is reasoning */}
        {resolveMutation.isPending && (
          <div className="p-4 rounded-3 card glass-surface shadow-sm border-0 ai-neural-skeleton" style={{ maxWidth: '85%' }}>
            <div className="d-flex align-items-center gap-2.5 mb-2">
              <IconBrain size={20} className="text-purple animate-pulse" />
              <span className="fw-bold text-body small">Neural Context Synthesis in Progress...</span>
            </div>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
              Querying Pinecone vector index for historical similarity matches and synthesizing reasoning chain with Google Gemini 3.5 Flash...
            </p>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="d-flex align-items-center gap-2 overflow-x-auto pb-1">
        <span className="text-secondary small fw-semibold flex-shrink-0 d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
          <IconCpu size={14} className="text-primary" />
          <span>Suggestions:</span>
        </span>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(s)}
            className="btn btn-sm btn-outline-secondary text-truncate flex-shrink-0 rounded-pill px-3 py-1"
            style={{ fontSize: '0.75rem', maxWidth: '320px' }}
            disabled={resolveMutation.isPending}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Futuristic Glowing Prompt Input */}
      <div className="ai-glow-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="d-flex align-items-center gap-2 p-2 rounded-3 bg-body"
        >
          <div className="input-icon flex-fill">
            <span className="input-icon-addon ps-2 text-primary">
              <IconSparkles size={18} />
            </span>
            <input
              type="text"
              className="form-control border-0 bg-transparent ps-5 shadow-none"
              placeholder="Ask Copilot: Resolve milestone blockers, query vector memory, or calculate dependency risks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={resolveMutation.isPending}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-ai-gradient d-flex align-items-center gap-2 px-4 shadow-sm"
            disabled={!prompt.trim() || resolveMutation.isPending}
          >
            {resolveMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <span>Synthesize</span>
                <IconSend size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
