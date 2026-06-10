'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CosmicBackground from '@/components/CosmicBackground';

// ── 十问数据结构 ──────────────────────────────────────────────
type QuestionId =
  | 'hanre' | 'han' | 'toushen' | 'bian' | 'yinshi'
  | 'xiongfu' | 'shuimian' | 'ermu' | 'kouke' | 'jishi';

type Question = {
  id: QuestionId;
  title: string;
  label: string;
  multi: boolean;
  options: { value: string; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: 'hanre', title: '一问寒热', label: '您当前的寒热感觉如何？',
    multi: false,
    options: [
      { value: 'w', label: '无特殊' },
      { value: 'pa_leng', label: '怕冷' },
      { value: 'pa_re', label: '怕热' },
      { value: 'hanre_wanglai', label: '寒热往来' },
      { value: 'sj_bingliang', label: '手脚冰凉' },
      { value: 'wx_fanre', label: '五心烦热' },
      { value: 'e_tou_hou_re', label: '额头烫/身热' },
    ],
  },
  {
    id: 'han', title: '二问汗', label: '您的出汗情况如何？（可多选）',
    multi: true,
    options: [
      { value: 'zhengchang', label: '正常' },
      { value: 'zi_han', label: '自汗（不动也出汗）' },
      { value: 'dao_han', label: '盗汗（睡着出汗）' },
      { value: 'bu_chu_han', label: '不易出汗' },
      { value: 'dong_ze_chu_han', label: '动则出汗' },
      { value: 'ju_bu_chu_han', label: '局部出汗（头/手心/腋下）' },
      { value: 'chu_han_hou_pa_feng', label: '出汗后怕风' },
    ],
  },
  {
    id: 'toushen', title: '三问头身', label: '您头身部位有哪些不适？（可多选）',
    multi: true,
    options: [
      { value: 'wu', label: '无不适' },
      { value: 'tou_tong', label: '头痛' },
      { value: 'tou_yun', label: '头晕' },
      { value: 'tou_zhong', label: '头重如裹' },
      { value: 'shen_tong', label: '身痛' },
      { value: 'yao_suan', label: '腰酸/腰痛' },
      { value: 'fa_li', label: '乏力/倦怠' },
      { value: 'jian_bang_tong', label: '肩颈僵硬/酸痛' },
      { value: 'tui_jiao_fa_zhong', label: '下肢沉重/浮肿' },
    ],
  },
  {
    id: 'bian', title: '四问便', label: '您的二便情况如何？（可多选）',
    multi: true,
    options: [
      { value: 'zhengchang', label: '正常' },
      { value: 'bian_mi', label: '便秘' },
      { value: 'tang_xie', label: '溏泻/腹泻' },
      { value: 'bu_cheng_xing', label: '大便不成形' },
      { value: 'gan_jie', label: '大便干结' },
      { value: 'nian_ni', label: '大便黏腻/不爽' },
      { value: 'xiao_bian_qing_chang', label: '小便清长' },
      { value: 'xiao_bian_duan_huang', label: '小便短黄' },
      { value: 'xiao_bian_pin_shu', label: '小便频数' },
      { value: 'ye_niao_duo', label: '夜尿多' },
    ],
  },
  {
    id: 'yinshi', title: '五问饮食', label: '您的饮食口味情况如何？（可多选）',
    multi: true,
    options: [
      { value: 'zhengchang', label: '正常' },
      { value: 'na_dai', label: '纳呆/食欲不振' },
      { value: 'xiao_shi_bu_liang', label: '消化不良/饭后腹胀' },
      { value: 'xi_re_yin', label: '喜热饮/热食' },
      { value: 'xi_leng_yin', label: '喜冷饮/凉食' },
      { value: 'kou_ku', label: '口苦' },
      { value: 'kou_dan', label: '口淡无味' },
      { value: 'kou_nian', label: '口黏腻' },
      { value: 'fan_wei_suan', label: '反胃/反酸' },
      { value: 'e_xin', label: '恶心/想吐' },
    ],
  },
  {
    id: 'xiongfu', title: '六问胸腹', label: '您胸腹部有哪些不适？（可多选）',
    multi: true,
    options: [
      { value: 'wu', label: '无不适' },
      { value: 'xiong_men', label: '胸闷' },
      { value: 'xiong_tong', label: '胸痛' },
      { value: 'xin_huang', label: '心慌/心悸' },
      { value: 'xie_tong', label: '胁肋胀痛' },
      { value: 'fu_zhang', label: '腹胀' },
      { value: 'fu_tong_yi_an', label: '腹痛（喜按）' },
      { value: 'fu_tong_ju_an', label: '腹痛（拒按）' },
      { value: 'shao_fu_zhui_zhang', label: '少腹坠胀' },
    ],
  },
  {
    id: 'shuimian', title: '七问睡眠', label: '您的睡眠情况如何？（可多选）',
    multi: true,
    options: [
      { value: 'zhengchang', label: '正常' },
      { value: 'ru_mian_kun_nan', label: '入睡困难' },
      { value: 'duo_meng', label: '多梦' },
      { value: 'yi_xing', label: '易醒/醒后难入睡' },
      { value: 'zao_xing', label: '早醒' },
      { value: 'hun_chen_chen', label: '昏沉睡/睡眠不深' },
      { value: 'ai_shui', label: '嗜睡/怎么睡都困' },
      { value: 'shi_mian', label: '彻夜不眠' },
    ],
  },
  {
    id: 'ermu', title: '八问耳目', label: '您的耳目情况如何？（可多选）',
    multi: true,
    options: [
      { value: 'zhengchang', label: '正常' },
      { value: 'er_ming', label: '耳鸣' },
      { value: 'er_long', label: '耳聋/听力下降' },
      { value: 'er_tong', label: '耳痛/耳胀' },
      { value: 'mu_xuan', label: '目眩/眼花' },
      { value: 'mu_gan', label: '目干/目涩' },
      { value: 'mu_chi_duo', label: '眼屎多' },
      { value: 'shi_wu_mo_hu', label: '视物模糊' },
    ],
  },
  {
    id: 'kouke', title: '九问口渴', label: '您的口渴饮水情况如何？（可多选）',
    multi: true,
    options: [
      { value: 'zhengchang', label: '正常不渴' },
      { value: 'kou_ke_yu_yin', label: '口渴喜饮' },
      { value: 'kou_ke_bu_yu_yin', label: '口渴不欲饮' },
      { value: 'xi_re_yin', label: '喜热饮' },
      { value: 'xi_leng_yin', label: '喜冷饮' },
      { value: 'kou_gan_she_zao', label: '口干舌燥' },
      { value: 'dan_yu_shui_ran_kou', label: '但欲漱水不想咽' },
    ],
  },
];

// ── 舌象选项 ────────────────────────────────────────────────
const TONGUE_QUALITY_OPTIONS = [
  { value: 'dan_hong', label: '淡红' },
  { value: 'dan_bai', label: '淡白' },
  { value: 'hong_jiang', label: '红绛' },
  { value: 'zi_an', label: '紫暗' },
  { value: 'yu_ban', label: '瘀斑/瘀点' },
];

const TONGUE_COATING_OPTIONS = [
  { value: 'bao_bai', label: '薄白苔' },
  { value: 'bai_ni', label: '白腻苔' },
  { value: 'huang_ni', label: '黄腻苔' },
  { value: 'huang_zao', label: '黄燥苔' },
  { value: 'bo_tai', label: '剥苔/地图舌' },
  { value: 'wu_tai', label: '无苔/镜面舌' },
  { value: 'hou_ni', label: '厚腻苔' },
];

const TONGUE_BODY_OPTIONS = [
  { value: 'chi_hen_you', label: '有齿痕' },
  { value: 'chi_hen_wu', label: '无齿痕' },
  { value: 'lie_wen', label: '有裂纹' },
  { value: 'pang_da', label: '胖大舌' },
  { value: 'shou_xiao', label: '瘦小舌' },
  { value: 'ci_ma_ci', label: '有芒刺' },
];

// ── 脉象选项 ────────────────────────────────────────────────
const PULSE_OPTIONS = [
  { value: 'fu', label: '浮脉' },
  { value: 'chen', label: '沉脉' },
  { value: 'chi', label: '迟脉' },
  { value: 'shuo', label: '数脉' },
  { value: 'hua', label: '滑脉' },
  { value: 'se', label: '涩脉' },
  { value: 'xuan', label: '弦脉' },
  { value: 'xi', label: '细脉' },
  { value: 'ruo', label: '弱脉' },
  { value: 'hong', label: '洪脉' },
  { value: 'dai', label: '代脉' },
  { value: 'jie', label: '结脉' },
  { value: 'cu', label: '促脉' },
  { value: 'zhang', label: '长脉' },
  { value: 'duan', label: '短脉' },
  { value: 'wei', label: '微脉' },
];

// ── 按钮组件 ─────────────────────────────────────────────────
function OptionBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200
        ${
          selected
            ? 'bg-[var(--text-accent)]/15 border-[var(--text-accent)] text-[var(--text-accent)] shadow-[0_0_12px_var(--glow-gold)]'
            : 'bg-black/30 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-accent)]/40 hover:text-[var(--text-primary)]'
        }
      `}
    >
      {children}
    </button>
  );
}

export default function TcmAssessmentPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<QuestionId, string[] | string>>(
    Object.fromEntries(
      QUESTIONS.map((q) => [q.id, q.multi ? [] : ''])
    ) as Record<QuestionId, string[] | string>
  );

  const [tongueQuality, setTongueQuality] = useState<string[]>([]);
  const [tongueCoating, setTongueCoating] = useState<string[]>([]);
  const [tongueBody, setTongueBody] = useState<string[]>([]);
  const [pulse, setPulse] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [pastHistory, setPastHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── 单选/多选处理 ──────────────────────────────────────────
  const toggleOption = (qId: QuestionId, value: string) => {
    setAnswers((prev) => {
      const current = prev[qId];
      if (Array.isArray(current)) {
        // 多选
        if (value === 'zhengchang' || value === 'wu') {
          return { ...prev, [qId]: [value] };
        }
        const filtered = current.filter(
          (v) => v !== 'zhengchang' && v !== 'wu'
        );
        return {
          ...prev,
          [qId]: filtered.includes(value)
            ? filtered.filter((v) => v !== value)
            : [...filtered, value],
        };
      } else {
        // 单选
        return { ...prev, [qId]: current === value ? '' : value };
      }
    });
  };

  const toggleTongue = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const togglePulse = (value: string) => {
    setPulse((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  // ── 提交 ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // 构建十问文本
      const tenQuestions = QUESTIONS.map((q) => {
        const val = answers[q.id];
        const selected = Array.isArray(val)
          ? val
              .map((v) => q.options.find((o) => o.value === v)?.label || v)
              .join('、')
          : q.options.find((o) => o.value === val)?.label || val || '未选择';
        return `【${q.title}】${q.label}\n  回答：${selected || '未选择'}`;
      }).join('\n\n');

      const tongueText = [
        tongueQuality.length
          ? `舌质：${tongueQuality.map((v) => TONGUE_QUALITY_OPTIONS.find((o) => o.value === v)?.label || v).join('、')}`
          : '',
        tongueCoating.length
          ? `舌苔：${tongueCoating.map((v) => TONGUE_COATING_OPTIONS.find((o) => o.value === v)?.label || v).join('、')}`
          : '',
        tongueBody.length
          ? `舌体：${tongueBody.map((v) => TONGUE_BODY_OPTIONS.find((o) => o.value === v)?.label || v).join('、')}`
          : '',
      ]
        .filter(Boolean)
        .join('；');

      const pulseText = pulse.length
        ? `脉象：${pulse.map((v) => PULSE_OPTIONS.find((o) => o.value === v)?.label || v).join('、')}`
        : '';

      const body: Record<string, any> = {
        symptoms: `${tenQuestions}\n\n十问问诊详情已包含以上内容。`,
        tongueAnalysis: tongueText || undefined,
        pulseAnalysis: pulseText || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        medicalHistory: pastHistory.trim() || undefined,
        chiefComplaint: '中医十问问诊',
      };

      const res = await fetch('/api/tcm-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `辨证请求失败 (${res.status})`);
      }

      // 流式读取 SSE 响应
      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取AI返回流');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

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
            if (parsed.done) break;
            if (parsed.content) fullContent += parsed.content;
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e instanceof Error && e.message !== '诊断生成中断，请重试') continue;
            throw e;
          }
        }
      }

      if (!fullContent) {
        throw new Error('AI返回结果为空，请重新提交');
      }

      sessionStorage.setItem('tcm-diagnosis-result', fullContent);
      router.push('/tcm-assessment/result');
    } catch (err: any) {
      setError(err.message || '网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  // ── 渲染 ───────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10 gradient-bg min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* 页头 */}
          <div className="text-center mb-10">
            <Link
              href="/health"
              className="text-sm text-[var(--text-accent)] hover:underline mb-4 inline-block"
            >
              ← 返回健康评测
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              中医十问问诊单
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              请根据您的实际情况逐项回答，信息越完整辨证越精准。标有 <span className="text-red-400">*</span> 的为必填项。
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p>{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="underline mt-1 inline-block hover:text-red-300"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── 十问区块 ────────────────────────────────── */}
            {QUESTIONS.map((q, idx) => {
              const val = answers[q.id];

              return (
                <section
                  key={q.id}
                  className="p-5 md:p-6 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--text-accent)]/15 text-[var(--text-accent)] text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h2 className="text-lg font-bold text-[var(--text-accent)]">
                      {q.title}
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3 ml-8">
                    {q.label}
                    {q.multi && (
                      <span className="text-[var(--text-accent)]/60 ml-1">
                        （可多选）
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const isSelected = Array.isArray(val)
                        ? val.includes(opt.value)
                        : val === opt.value;

                      return (
                        <OptionBtn
                          key={opt.value}
                          selected={isSelected}
                          onClick={() => toggleOption(q.id, opt.value)}
                        >
                          {opt.label}
                        </OptionBtn>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* ── 第十问：既往史（自由文本） ─────────────── */}
            <section className="p-5 md:p-6 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--text-accent)]/15 text-[var(--text-accent)] text-xs font-bold shrink-0">
                  10
                </span>
                <h2 className="text-lg font-bold text-[var(--text-accent)]">
                  十问既往史
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-3 ml-8">
                请描述您的既往病史、过敏史、手术史等
              </p>
              <div className="ml-8">
                <textarea
                  value={pastHistory}
                  onChange={(e) => setPastHistory(e.target.value)}
                  placeholder="例如：高血压病史5年，磺胺类药物过敏，2020年做过阑尾炎手术..."
                  rows={3}
                  className="input-gold resize-y text-sm"
                  disabled={loading}
                />
              </div>
            </section>

            {/* ── 舌象 ────────────────────────────────────── */}
            <section className="p-5 md:p-6 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-[var(--text-accent)] mb-1 flex items-center gap-2">
                👅 舌象诊断
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                请选择与您舌象最相符的选项（可多选）
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    舌质
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TONGUE_QUALITY_OPTIONS.map((opt) => (
                      <OptionBtn
                        key={opt.value}
                        selected={tongueQuality.includes(opt.value)}
                        onClick={() => toggleTongue(setTongueQuality, opt.value)}
                      >
                        {opt.label}
                      </OptionBtn>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    舌苔
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TONGUE_COATING_OPTIONS.map((opt) => (
                      <OptionBtn
                        key={opt.value}
                        selected={tongueCoating.includes(opt.value)}
                        onClick={() => toggleTongue(setTongueCoating, opt.value)}
                      >
                        {opt.label}
                      </OptionBtn>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    舌体特征
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TONGUE_BODY_OPTIONS.map((opt) => (
                      <OptionBtn
                        key={opt.value}
                        selected={tongueBody.includes(opt.value)}
                        onClick={() => toggleTongue(setTongueBody, opt.value)}
                      >
                        {opt.label}
                      </OptionBtn>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 脉象 ────────────────────────────────────── */}
            <section className="p-5 md:p-6 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-[var(--text-accent)] mb-1 flex items-center gap-2">
                ✨ 脉象诊断
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                请选择您最符合的脉象（可多选，如不确定可跳过）
              </p>
              <div className="flex flex-wrap gap-2">
                {PULSE_OPTIONS.map((opt) => (
                  <OptionBtn
                    key={opt.value}
                    selected={pulse.includes(opt.value)}
                    onClick={() => togglePulse(opt.value)}
                  >
                    {opt.label}
                  </OptionBtn>
                ))}
              </div>
            </section>

            {/* ── 补充文本 ────────────────────────────────── */}
            <section className="p-5 md:p-6 rounded-xl border border-[var(--border-color)] bg-black/40 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-[var(--text-accent)] mb-1 flex items-center gap-2">
                📝 补充说明
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                任何以上未覆盖的症状或补充信息，请在此填写
              </p>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="例如：近期做过检查的结果、正在服用的药物、特殊体质的补充说明..."
                rows={4}
                className="input-gold resize-y text-sm"
                disabled={loading}
              />
            </section>

            {/* ── 提交按钮 ────────────────────────────────── */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold max-w-md mx-auto flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>AI正在辨证分析中...</span>
                  </>
                ) : (
                  <span>✦ 提交问诊 ✦</span>
                )}
              </button>
              {loading && (
                <p className="text-xs text-[var(--text-secondary)] mt-3 animate-pulse">
                  正在融合中医通鉴数据库进行辨证分析，请耐心等待...
                </p>
              )}
            </div>
          </form>

          {/* ── 底部导航 ──────────────────────────────────── */}
          <div className="text-center mt-12 pb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href="/health"
              className="text-sm text-[var(--text-accent)] hover:underline"
            >
              📖 健康评测介绍
            </Link>
            <span className="text-[var(--border-color)] hidden sm:inline">|</span>
            <Link
              href="/health/assessment"
              className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              自由描述式辨证
            </Link>
            <span className="text-[var(--border-color)] hidden sm:inline">|</span>
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
