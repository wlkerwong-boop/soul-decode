'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  context?: string;
  maxFreeMessages?: number;
  isPremium?: boolean;
}

export default function AIChat({ context, maxFreeMessages = 3, isPremium = false }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const totalMessages = messages.filter(m => m.role === 'user').length;
  const canAsk = isPremium || totalMessages < maxFreeMessages;

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    setStreamingContent('');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, context, history }),
      });

      if (!response.ok) {
        const err = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.error || '对话失败'}` }]);
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ 连接失败' }]);
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
            if (parsed.done) {
              setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
              setStreamingContent('');
            }
            if (parsed.error) {
              setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${parsed.error}` }]);
              setStreamingContent('');
            }
          } catch { /* ignore */ }
        }
      }

      if (fullContent && !messages.find(m => m.content === fullContent)) {
        setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
        setStreamingContent('');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ 网络错误，请重试' }]);
    } finally {
      setLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card-jade overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">AI 追问</h3>
            <p className="text-[10px] text-[var(--text-secondary)] opacity-70">
              {isPremium ? '无限畅聊' : `今日剩余 ${maxFreeMessages - totalMessages} 次追问`}
            </p>
          </div>
        </div>
        {!isPremium && totalMessages >= maxFreeMessages && (
          <a
            href="/payment"
            className="text-xs px-3 py-1 rounded-full bg-[var(--text-accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            解锁无限追问
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="px-5 py-4 max-h-80 overflow-y-auto space-y-4" style={{ minHeight: messages.length === 0 && !streamingContent ? 'auto' : '200px' }}>
        {messages.length === 0 && !streamingContent && (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-secondary)] opacity-60">
              对报告中任何内容有疑问，可以继续追问AI
            </p>
            <p className="text-xs text-[var(--text-secondary)] opacity-40 mt-1">
              例如：我今年的财运变化趋势如何？我和XX的八字合吗？
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--text-accent)] text-white rounded-br-md'
                  : 'bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-[var(--text-primary)] rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[var(--bg-highlight)] border border-[var(--border-accent)] text-[var(--text-primary)] rounded-bl-md">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-[var(--text-accent)] ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {canAsk && (
        <div className="px-5 py-3 border-t border-[var(--border-color)]">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? 'AI 思考中…' : `追问AI（${maxFreeMessages - totalMessages}次剩余）`}
              disabled={loading}
              className="input-jade flex-1 text-sm"
              style={{ padding: '10px 14px', fontSize: '14px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 rounded-lg bg-[var(--text-accent)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, display: 'block' }} />
              ) : '发送'}
            </button>
          </div>
        </div>
      )}

      {!canAsk && !isPremium && (
        <div className="px-5 py-4 border-t border-[var(--border-color)] text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            今日免费追问已用完
          </p>
          <a
            href="/payment"
            className="btn-jade inline-flex items-center justify-center px-6 py-2 text-sm"
            style={{ width: 'auto' }}
          >
            💎 升级会员 · 无限追问
          </a>
        </div>
      )}
    </div>
  );
}
