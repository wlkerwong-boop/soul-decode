// HD 引擎装载（v6.6 分钟级）：@fusionstrings/swisseph-wasm 首次 require 时同步初始化（数秒），
// 采用 report-api 同款 hdReady 模式：首次调用触发后台加载并等待就绪，失败则降级返回 null。
import path from 'path';
import { createRequire } from 'node:module';

let hdMod: any = null;
let hdReady = false;
let hdError: string | null = null;
let loading: Promise<boolean> | null = null;

export function ensureHdEngine(): Promise<boolean> {
  if (hdReady) return Promise.resolve(true);
  if (hdError) return Promise.resolve(false);
  if (!loading) {
    loading = new Promise<boolean>((resolve) => {
      setImmediate(() => {
        try {
          // createRequire + 计算路径：对 Turbopack 完全不透明 → 裸 Node 解析，
          // 引擎 cjs 内部的包引用按 Node 原生方式解析 node_modules
          // （字面量/可推断的 require 会被打进 bundle，包名被改写成带哈希的
          // 虚拟外部模块，或构建期报 "server relative imports" 错误）
          const nodeRequire = createRequire(path.join(process.cwd(), 'noop.js'));
          hdMod = nodeRequire(path.join(process.cwd(), 'src', 'lib', 'hd-engine-v6.cjs'));
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
