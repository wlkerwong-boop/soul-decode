// HD 引擎装载（v6.6 分钟级）：本地 CJS 引擎首次动态加载时初始化（数秒），
// 采用 report-api 同款 hdReady 模式：首次调用触发后台加载并等待就绪，失败则降级返回 null。
import path from 'path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

type RuntimeImport = <T = unknown>(specifier: string) => Promise<T>;

function getRuntimeImport(): RuntimeImport {
  return new Function('specifier', 'return import(specifier)') as RuntimeImport;
}

const testRequire = createRequire(import.meta.url);

let hdMod: any = null;
let hdReady = false;
let hdError: string | null = null;
let loading: Promise<boolean> | null = null;

export class HumanDesignEngineError extends Error {
  constructor(cause?: unknown) {
    super('人类图引擎暂时不可用，请稍后重试。');
    this.name = 'HumanDesignEngineError';
    if (cause) this.cause = cause;
  }
}

export function assertHumanDesignResult(result: any): asserts result {
  if (!result || typeof result.type !== 'string' || typeof result.profile !== 'string') {
    throw new HumanDesignEngineError();
  }
}

export function ensureHdEngine(): Promise<boolean> {
  if (hdReady) return Promise.resolve(true);
  if (hdError) return Promise.resolve(false);
  if (!loading) {
    loading = new Promise<boolean>((resolve) => {
      setImmediate(async () => {
        try {
          const enginePath = path.join(process.cwd(), 'src', 'lib', 'hd-engine-v6.cjs');
          // Next 生产环境使用运行时动态 import，避免 Turbopack 改写 CJS 引擎内部依赖。
          // Vitest 的 VM 环境没有 dynamic import callback，测试时使用等价的 require。
          const loaded = process.env.VITEST
            ? Reflect.apply(testRequire, undefined, [enginePath])
            : await getRuntimeImport()(pathToFileURL(enginePath).href);
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
  if (!ok) throw new HumanDesignEngineError(hdError);
  try {
    const result = hdMod.calculateBodygraph(ds, ts, tz, lat, lon);
    assertHumanDesignResult(result);
    return result;
  } catch (error) {
    if (error instanceof HumanDesignEngineError) throw error;
    throw new HumanDesignEngineError(error);
  }
}
