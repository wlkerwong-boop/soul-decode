'use client';

import { useState, useEffect } from 'react';
import { FREE_CODES } from '@/data/free-codes';

const ADMIN_PIN = '8888'; // 管理员密码，可修改

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [codes, setCodes] = useState(FREE_CODES);
  const [newCode, setNewCode] = useState('');
  const [assignName, setAssignName] = useState('');
  const [assignCode, setAssignCode] = useState('');

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const saved = localStorage.getItem('admin-logged-in');
    if (saved === '1') setLoggedIn(true);
  }, []);

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setLoggedIn(true);
      localStorage.setItem('admin-logged-in', '1');
      setPinError('');
    } else {
      setPinError('密码错误');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('admin-logged-in');
  };

  const handleGenerateCode = () => {
    // 生成新的免费码
    const nextNum = codes.length + 1;
    const paddedNum = String(nextNum).padStart(3, '0');
    const code = `SOUL-GIFT-${paddedNum}`;
    setNewCode(code);
    setCodes(prev => [...prev, {
      code,
      used: false,
      friendName: '',
      createdAt: new Date().toISOString().slice(0, 10),
    }]);
  };

  const handleAssign = () => {
    if (!assignCode || !assignName) return;
    setCodes(prev => prev.map(c =>
      c.code === assignCode ? { ...c, friendName: assignName } : c
    ));
    setAssignCode('');
    setAssignName('');
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback
    }
  };

  // ---- 未登录 ----
  if (!loggedIn) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-accent)]">✦ 管理员后台</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2 opacity-60">请输入管理密码</p>
          </div>
          <input
            type="password"
            className="input-gold mb-3"
            placeholder="管理员密码"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {pinError && <p className="text-red-400 text-sm mb-3">{pinError}</p>}
          <button className="btn-gold" onClick={handleLogin}>进入后台</button>
        </div>
      </div>
    );
  }

  // ---- 已登录 ----
  const availableCodes = codes.filter(c => !c.used && c.friendName === '');
  const assignedCodes = codes.filter(c => c.friendName !== '');
  const usedCodes = codes.filter(c => c.used);

  return (
    <div className="min-h-screen gradient-bg px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-accent)]">✦ 管理员后台</h1>
            <p className="text-xs text-[var(--text-secondary)] opacity-60">免费名额管理</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors">
            退出登录
          </button>
        </div>

        {/* 生成新码 */}
        <div className="rounded-xl p-5 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.02))',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">🎁 生成免费名额</h2>
          <button className="btn-gold !w-auto !px-6 !py-2 !text-sm" onClick={handleGenerateCode}>
            + 生成新码
          </button>
          {newCode && (
            <div className="mt-3 flex items-center gap-3">
              <code className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--bg-card)] text-[var(--text-accent)] border border-[var(--border-color)]">
                {newCode}
              </code>
              <button onClick={() => handleCopyCode(newCode)}
                className="text-xs text-[var(--text-accent)] hover:text-[var(--text-accent-hover)]">
                📋 复制
              </button>
            </div>
          )}
        </div>

        {/* 分配名额 */}
        {availableCodes.length > 0 && (
          <div className="rounded-xl p-5 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(74,222,128,0.05), rgba(74,222,128,0.01))',
              border: '1px solid rgba(74,222,128,0.1)',
            }}
          >
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">📝 分配给朋友</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-[var(--text-secondary)] mb-1 block opacity-60">免费码</label>
                <select className="input-gold" value={assignCode} onChange={e => setAssignCode(e.target.value)}>
                  <option value="">选择免费码</option>
                  {availableCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--text-secondary)] mb-1 block opacity-60">朋友名字</label>
                <input className="input-gold" placeholder="如：老王" value={assignName} onChange={e => setAssignName(e.target.value)} />
              </div>
              <button className="btn-gold !w-auto !px-6 !py-2 !text-sm" onClick={handleAssign}
                disabled={!assignCode || !assignName}>
                分配
              </button>
            </div>
          </div>
        )}

        {/* 已分配的 */}
        {assignedCodes.length > 0 && (
          <div className="rounded-xl p-5 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.05), rgba(96,165,250,0.01))',
              border: '1px solid rgba(96,165,250,0.1)',
            }}
          >
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">👥 已分配</h2>
            <div className="space-y-2">
              {assignedCodes.map(c => (
                <div key={c.code} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-card)]">
                  <div>
                    <code className="text-sm text-[var(--text-accent)]">{c.code}</code>
                    <span className="text-sm text-[var(--text-primary)] ml-3">→ {c.friendName}</span>
                  </div>
                  <button onClick={() => handleCopyCode(c.code)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-accent)]">
                    📋 复制码
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 已使用的 */}
        {usedCodes.length > 0 && (
          <div className="rounded-xl p-5 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.01))',
              border: '1px solid rgba(239,68,68,0.1)',
            }}
          >
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">✅ 已使用</h2>
            <div className="space-y-1">
              {usedCodes.map(c => (
                <div key={c.code} className="text-sm text-[var(--text-secondary)] py-1">
                  <code className="text-[var(--text-accent)]">{c.code}</code>
                  {c.friendName && <span className="ml-2 opacity-60">（{c.friendName}）</span>}
                  <span className="ml-2 opacity-40">· 已使用</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 全部列表 */}
        <div className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(201,169,110,0.04), rgba(201,169,110,0.01))',
            border: '1px solid rgba(201,169,110,0.08)',
          }}
        >
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">📋 全部免费码</h2>
          <div className="text-xs space-y-1">
            {codes.map(c => (
              <div key={c.code} className="flex items-center gap-2 py-1">
                <span className={c.used ? 'opacity-30' : 'text-[var(--text-accent)]'}>
                  {c.code}
                </span>
                {c.used && <span className="text-green-400">✓</span>}
                {c.friendName && <span className="opacity-50">→ {c.friendName}</span>}
                {!c.used && !c.friendName && <span className="text-[var(--text-accent)] opacity-50">可用</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-[var(--text-secondary)] opacity-50">
            总计：{codes.length} 个 · 可用：{availableCodes.length} 个 · 已用：{usedCodes.length} 个
          </div>
        </div>
      </div>
    </div>
  );
}
