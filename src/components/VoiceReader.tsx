'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceReaderProps {
  text: string;
  title?: string;
}

export default function VoiceReader({ text, title }: VoiceReaderProps) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(0.9);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      const zhVoices = v.filter(v => v.lang.startsWith('zh'));
      setVoices(zhVoices.length > 0 ? zhVoices : v);
      if (zhVoices.length > 0 && !selectedVoice) setSelectedVoice(zhVoices[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      const v = voices.find(v => v.name === selectedVoice);
      if (v) utter.voice = v;
    }
    utter.rate = rate;
    utter.pitch = 1.0;
    utter.onend = () => { setPlaying(false); setPaused(false); };
    utter.onpause = () => setPaused(true);
    utter.onresume = () => setPaused(false);
    utteranceRef.current = utter;
    synthRef.current.speak(utter);
    setPlaying(true);
  };

  const pause = () => { synthRef.current?.pause(); };
  const resume = () => { synthRef.current?.resume(); };
  const stop = () => { synthRef.current?.cancel(); setPlaying(false); setPaused(false); };

  return (
    <div className="voice-reader p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
      {title && <div className="text-sm font-medium mb-3 opacity-70">{title}</div>}
      
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={playing ? (paused ? resume : pause) : speak}
          className="w-10 h-10 rounded-full bg-[var(--text-accent)] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
          {!playing ? '▶' : paused ? '▶' : '⏸'}
        </button>
        {playing && (
          <button onClick={stop}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
            ⏹ 停止
          </button>
        )}
        
        <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
          className="ml-auto px-2 py-1 rounded bg-[var(--bg-highlight)] border border-[var(--border-color)] text-xs max-w-[160px]">
          {voices.map(v => (
            <option key={v.name} value={v.name}>{v.name.slice(0, 20)}</option>
          ))}
        </select>
        
        <div className="flex items-center gap-1 text-xs">
          <span>慢</span>
          <input type="range" min="0.5" max="1.5" step="0.1" value={rate}
            onChange={e => setRate(parseFloat(e.target.value))}
            className="w-20 accent-[var(--text-accent)]" />
          <span>快</span>
        </div>
      </div>
      
      {playing && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {paused ? '已暂停' : '正在朗读...'}
        </div>
      )}
    </div>
  );
}
