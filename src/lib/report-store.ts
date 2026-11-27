/**
 * 报告存储系统 — 纯前端 localStorage 方案
 * 
 * 用户完成健康评测或八字分析后，报告保存到本地
 * 通过 报告ID + 密码 访问
 * 
 * 接口设计预留 Supabase 兼容，后续迁移只需改这个文件
 */

// 报告类型
export type ReportType = 'health' | 'bazi' | 'mbti' | 'astrology' | 'tcm';

// 报告元数据
export interface ReportMeta {
  id: string;
  type: ReportType;
  title: string;
  date: string;
  summary: string;
}

// 完整报告
export interface Report {
  meta: ReportMeta;
  content: string;  // markdown 格式的报告内容
  password: string; // 查看密码
  ownerId?: string; // 当前登录账号；旧报告没有归属，不在个人中心跨账号展示
}

// 存储结构
interface ReportStore {
  reports: Record<string, Report>; // key = reportId
  password?: string;               // 旧格式兼容字段；不再授予管理员访问权
}

const STORAGE_KEY = 'soulcode-reports';

// 生成短ID
function generateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// 读取存储
function loadStore(): ReportStore {
  if (typeof window === 'undefined') {
    return { reports: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { reports: data.reports || {} };
    }
  } catch (e) {
    console.error('Failed to load reports:', e);
  }
  return { reports: {} };
}

// 写入存储
function saveStore(store: ReportStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save reports:', e);
  }
}

// 获取报告类型的中文名
export function getReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    health: '身心同调·健康评测',
    bazi: '八字命理·深度解读',
    mbti: 'MBTI性格测试',
    astrology: '星座占星·AI解读',
    tcm: '中医辨证·诊断报告',
  };
  return labels[type] || type;
}

// 保存报告
export function saveReport(
  content: string,
  type: ReportType,
  title: string,
  password: string,
  existingId?: string,
  ownerId?: string,
): Report {
  const store = loadStore();
  const id = existingId || generateId();

  const report: Report = {
    meta: {
      id,
      type,
      title,
      date: new Date().toISOString(),
      summary: content.replace(/<[^>]+>/g, '').replace(/#{1,6}\s/g, '').slice(0, 80) + '...',
    },
    content,
    password,
    ownerId,
  };

  store.reports[id] = report;
  saveStore(store);
  return report;
}

// 验证并获取报告
export function getReport(id: string, password: string): Report | null {
  const store = loadStore();
  const report = store.reports[id];
  if (!report) return null;
  if (report.password !== password) return null;
  return report;
}

// 获取用户的所有报告列表（需要密码）
export function getUserReports(password: string): ReportMeta[] {
  const store = loadStore();
  return Object.values(store.reports)
    .filter(r => r.password === password)
    .map(r => r.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 管理员获取所有报告
export function getAllReports(ownerId: string): ReportMeta[] {
  const store = loadStore();
  return Object.values(store.reports)
    .filter(r => r.ownerId === ownerId)
    .map(r => r.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
