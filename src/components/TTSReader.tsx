'use client';

import { useState, useCallback, useEffect } from 'react';

interface TTSReaderProps {
  text: string;
  label?: string;
}

export default function TTSReader({ text, label = '朗读' }: TTSReaderProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a Chinese voice if available
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh'));
    if (zhVoice) utterance.voice = zhVoice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [text, speaking, supported]);

  if (!supported) return null;

  return (
    <button
      onClick={speak}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm ${
        speaking
          ? 'bg-[var(--text-accent)]/20 border-[var(--text-accent)] text-[var(--text-accent)]'
          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-accent)] hover:text-white'
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {speaking ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-6.364-2.364a9 9 0 010-12.728M19.071 4.929a12 12 0 010 14.142" />
        )}
      </svg>
      {speaking ? '停止朗读' : label}
    </button>
  );
}
