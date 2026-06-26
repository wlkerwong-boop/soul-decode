'use client';

import { useState } from 'react';

const questions = [
  { id: 'color', q: '你的手掌颜色偏什么？', options: ['红黄润泽（正常）', '偏淡白', '偏红/潮红', '偏黄', '偏青紫', '偏暗沉/发黑'] },
  { id: 'temp', q: '手掌温度怎么样？', options: ['温热均匀（正常）', '全掌冰凉', '手心烫手心热', '手心热手背凉'] },
  { id: 'shape', q: '手掌厚薄怎么样？', options: ['厚实饱满（正常）', '瘦薄干瘪', '浮肿松软', '僵硬紧绷', '绵软无力'] },
  { id: 'moisture', q: '手掌干湿情况？', options: ['适中（正常）', '常年干燥起皮', '潮湿多汗', '手心黏腻出汗'] },
  { id: 'nails', q: '指甲月牙（白色半月）有几个？', options: ['8-10个（正常）', '3-7个', '只有拇指有', '0个'] },
  { id: 'fingers', q: '哪根手指感觉异常？', options: ['都正常', '拇指瘦小', '食指弯曲发青', '中指歪斜', '无名指干枯', '小指短小冰凉', '有多根手指异常'] },
  { id: 'veins', q: '手掌青筋（血管）明显吗？', options: ['不明显（正常）', '虎口有青筋', '大鱼际有青筋', '掌心有青筋', '手腕有青筋', '多处都有青筋'] },
  { id: 'other', q: '其他症状（可选，告诉我你的感受）', options: [] },
];

export default function HandDiagnosisPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);

  const current = questions[step];
  if (!current) return null;

  const handleAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [current.id]: answer };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Generate diagnosis
      setLoading(true);
      try {
        const desc = Object.entries(newAnswers)
          .filter(([k, v]) => v && k !== 'other')
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
        const extra = newAnswers.other ? `\n其他: ${newAnswers.other}` : '';

        const res = await fetch('/api/hand-diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: desc + extra,
          }),
        });
        const data = await res.json();
        setDiagnosis(data.diagnosis || '分析生成失败');
      } catch {
        setDiagnosis('网络错误，请重试');
      }
      setLoading(false);
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setDiagnosis(''); };

  return (
    <div className="py-8 md:py-16 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-3xl mb-3">✋</div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">中医手诊</h1>
        <p className="text-sm text-[var(--text-secondary)]">通过手掌特征判断体质类型，获取调理建议</p>
      </div>

      {!diagnosis && !loading && (
        <div className="card-jade p-6 md:p-8">
          <div className="flex gap-2 mb-6">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[var(--text-accent)]' : 'bg-[var(--border-color)]'}`} />
            ))}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">第{step+1}/{questions.length}题</p>
          <h3 className="text-lg font-bold mb-4">{current.q}</h3>
          <div className="space-y-2">
            {current.options.map((opt) => (
              <button key={opt} onClick={() => handleAnswer(opt)}
                className="w-full text-left p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--text-accent)] transition-all text-sm">
                {opt}
              </button>
            ))}
            {current.options.length === 0 && (
              <textarea className="input-jade w-full h-24" placeholder="描述你的其他症状..."
                onBlur={e => {
                  if (e.target.value.trim()) handleAnswer(e.target.value.trim());
                }} />
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-20">
          <div className="cosmic-loader mx-auto mb-4" style={{width:40,height:40}}>
            <div className="cosmic-ring cosmic-ring-3" style={{width:'100%',height:'100%'}}/>
            <div className="cosmic-center text-xs">✋</div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">AI正在根据你的手部特征辨证分析...</p>
        </div>
      )}

      {diagnosis && (
        <div className="card-jade p-6 md:p-8">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">✋</div>
            <h3 className="text-lg font-bold gradient-text">手诊辨证结果</h3>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            {diagnosis}
          </div>
          <div className="text-center mt-4">
            <button onClick={reset} className="btn-jade" style={{width:'auto'}}>重新辨证</button>
          </div>
        </div>
      )}
    </div>
  );
}
