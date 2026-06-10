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
}

// 存储结构
interface ReportStore {
  reports: Record<string, Report>; // key = reportId
  password: string;                // 管理员密码（用于普光/普明预设数据）
}

const STORAGE_KEY = 'soulcode-reports';
const ADMIN_PASSWORD = '8888';

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
    return { reports: {}, password: ADMIN_PASSWORD };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { reports: data.reports || {}, password: data.password || ADMIN_PASSWORD };
    }
  } catch (e) {
    console.error('Failed to load reports:', e);
  }
  return { reports: {}, password: ADMIN_PASSWORD };
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
  if (report.password !== password && password !== store.password) return null;
  return report;
}

// 管理员直接获取报告（不验证密码）
export function getReportAdmin(id: string): Report | null {
  const store = loadStore();
  return store.reports[id] || null;
}

// 获取用户的所有报告列表（需要密码）
export function getUserReports(password: string): ReportMeta[] {
  const store = loadStore();
  const isAdmin = password === store.password;
  return Object.values(store.reports)
    .filter(r => isAdmin || r.password === password)
    .map(r => r.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 管理员获取所有报告
export function getAllReports(): ReportMeta[] {
  const store = loadStore();
  return Object.values(store.reports)
    .map(r => r.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 检查是否为管理员密码
export function isAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// 预设普光/普明的案例数据（管理员可见）
export function getPresetCases(password: string): ReportMeta[] {
  if (password !== ADMIN_PASSWORD) return [];
  return [
    {
      id: 'ADMIN-001',
      type: 'health',
      title: '普光·四圣心源辨证',
      date: '2026-06-09T20:00:00Z',
      summary: '脾肾阳虚、水寒土湿木郁、上热下寒格局。温潜黄芽天魂汤...',
    },
    {
      id: 'ADMIN-002',
      type: 'health',
      title: '普明·围绝经期辨证',
      date: '2026-06-09T21:00:00Z',
      summary: '脾肾两虚、肝郁血虚、围绝经期综合征。补中益气汤合六味...',
    },
    {
      id: 'ADMIN-003',
      type: 'bazi',
      title: '普光·八字深层分析',
      date: '2026-06-09T22:00:00Z',
      summary: '壬戌年 壬寅月 己亥日 癸丑时。水寒土湿，中气不足...',
    },
    {
      id: 'ADMIN-004',
      type: 'bazi',
      title: '普明·八字深层分析',
      date: '2026-06-09T22:30:00Z',
      summary: '辛酉年 辛卯月 丙午日 戊子时。金木交战，火旺水弱...',
    },
  ];
}
