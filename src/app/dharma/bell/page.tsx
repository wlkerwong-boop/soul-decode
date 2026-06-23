'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const TRACKS = [
  // ── 职场金刚 ──
  {
    id: '01-morning-office',
    icon: '🌅',
    title: '早晨初醒版',
    desc: '睁开眼的第一件事：觉察感受，选择放下',
    group: 'office',
    voice: '职场金刚 · 温柔坚定女声',
    audience: '上班族通用',
    time: '⏰ 6:30 起床',
    duration: '~30秒',
    chapter: '晨间释放',
    colors: { bg: 'rgba(74,124,111,0.06)', border: 'rgba(74,124,111,0.2)', btn: '#4a7c6f' },
  },
  {
    id: '04-commute-office',
    icon: '🚶',
    title: '通勤开工铃',
    desc: '日间三问释放播种：觉察→放下→种种子',
    group: 'office',
    voice: '职场金刚 · 温柔坚定女声',
    audience: '上班族通用',
    time: '⏰ 9:30 开工',
    duration: '~30秒',
    chapter: '日间释放',
    colors: { bg: 'rgba(74,124,111,0.06)', border: 'rgba(74,124,111,0.2)', btn: '#4a7c6f' },
  },
  {
    id: '05-afternoon-office',
    icon: '☕',
    title: '午后疲惫释放铃',
    desc: '能量下降时温柔待己，不抗拒、不挣扎',
    group: 'office',
    voice: '职场金刚 · 温柔坚定女声',
    audience: '上班族通用',
    time: '⏰ 15:00 茶歇',
    duration: '~30秒',
    chapter: '日间释放',
    colors: { bg: 'rgba(74,124,111,0.06)', border: 'rgba(74,124,111,0.2)', btn: '#4a7c6f' },
  },
  {
    id: '09-sleep-general',
    icon: '🌙',
    title: '睡前通用版',
    desc: '无着咖啡冥想：回想善行，放下执着',
    group: 'office',
    voice: '职场金刚 · 温柔坚定女声',
    audience: '上班族通用',
    time: '⏰ 22:00 睡前',
    duration: '~35秒',
    chapter: '睡前冥想',
    colors: { bg: 'rgba(74,124,111,0.06)', border: 'rgba(74,124,111,0.2)', btn: '#4a7c6f' },
  },
  // ── 居家菩提 ──
  {
    id: '02-morning-home',
    icon: '🌄',
    title: '早晨慈心版',
    desc: '在家人醒来前先照看自己的心',
    group: 'home',
    voice: '居家菩提 · 温暖母性女声',
    audience: '居家父母',
    time: '⏰ 6:30 起床',
    duration: '~25秒',
    chapter: '晨间释放',
    colors: { bg: 'rgba(201,168,142,0.06)', border: 'rgba(201,168,142,0.2)', btn: '#c9a88e' },
  },
  {
    id: '06-housework-home',
    icon: '🧹',
    title: '家务转念铃',
    desc: '洗碗扫地皆是修行，把琐事化为道场',
    group: 'home',
    voice: '居家菩提 · 温暖母性女声',
    audience: '居家父母',
    time: '⏰ 10:00 家务',
    duration: '~30秒',
    chapter: '日间释放',
    colors: { bg: 'rgba(201,168,142,0.06)', border: 'rgba(201,168,142,0.2)', btn: '#c9a88e' },
  },
  {
    id: '07-parenting-home',
    icon: '👶',
    title: '亲子互动铃',
    desc: '放下控制，用无条件的爱种下最纯粹的种子',
    group: 'home',
    voice: '居家菩提 · 温暖母性女声',
    audience: '居家父母',
    time: '⏰ 16:00 亲子',
    duration: '~25秒',
    chapter: '日间释放',
    colors: { bg: 'rgba(201,168,142,0.06)', border: 'rgba(201,168,142,0.2)', btn: '#c9a88e' },
  },
  {
    id: '10-sleep-home',
    icon: '✨',
    title: '睡前自我滋养版',
    desc: '回看今日被爱的瞬间，放下辛苦认同',
    group: 'home',
    voice: '居家菩提 · 温暖母性女声',
    audience: '居家父母',
    time: '⏰ 22:00 睡前',
    duration: '~25秒',
    chapter: '睡前冥想',
    colors: { bg: 'rgba(201,168,142,0.06)', border: 'rgba(201,168,142,0.2)', btn: '#c9a88e' },
  },
  // ── 银发禅心 ──
  {
    id: '03-morning-elder',
    icon: '🎋',
    title: '早晨禅心版',
    desc: '缓缓醒来，全然接纳当下的身体感受',
    group: 'elder',
    voice: '银发禅心 · 浑厚沉稳男声',
    audience: '长者',
    time: '⏰ 6:00 起床',
    duration: '~25秒',
    chapter: '晨间释放',
    colors: { bg: 'rgba(160,140,120,0.06)', border: 'rgba(160,140,120,0.2)', btn: '#a08c78' },
  },
  {
    id: '08-afternoon-elder',
    icon: '🍵',
    title: '午后养心铃',
    desc: '静坐饮茶，看念头如茶叶沉浮，放下即自在',
    group: 'elder',
    voice: '银发禅心 · 浑厚沉稳男声',
    audience: '长者',
    time: '⏰ 14:00 午后',
    duration: '~20秒',
    chapter: '日间释放',
    colors: { bg: 'rgba(160,140,120,0.06)', border: 'rgba(160,140,120,0.2)', btn: '#a08c78' },
  },
];

type GroupFilter = 'all' | 'office' | 'home' | 'elder';

const GROUPS: { key: GroupFilter; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '🎧' },
  { key: 'office', label: '职场金刚', icon: '💼' },
  { key: 'home', label: '居家菩提', icon: '🏠' },
  { key: 'elder', label: '银发禅心', icon: '🧘' },
];

const PRACTICE_GUIDE = [
  {
    title: '圣多纳释放法',
    steps: [
      '我现在有什么感受？',
      '我可以允许它存在吗？',
      '我可以放下它吗？',
      '我愿意放下它吗？',
      '我什么时候放下？',
    ],
  },
  {
    title: '金刚种子智慧',
    steps: [
      '想要什么？',
      '找到同样想要的人',
      '帮助他获得',
      '在轻松中播种',
    ],
  },
  {
    title: '无着咖啡冥想',
    steps: [
      '回想今日善行',
      '感受美好温暖',
      '放下执着回报',
      '放下控制欲望',
      '在温暖中入睡',
    ],
  },
];

const SCHEDULE_TABS = [
  {
    key: 'office',
    label: '💼 上班族',
    items: [
      { time: '6:30', icon: '🌅', title: '晨间释放', track: '01-morning-office', note: '醒后第一件事' },
      { time: '9:30', icon: '🚶', title: '开工三问', track: '04-commute-office', note: '通勤/到工位' },
      { time: '15:00', icon: '☕', title: '午后释放', track: '05-afternoon-office', note: '下午茶歇' },
      { time: '22:00', icon: '🌙', title: '咖啡冥想', track: '09-sleep-general', note: '睡前' },
    ],
  },
  {
    key: 'home',
    label: '🏠 居家者',
    items: [
      { time: '6:30', icon: '🌄', title: '慈心晨起', track: '02-morning-home', note: '家人起床前' },
      { time: '10:00', icon: '🧹', title: '家务转念', track: '06-housework-home', note: '收拾家务时' },
      { time: '16:00', icon: '👶', title: '亲子互动', track: '07-parenting-home', note: '与孩子相处' },
      { time: '22:00', icon: '✨', title: '睡前滋养', track: '10-sleep-home', note: '睡前' },
    ],
  },
  {
    key: 'elder',
    label: '🧘 长者/简约版',
    items: [
      { time: '6:00', icon: '🎋', title: '禅心晨起', track: '03-morning-elder', note: '醒后缓缓起身' },
      { time: '14:00', icon: '🍵', title: '午后养心', track: '08-afternoon-elder', note: '静坐饮茶' },
      { time: '22:00', icon: '🌙', title: '睡前通用', track: '09-sleep-general', note: '睡前' },
    ],
  },
];

const PLATFORM_GUIDE = [
  {
    platform: 'iPhone',
    steps: [
      '在App Store下载「库乐队」（GarageBand，免费）',
      '将WAV文件通过「文件」App导入库乐队',
      '在库乐队中长按音频→「导出」→「电话铃声」',
      '打开「时钟」→「闹钟」→「铃声」，选择导入的铃声',
    ],
    icon: '🍎',
  },
  {
    platform: 'Android',
    steps: [
      '将WAV文件复制到手机内部存储的 Ringtones 或 Alarms 文件夹',
      '打开「时钟」→「闹钟」→编辑或新建闹钟',
      '在铃声设置中选择「本地音乐」或「本地铃声」',
      '找到对应的音频文件，选定即可',
    ],
    icon: '🤖',
  },
];

export default function BellPage() {
  const [filter, setFilter] = useState<GroupFilter>('all');
  const [scheduleTab, setScheduleTab] = useState('office');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = filter === 'all' ? TRACKS : TRACKS.filter(t => t.group === filter);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    // Stop previous, start new
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(`/audio/voice-pack/${id}.wav`);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
    setPlayingId(id);
  };

  const downloadAll = () => {
    // Trigger sequential downloads
    TRACKS.forEach(t => {
      const a = document.createElement('a');
      a.href = `/audio/voice-pack/${t.id}.wav`;
      a.download = `${t.id}.wav`;
      a.click();
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* ── 导航 ── */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="gradient-text text-xl font-bold tracking-wider">✦ 灵魂解码</Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] overflow-x-auto scrollbar-hide whitespace-nowrap -mb-1 px-2">
            <Link href="/my" className="hover:text-[var(--text-accent)] transition-colors">📁 档案</Link>
            <Link href="/health" className="hover:text-[var(--text-accent)] transition-colors">身心健康</Link>
            <Link href="/mbti" className="hover:text-[var(--text-accent)] transition-colors">MBTI性格</Link>
            <Link href="/tcm" className="hover:text-[var(--text-accent)] transition-colors">中医通鉴</Link>
            <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors">☸ 法藏</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-10 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <span className="tag-pill text-xs tracking-widest">🔔 圣多纳释放法 × 金刚种子智慧</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          当下菩提
          <br />
          <span className="gradient-text">正念铃音</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-6">
          将觉察设计成一种习惯回路。融合圣多纳释放法与金刚种子智慧，<br className="hidden sm:inline" />
          覆盖晨起、日间、睡前全时段的正念提醒。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="tag-pill">🔮 觉察感受</span>
          <span className="tag-pill">🪷 允许存在</span>
          <span className="tag-pill">🍃 选择放下</span>
          <span className="tag-pill">🌱 播种善种</span>
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto mb-10" />

      {/* ── 修行理念 ── */}
      <section className="px-6 pb-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">三位一体的日常修行</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {PRACTICE_GUIDE.map((p) => (
            <div key={p.title} className="card-jade p-6">
              <h3 className="text-base font-bold text-[var(--text-accent)] mb-4">{p.title}</h3>
              <ol className="space-y-2">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--bg-highlight)] text-[var(--text-accent)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto mb-10" />

      {/* ── 时刻表 ── */}
      <section className="px-6 pb-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">修行时刻表</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-6">为你量身定制的时间方案</p>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {SCHEDULE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setScheduleTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                scheduleTab === t.key
                  ? 'bg-[var(--text-accent)] text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-accent)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {SCHEDULE_TABS.find(t => t.key === scheduleTab)?.items.map((item) => {
            const track = TRACKS.find(t => t.id === item.track);
            return (
              <div
                key={item.time}
                className="card-jade p-4 flex items-center gap-4"
              >
                <div className="text-3xl w-12 text-center shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base">{item.time}</span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">{item.note}</div>
                </div>
                <button
                  onClick={() => handlePlay(item.track)}
                  className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: playingId === item.track ? 'var(--text-accent)' : 'var(--bg-highlight)',
                    color: playingId === item.track ? '#fff' : 'var(--text-accent)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  {playingId === item.track ? '⏹ 暂停' : '▶ 试听'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto mb-10" />

      {/* ── 语音列表 ── */}
      <section className="px-6 pb-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">语音列表</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
          10段修行语音，覆盖全天 · 三套音色
        </p>

        {/* 筛选按钮 */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === g.key
                  ? 'bg-[var(--text-accent)] text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-accent)]'
              }`}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* 语音卡片列表 */}
        <div className="space-y-3">
          {filtered.map((track) => (
            <div
              key={track.id}
              className="card-jade p-4 flex items-center gap-4 hover:border-[var(--border-accent)] transition-all"
            >
              <div className="text-3xl w-12 text-center shrink-0">{track.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{track.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{track.desc}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="tag-pill text-xs">{track.voice}</span>
                  <span className="tag-pill text-xs">{track.audience}</span>
                  <span className="tag-pill text-xs">{track.duration}</span>
                  <span className="tag-pill text-xs">{track.time}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handlePlay(track.id)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: playingId === track.id ? track.colors.btn : 'var(--bg-highlight)',
                    color: playingId === track.id ? '#fff' : track.colors.btn,
                    border: `1px solid ${track.colors.border}`,
                  }}
                >
                  {playingId === track.id ? '⏹' : '▶'} 试听
                </button>
                <a
                  href={`/audio/voice-pack/${track.id}.wav`}
                  download
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'transparent',
                    color: track.colors.btn,
                    border: `1px solid ${track.colors.border}`,
                  }}
                >
                  ⬇ 下载
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 全部下载 */}
        <div className="text-center mt-8">
          <button
            onClick={downloadAll}
            className="px-8 py-3 rounded-xl font-bold text-sm tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, #4a7c6f, #3a6a5e)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(74,124,111,0.25)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(74,124,111,0.35)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(74,124,111,0.25)'; }}
          >
            ⬇ 逐一下载全部（10首）
          </button>
          <p className="text-xs text-[var(--text-secondary)] mt-2">点击后浏览器会逐个下载每首音频</p>
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto mb-10" />

      {/* ── 专属定制 ── */}
      <div className="max-w-5xl mx-auto px-6 mb-10">
        <div
          className="card-jade p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(74,124,111,0.04), rgba(201,160,110,0.04))',
            borderColor: 'rgba(201,160,110,0.2)',
          }}
        >
          <div className="text-5xl mb-4">🎙️</div>
          <h2 className="text-2xl font-bold mb-2">专属声音定制</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mb-6">
            上传你自己、老师或长辈的一段录音，AI将克隆这个声音，
            以TA的音色重新生成全套修行引导语音。
          </p>
          <Link
            href="/dharma/bell/clone"
            className="inline-block px-8 py-3 rounded-xl font-bold text-sm tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9a06e, #b8905e)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(201,160,110,0.25)',
            }}
          >
            🚀 开始定制专属铃音
          </Link>
        </div>
      </div>

      {/* ── 设置指南 ── */}
      <section className="px-6 pb-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">设置指南</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-6">四步开启你的修行之旅</p>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { step: '1', icon: '⬇', title: '下载语音', desc: '点击上方▼按钮下载WAV音频，或逐个试听选择喜欢的段落' },
            { step: '2', icon: '📋', title: '选择方案', desc: '根据身份（上班族/居家/长者）选择对应的时刻表方案' },
            { step: '3', icon: '⏰', title: '设置闹钟', desc: '根据下方平台指引导入手机，设为多个时段的闹铃' },
            { step: '4', icon: '🪷', title: '坚持修行', desc: '每日跟随铃音提示，形成觉察的习惯回路' },
          ].map((item) => (
            <div key={item.step} className="card-jade p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-highlight)] flex items-center justify-center text-lg mx-auto mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm mb-1">{item.step}. {item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 平台指引 */}
        <div className="grid md:grid-cols-2 gap-5">
          {PLATFORM_GUIDE.map((p) => (
            <div key={p.platform} className="card-jade p-6">
              <h3 className="text-base font-bold mb-4">{p.icon} {p.platform}设置步骤</h3>
              <ol className="space-y-3">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--bg-highlight)] text-[var(--text-accent)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* 进阶说明 */}
        <div className="card-jade p-6 mt-5">
          <h3 className="text-base font-bold mb-3 text-[var(--text-accent)]">📖 进阶说明</h3>
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">语音设计理念：</strong>每段语音分为三个层次——①标志性音效（磬声/风铃）帮助大脑建立条件反射（闻声即觉）；②耳语式提问引导觉察，重点突出"允许"、"放下"、"种子"三个关键词；③背景大自然声（森林鸟鸣/溪水/细雨）营造放松氛围，让身心自然沉淀。</p>
            <p><strong className="text-[var(--text-primary)]">🎵 2025年6月19日增强版：</strong>每段语音现已增加前奏磬声/风铃音效（晨间-磬声+风铃叠奏，日间-风铃轻响，晚间-深长颂钵），并配以背景大自然环境声（晨间-森林鸟鸣，午后-溪水潺潺/细雨轻柔，晚间-细雨/溪水）。音量经过精心平衡，不干扰引导语的清晰度。</p>
            <p><strong className="text-[var(--text-primary)]">自利利他的分享：</strong>在每次提醒结束时，将这份轻松在心里送给一个可能正在烦恼的人。你送出什么，便得到什么。</p>
            <p><strong className="text-[var(--text-primary)]">技术说明：</strong>音频由清华/OpenBMB团队开发的VoxCPM2语音合成模型生成，48kHz录音室品质。三套音色（职场金刚·居家菩提·银发禅心）均使用音色设计模式，无需任何参考录音。</p>
            <p><strong className="text-[var(--text-primary)]">重要提醒：</strong>闹铃声建议设置在30秒以内，太长会让人厌烦。每天设置3-5个闹钟足够，太多会变成打扰。可根据个人作息自由调整时间。</p>
          </div>
        </div>
      </section>

      {/* ── 底部 ── */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--text-secondary)]">
          <p>🔔 当下菩提·正念铃音 · 圣多纳释放法 × 金刚种子智慧</p>
          <p className="mt-1">以声为镜，念念觉知 · 免费流通 · 自利利他</p>
          <p className="mt-2">
            <Link href="/dharma" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              ← 返回法藏
            </Link>
            <span className="mx-3">·</span>
            <Link href="/" className="hover:text-[var(--text-accent)] transition-colors opacity-60 hover:opacity-100">
              返回首页
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
