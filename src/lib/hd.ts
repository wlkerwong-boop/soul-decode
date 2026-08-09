// HD 引擎装载（v6.6 分钟级）：本地 CJS 引擎首次动态加载时初始化（数秒），
// 采用 report-api 同款 hdReady 模式：首次调用触发后台加载并等待就绪，失败则降级返回 null。
import path from 'path';
import { pathToFileURL } from 'node:url';

type RuntimeImport = <T = unknown>(specifier: string) => Promise<T>;

function getRuntimeImport(): RuntimeImport {
  return new Function('specifier', 'return import(specifier)') as RuntimeImport;
}

let hdMod: any = null;
let hdReady = false;
let hdError: string | null = null;
let loading: Promise<boolean> | null = null;

export function ensureHdEngine(): Promise<boolean> {
  if (hdReady) return Promise.resolve(true);
  if (hdError) return Promise.resolve(false);
  if (!loading) {
    loading = new Promise<boolean>((resolve) => {
      setImmediate(async () => {
        try {
          // 通过未被构建器静态分析的动态 import，在 Node 运行时加载本地 CJS 引擎。
          // 这样同时兼容 Webpack 与 Turbopack，避免 require 被编译为 void 0，
          // 也避免把引擎内部依赖改写成带哈希的虚拟外部模块。
          const loaded = await getRuntimeImport()(
            pathToFileURL(path.join(process.cwd(), 'src', 'lib', 'hd-engine-v6.cjs')).href,
          );
          hdMod = (loaded as { default?: unknown }).default ?? loaded;
          hdReady = true;
        } catch (e: any) {
          hdError = e?.message || String(e);
          console.error('HD engine load failed:', hdError);
        }
        resolve(hdReady);
      });
    });
  }
  return loading;
}

// 等引擎就绪后计算；未就绪/加载失败返回 null（路由侧按"数据暂缺"降级）
export async function calculateBodygraph(ds: string, ts: string, tz: string, lat: number, lon: number) {
  const ok = await ensureHdEngine();
  if (!ok) return null;
  return hdMod.calculateBodygraph(ds, ts, tz, lat, lon);
}
