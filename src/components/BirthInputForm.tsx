'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import citiesData from '@/data/cities.json';
import BaziCard from './BaziCard';
import LifeEnergyChart from './LifeEnergyChart';
import ReportShareCard from './ReportShareCard';

const CITIES_DB = (citiesData as any).cities as Record<string, { cities: string[]; tags: string[]; description: string }>;

const PROVINCES = [
  '北京', '上海', '天津', '重庆',
  '山东', '四川', '浙江', '广东', '江苏',
  '湖南', '湖北', '陕西', '福建', '河南',
  '安徽', '云南', '广西', '甘肃', '辽宁',
  '黑龙江', '吉林', '河北', '山西', '江西',
  '贵州', '海南', '青海', '西藏', '宁夏', '新疆',
  '台湾', '香港', '澳门',
];

const GENDER_OPTIONS = [
  { value: '', label: '选择性别' },
  { value: '男', label: '男' },
  { value: '女', label: '女' },
  { value: '其他', label: '其他' },
];

const TIMEZONE_OPTIONS = [
  { value: '', label: '选择时区' },
  { value: '中国标准时间(CST, UTC+8)', label: '中国标准时间(CST, UTC+8)' },
  { value: '美国东部(EST, UTC-5)', label: '美国东部(EST, UTC-5)' },
  { value: '美国西部(PST, UTC-8)', label: '美国西部(PST, UTC-8)' },
  { value: '英国(GMT, UTC+0)', label: '英国(GMT, UTC+0)' },
  { value: '澳洲东部(AEST, UTC+10)', label: '澳洲东部(AEST, UTC+10)' },
  { value: '日本(JST, UTC+9)', label: '日本(JST, UTC+9)' },
  { value: '欧洲中部(CET, UTC+1)', label: '欧洲中部(CET, UTC+1)' },
  { value: '其他', label: '其他' },
];

const HOUR_OPTIONS = [
  { value: '', label: '不确定时辰' },
  { value: '0', label: '00:00-00:59' },
  { value: '1', label: '01:00-01:59' },
  { value: '2', label: '02:00-02:59' },
  { value: '3', label: '03:00-03:59' },
  { value: '4', label: '04:00-04:59' },
  { value: '5', label: '05:00-05:59' },
  { value: '6', label: '06:00-06:59' },
  { value: '7', label: '07:00-07:59' },
  { value: '8', label: '08:00-08:59' },
  { value: '9', label: '09:00-09:59' },
  { value: '10', label: '10:00-10:59' },
  { value: '11', label: '11:00-11:59' },
  { value: '12', label: '12:00-12:59' },
  { value: '13', label: '13:00-13:59' },
  { value: '14', label: '14:00-14:59' },
  { value: '15', label: '15:00-15:59' },
  { value: '16', label: '16:00-16:59' },
  { value: '17', label: '17:00-17:59' },
  { value: '18', label: '18:00-18:59' },
  { value: '19', label: '19:00-19:59' },
  { value: '20', label: '20:00-20:59' },
  { value: '21', label: '21:00-21:59' },
  { value: '22', label: '22:00-22:59' },
  { value: '23', label: '23:00-23:59' },
];

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  location: string;
  gender: string;
  timezone: string;
}

interface BaziMeta {
  pillars: string[];
  ganElements: string[];
  zhiElements: string[];
  zodiac: string;
  dayMaster: string;
  dayMasterElement: string;
  nayin: string[];
  elementDistribution: Record<string, number>;
  summary: string;
}

interface LifeEnergyMeta {
  curve: { age: number; year: number; energy: number; element: string; period: string; type: string }[];
  turningPoints: { year: number; age: number; label: string; significance: string }[];
  startLuckAge: number;
  averageEnergy: number;
}

interface ReportMeta {
  lifePathNumber: number;
  isMasterNumber: boolean;
  timePeriod: { name: string; element: string; energyType: string } | null;
  cityTags: string[];
}

const STORAGE_KEY = 'soul-decode-history';

interface HistoryEntry {
  id: string;
  date: string;
  inputSummary: string;
  bazi: BaziMeta;
  lifeEnergy: LifeEnergyMeta;
  meta: ReportMeta;
  report: string;
}

export default function BirthInputForm() {
  const [formData, setFormData] = useState<FormData>({
    year: '',
    month: '',
    day: '',
    hour: '',
    location: '',
    gender: '',
    timezone: '',
  });
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportComplete, setReportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'loading' | 'report'>('form');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeSection, setActiveSection] = useState<string>('bazi');

  // 两阶段数据
  const [baziData, setBaziData] = useState<BaziMeta | null>(null);
  const [lifeEnergyData, setLifeEnergyData] = useState<LifeEnergyMeta | null>(null);
  const [reportMeta, setReportMeta] = useState<ReportMeta | null>(null);
  const [reportId, setReportId] = useState<string>('');
  const [inputSummary, setInputSummary] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  const currentProvinceCities = selectedProvince ? CITIES_DB[selectedProvince]?.cities || [] : [];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: HistoryEntry[] = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const saveToHistory = useCallback((entry: HistoryEntry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.month || !formData.day) {
      setError('请填写完整的出生日期');
      return;
    }

    // 重置状态
    setError(null);
    setReportText('');
    setReportComplete(false);
    setBaziData(null);
    setLifeEnergyData(null);
    setReportMeta(null);
    setLoading(true);
    setStep('loading');

    const summary = `${formData.year}年${formData.month}月${formData.day}日${formData.hour ? ' ' + formData.hour + '时' : ''} · ${formData.location || '未知地点'}${formData.gender ? ' · ' + formData.gender : ''}`;
    setInputSummary(summary);

    try {
      // === 阶段1：八字排盘（瞬时返回） ===
      const baziRes = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!baziRes.ok) {
        const errData = await baziRes.json().catch(() => ({}));
        throw new Error(errData.error || '八字排盘失败');
      }

      const baziData = await baziRes.json();
      setBaziData(baziData.bazi);
      setLifeEnergyData(baziData.lifeEnergy);
      setReportMeta(baziData.meta);
      setReportId(baziData.reportId);

      // 切换到报告视图（此时八字+能量曲线已可见）
      setStep('report');
      setActiveSection('bazi');

      // === 阶段2：AI报告（流式加载） ===
      const abortController = new AbortController();
      abortRef.current = abortController;

      const reportRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: abortController.signal,
      });

      if (!reportRes.ok) {
        throw new Error('报告生成失败，请稍后重试');
      }

      // 读取流式响应
      const reader = reportRes.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullReport = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullReport += data.content;
              setReportText(fullReport);
              setActiveSection('report');
            }
            if (data.done) {
              setReportComplete(true);
            }
          } catch { /* ignore */ }
        }
      }

      setReportComplete(true);

      // 保存到历史记录
      saveToHistory({
        id: baziData.reportId,
        date: new Date().toLocaleString('zh-CN'),
        inputSummary: summary,
        bazi: baziData.bazi,
        lifeEnergy: baziData.lifeEnergy,
        meta: baziData.meta,
        report: fullReport,
      });

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || '网络错误，请稍后重试');
        // 如果八字已加载但报告失败，保持报告视图
        if (!baziData) {
          setStep('form');
        }
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [formData, saveToHistory]);

  const handleReset = useCallback(() => {
    setBaziData(null);
    setLifeEnergyData(null);
    setReportMeta(null);
    setReportText('');
    setReportComplete(false);
    setError(null);
    setStep('form');
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadHistory = useCallback((entry: HistoryEntry) => {
    setBaziData(entry.bazi);
    setLifeEnergyData(entry.lifeEnergy);
    setReportMeta(entry.meta);
    setReportText(entry.report || '');
    setReportComplete(true);
    setReportId(entry.id);
    setInputSummary(entry.inputSummary);
    setStep('report');
    setActiveSection('bazi');
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShare = useCallback(() => {
    setShowShareCard(true);
  }, []);

  const handleShareText = useCallback(() => {
    if (!baziData) return;
    const text = `🔮 灵魂解码 · 我的命盘已开启\n\n八字：${baziData.pillars.filter(p => p !== '--').join(' ')}\n日主：${baziData.dayMaster}（${baziData.dayMasterElement}）\n生肖：${baziData.zodiac}\n${lifeEnergyData ? `能量均值：${lifeEnergyData.averageEnergy}` : ''}\n\n你的呢？输入出生信息，即刻解码 → https://soul-decode.vercel.app`;

    if (navigator.share) {
      navigator.share({ title: '灵魂解码', text }).catch(() => {
        navigator.clipboard.writeText(text).catch(() => {});
      });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }, [baziData, lifeEnergyData]);

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div>
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
          {/* 出生日期 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生日期 *</label>
            <div className="grid grid-cols-3 gap-3">
              <select className="input-gold" value={formData.year} onChange={e => handleChange('year', e.target.value)} required>
                <option value="">年</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="input-gold" value={formData.month} onChange={e => handleChange('month', e.target.value)} required>
                <option value="">月</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="input-gold" value={formData.day} onChange={e => handleChange('day', e.target.value)} required>
                <option value="">日</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生时辰</label>
            <select className="input-gold" value={formData.hour} onChange={e => handleChange('hour', e.target.value)}>
              {HOUR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">精确到小时可排出完整时柱</p>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生地点</label>
            <div className="space-y-2">
              <select className="input-gold" value={selectedProvince}
                onChange={e => {
                  const p = e.target.value;
                  setSelectedProvince(p);
                  if (['北京','上海','天津','重庆','香港','澳门'].includes(p)) {
                    handleChange('location', p);
                  } else {
                    handleChange('location', p);
                  }
                }}
              >
                <option value="">选择省份/地区</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {currentProvinceCities.length > 0 && (
                <select className="input-gold" value={formData.location} onChange={e => handleChange('location', e.target.value)}>
                  <option value="">选择城市（可选）</option>
                  {currentProvinceCities.map(c => <option key={c} value={`${selectedProvince}${c}`}>{c}</option>)}
                </select>
              )}
              {!selectedProvince && (
                <input className="input-gold" placeholder="例如：山东聊城 / Beijing" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">性别</label>
            <select className="input-gold" value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
              {GENDER_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">出生时区</label>
            <select className="input-gold" value={formData.timezone} onChange={e => handleChange('timezone', e.target.value)}>
              {TIMEZONE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          <button type="submit" className="btn-gold mt-2" disabled={loading}>
            {loading ? '正在解码...' : '🔮 开始解码'}
          </button>

          <p className="text-xs text-[var(--text-secondary)] text-center opacity-40 mt-4">
            你的出生信息仅用于生成本次报告，不会被存储
          </p>
        </form>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="cosmic-loader mb-8">
            <div className="cosmic-ring cosmic-ring-1" />
            <div className="cosmic-ring cosmic-ring-2" />
            <div className="cosmic-ring cosmic-ring-3" />
            <div className="cosmic-center">✦</div>
          </div>
          <p className="text-[var(--text-accent)] text-lg loading-pulse">正在排盘中...</p>
          <p className="text-[var(--text-secondary)] text-sm mt-3 opacity-60">八字排盘 · 五行推演</p>
        </div>
      )}

      {step === 'report' && baziData && (
        <div className="space-y-10">
          {/* 导航标签 */}
          <div className="sticky top-0 z-40 py-2" style={{ background: 'var(--bg-deep)' }}>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'bazi', label: '🔮 八字命盘' },
                { id: 'energy', label: '📈 能量K线' },
                { id: 'report', label: '📜 深度报告' + (reportText && !reportComplete ? ' ⏳' : '') },
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-[var(--text-accent)] text-[#0a0a0f] font-medium'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-accent)]'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* 顶部操作 */}
          <div className="flex justify-center gap-3">
            {history.length > 0 && (
              <button onClick={() => setShowHistory(true)} className="text-sm text-[var(--text-accent)] hover:text-[var(--text-accent-hover)] transition-colors">
                📋 历史记录 ({history.length})
              </button>
            )}
            <button onClick={handleShare} className="text-sm text-[var(--text-accent)] hover:text-[var(--text-accent-hover)] transition-colors">
              🖼️ 生成分享图
            </button>
            <button onClick={handleShareText} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors">
              📤 复制文字
            </button>
          </div>

          {/* Section 1: 八字命盘 */}
          <section id="section-bazi">
            <BaziCard
              pillars={baziData.pillars}
              ganElements={baziData.ganElements}
              zhiElements={baziData.zhiElements}
              zodiac={baziData.zodiac}
              dayMaster={baziData.dayMaster}
              dayMasterElement={baziData.dayMasterElement}
              nayin={baziData.nayin}
              elementDistribution={baziData.elementDistribution}
              summary={baziData.summary}
            />
          </section>

          <div className="gold-divider max-w-3xl mx-auto" />

          {/* Section 2: 能量K线 */}
          {lifeEnergyData && (
            <section id="section-energy">
              <LifeEnergyChart
                curve={lifeEnergyData.curve.map(p => ({ ...p, type: p.type as 'high' | 'low' | 'mid' }))}
                turningPoints={lifeEnergyData.turningPoints.map(tp => ({ ...tp, significance: tp.significance as 'major' | 'minor' }))}
                startLuckAge={lifeEnergyData.startLuckAge}
                averageEnergy={lifeEnergyData.averageEnergy}
              />
            </section>
          )}

          <div className="gold-divider max-w-3xl mx-auto" />

          {/* Section 3: AI报告（流式） */}
          <section id="section-report">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-2xl">📜</span>
                <h2 className="text-xl font-bold text-[var(--text-accent)] tracking-wider">
                  灵魂解码报告
                  {!reportComplete && reportText && (
                    <span className="inline-block w-2 h-4 bg-[var(--text-accent)] ml-1 animate-pulse" />
                  )}
                </h2>
                <span className="text-2xl">📜</span>
              </div>
              {!reportComplete && reportText ? (
                <p className="text-xs text-[var(--text-secondary)] opacity-60 animate-pulse">AI正在生成中，逐字呈现...</p>
              ) : !reportText ? (
                <p className="text-xs text-[var(--text-secondary)] opacity-60 animate-pulse">AI正在思考，请稍候...</p>
              ) : null}
            </div>

            {/* Meta tags */}
            {reportMeta && (
              <div className="flex flex-wrap gap-3 mb-8 justify-center">
                <span className="tag-pill">生命路径 {reportMeta.lifePathNumber}{reportMeta.isMasterNumber ? '（主数）' : ''}</span>
                {reportMeta.timePeriod && (
                  <span className="tag-pill">{reportMeta.timePeriod.name}·{reportMeta.timePeriod.element}象</span>
                )}
                {reportMeta.cityTags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="tag-pill">{tag}</span>
                ))}
              </div>
            )}

            {/* 报告内容（在生成中实时更新） */}
            {reportText && (
              <div
                className="report-content leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(reportText) }}
              />
            )}

            {/* 生成中占位 */}
            {!reportText && (
              <div className="text-center py-16">
                <div className="cosmic-loader mx-auto mb-6" style={{ width: 80, height: 80 }}>
                  <div className="cosmic-ring cosmic-ring-3" style={{ width: '100%', height: '100%' }} />
                  <div className="cosmic-center text-sm">✦</div>
                </div>
                <p className="text-[var(--text-secondary)] text-sm opacity-60">
                  正在召唤 AI 解码者...
                </p>
              </div>
            )}
          </section>

          {/* 底部操作 */}
          <div className="gold-divider my-12" />
          <div className="text-center space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              报告 ID：{reportId} · 仅供个人参考
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button onClick={handleShare} className="btn-gold flex-1">🖼️ 生成分享图</button>
              <button onClick={handleShareText} className="btn-gold flex-1">📤 复制文字</button>
              <button onClick={handleReset} className="btn-gold flex-1">🔄 重新解码</button>
            </div>
          </div>
        </div>
      )}

      {/* 分享卡片弹窗 */}
      {showShareCard && baziData && (
        <ReportShareCard
          data={{
            pillars: baziData.pillars,
            ganElements: baziData.ganElements,
            zhiElements: baziData.zhiElements,
            zodiac: baziData.zodiac,
            dayMaster: baziData.dayMaster,
            dayMasterElement: baziData.dayMasterElement,
            nayin: baziData.nayin,
            summary: baziData.summary,
            elementDistribution: baziData.elementDistribution,
            averageEnergy: lifeEnergyData?.averageEnergy || 60,
            birthInfo: inputSummary,
          }}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* 历史记录弹窗 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={() => setShowHistory(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-[var(--bg-card)] border border-[var(--gold-light)]/20 rounded-xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[var(--bg-card)] z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--gold-light)]/10">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">📋 历史记录</h3>
              <button onClick={() => setShowHistory(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl leading-none">✕</button>
            </div>
            {history.length === 0 ? (
              <div className="px-5 py-12 text-center text-[var(--text-secondary)] text-sm">暂无历史记录</div>
            ) : (
              <div className="divide-y divide-[var(--gold-light)]/10">
                {history.map(entry => (
                  <button key={entry.id} onClick={() => handleLoadHistory(entry)} className="w-full text-left px-5 py-4 hover:bg-[var(--gold-light)]/5 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{entry.inputSummary}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
                          命盘 {entry.bazi.pillars.filter(p => p !== '--').join(' ')}
                          {entry.meta.cityTags.length > 0 && ` · ${entry.meta.cityTags.slice(0, 2).join(' ')}`}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap mt-0.5 opacity-50">{entry.date}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 简易 Markdown 渲染 */
function renderMarkdown(md: string): string {
  if (!md) return '';
  let html = '';
  const lines = md.split('\n');
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${escapeHtml(line.slice(3))}</h2>`; continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${escapeHtml(line.slice(4))}</h3>`; continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4>${escapeHtml(line.slice(5))}</h4>`; continue;
    }
    if (line.match(/^[-*]\s/)) {
      if (!inList) { html += '<ul>'; inList = true; }
      const content = line.replace(/^[-*]\s/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${escapeHtml(content, false)}</li>`; continue;
    }
    if (line.match(/^\d+\.\s/)) {
      if (!inList) { html += '<ul>'; inList = true; }
      const content = line.replace(/^\d+\.\s/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${escapeHtml(content, false)}</li>`; continue;
    }
    if (line.startsWith('> ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<blockquote>${escapeHtml(line.slice(2))}</blockquote>`; continue;
    }
    if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }

    if (inList) { html += '</ul>'; inList = false; }
    const processed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(201,169,110,0.1);padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>');
    html += `<p>${escapeHtml(processed, false)}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}

function escapeHtml(text: string, full = true): string {
  let s = text.replace(/&/g, '&amp;');
  if (full) {
    s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  return s;
}
