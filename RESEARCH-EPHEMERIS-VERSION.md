# Swiss Ephemeris 版本差异研究报告

## 执行摘要

调查了 `@fusionstrings/swisseph-wasm` (v0.1.5) 是否支持不同的星历文件，并与鼎新图 (TopBazi) 对齐。

**核心发现：** `@fusionstrings/swisseph-wasm` **完全不能加载任何 .se1 星历文件**（无论是 DE406 还是 DE431 版本）。它只能使用内置的 Moshier 半解析星历（精度约 1 角秒）。如果您需要匹配使用 DE406 或 DE431 压缩文件的系统，**必须更换 WASM 包**。

---

## 1. `@fusionstrings/swisseph-wasm` (v0.1.5) 能力分析

### 导出函数（完整列表）

通过检查已安装的 npm 包确定：

| 函数 | 描述 |
|----------|-------------|
| `swe_calc_ut(tjd_ut, ipl, iflag)` | 行星位置 |
| `swe_julday(y, m, d, h, gregflag)` | 日期 → 儒略日 |
| `swe_revjul(tjd, gregflag)` | 儒略日 → 日期 |
| `swe_fixstar_ut(star, tjd, iflag)` | 恒星位置 |
| `swe_pheno_ut(tjd, ipl, iflag)` | 行星现象 |
| `swe_set_topo(lon, lat, alt)` | 设置地面位置 |
| `swe_set_sid_mode(mode, t0, ayan_t0)` | 设置恒星模式 |
| `swe_get_ayanamsa_ut(tjd)` | 获取岁差值 |
| `swe_get_planet_name(ipl)` | 行星名称 |
| `swe_sidtime(tjd)` | 恒星时 |

### 未导出函数（缺失）

**❌** `swe_set_ephe_path(path)` — 无法设置星历文件路径
**❌** `swe_close()` — 无法释放资源
**❌** `swe_houses()` / `swe_houses_ex()` — **无法计算宫位**
**❌** `swe_set_jpl_file()` — 无法加载 JPL 星历
**❌** `swe_version()` — 无法获取版本
**❌** 任何加载外部 .se1 文件的函数

### 根本原因：C 标准 I/O 被 stub 化

Rust `swisseph-wasm` crate 的源码分析显示：

```
#[cfg(target_arch = "wasm32")]
// 所有 C stdio 函数都被 stub 化，返回零/null:
fopen   → stub (returns null)
fclose  → stub (returns 0)
fread   → stub (returns 0)
fwrite  → stub (returns 0)
fgets   → stub (returns null)
...
```

该包使用 **`wasm-bindgen`**（不是 Emscripten），采用 `#![no_std]` 模式构建。没有虚拟文件系统可用，因此 Swiss Ephemeris C 代码无法读取任何 .se1 文件。

### 实际效果

在 `hd-engine-v6.cjs` 中，调用方式如下：

```javascript
var r = sw.swe_calc_ut(jd, pid, 4);   // flag=4 = SEFLG_MOSEPH
```

标志值为 `4`（`SEFLG_MOSEPH`），显式选择 Moshier 星历。虽然 `SEFLG_SWIEPH`（值 2）在 constants.js 中已定义，但**使用它没有任何效果**——WASM 无法加载 .se1 文件。

---

## 2. DE406 与 DE431 星历文件区别

### 时间线

| Swiss Ephemeris 版本 | 发布时间 | 基础 JPL 星历 |
|----------------------|----------|---------------------|
| v1.x（原始版本） | 1997 | **DE405/406** |
| v2.00 及更新版本 | 2014年2月至今 | **DE431** |

来源：[Astrodienst Swiss Ephemeris info](https://www.astro.com/swisseph/swephinfo_e.htm)

### 文件命名约定

文件名（如 `seas_18.se1`）**不**表示 DE 版本。数字编码表示世纪覆盖范围：

| 文件 | 覆盖范围 |
|------|---------|
| `sepl_12.se1` / `semo_12.se1` / `seas_12.se1` | 1200–1800 AD |
| `sepl_18.se1` / `semo_18.se1` / `seas_18.se1` | 1800–2400 AD |

- `sepl` = 行星星历（水星 → 冥王星）
- `semo` = 月球星历
- `seas` = 小行星星历（谷神星、智神星、灶神星、婚神星、凯龙星、福鲁斯）

### 实际精度差异

Swiss Ephemeris v2.0 发行说明中引用的内容：
> "DE406 和 DE431 在 20 世纪和 21 世纪的差异非常小。您可以继续使用旧星历文件。" — [swisseph 邮件列表](https://groups.io/g/swisseph/topic/swiss_ephemeris_v_2_0/27494773)

在 1900-2100 年期间，典型的位置差异约为 **0.01-0.1 角秒**——对于 0.5°（1800 角秒）的闸门边界来说，这通常不足以导致闸门偏移。但如果行星恰好位于闸门边界附近（≤0.1° 内），则可能产生影响。

---

## 3. 当前引擎分析

### hd-engine-v6.cjs（当前代码）

```
sw.swe_calc_ut(jd, pid, 4)
  ^                          ^
  |                          flag=4 = SEFLG_MOSEPH
  @fusionstrings/swisseph-wasm
```

- **使用 Moshier 星历**（内置，无文件）
- 精度：行星 ~1 角秒，月球 ~3 角秒
- 无需外部文件
- 注意：`@it-healer/human-design-calculator` 有自己的 `ephemeris.js`，依赖于原生 `swisseph` 包（**不是** WASM），但 `hd-engine-v6.cjs` 绕过它，直接调用 WASM 函数。

### 可能解释结果差异的原因

如果鼎新图使用以下方式，差异可能来自：

1. **原生 `swisseph` + .se1 文件**（基于 DE406 或 DE431）——精度高于 Moshier
2. **不同的 ΔT（Delta T）值**——影响行星经度计算
3. **不同的岁差模型**——影响恒星黄道位置
4. **不同的进动/章动模型**——影响视位置

---

## 4. 匹配鼎新图的推荐方案

### 方案 A：切换到 `@swisseph/browser`（推荐 WASM 方案）

`@swisseph/browser` 包：
- 使用 **Emscripten WASM**，附带虚拟文件系统
- 明确支持 `loadStandardEphemeris()` 和自定义 `loadEphemerisFiles()`
- 包含宫位计算（`calculateHouses()`）
- 可以在浏览器和 Node.js 中运行

**用法：**
```typescript
import { SwissEphemeris, Planet, CalculationFlag } from '@swisseph/browser';

const swe = new SwissEphemeris();
await swe.init();

// 选项 A：加载基于 DE431 的最新标准星历
await swe.loadStandardEphemeris();  // 从 jsDelivr CDN 加载 (~2MB)

// 选项 B：加载特定版本的 .se1 文件以匹配鼎新图
await swe.loadEphemerisFiles([
  { name: 'sepl_18.se1', url: 'https://your-cdn.com/ephe/sepl_18.se1' },
  { name: 'semo_18.se1', url: 'https://your-cdn.com/ephe/semo_18.se1' },
  { name: 'seas_18.se1', url: 'https://your-cdn.com/ephe/seas_18.se1' },
]);

// 使用瑞士星历计算
const sun = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.SwissEphemeris);
```

为了匹配鼎新图，您需要：
1. 确定鼎新图使用的是 DE406 还是 DE431 时代的 .se1 文件
2. 提供相应版本的 .se1 文件（通过 CDN 或打包）
3. 使用 `loadEphemerisFiles()` 加载它们

### 方案 B：使用原生 `sweph`（仅限服务端，不兼容 Vercel）

如果鼎新图运行在 Node.js 服务端：

```javascript
const swe = require('sweph');
swe.swe_set_ephe_path('/path/to/ephe/');
// swe 现在将加载 .se1 文件
```

### 方案 C：自行构建包含嵌入星历的 WASM

使用 [u-blusky/sweph-wasm](https://github.com/u-blusky/sweph-wasm) 方法：
- 基于 Emscripten
- 在 `ast ro.data` 虚拟文件系统中嵌入 .se1 文件
- 可以嵌入任何版本的 .se1 文件

---

## 5. 验证与调试建议

要准确判断鼎新图使用的版本：

1. **比较特定日期的行星经度：**
   - 选择一个行星接近闸门边界的日期（例如，任何行星在 0°/58° 附近，即 HD 黄道偏移）
   - 使用 `@swisseph/browser` + `loadStandardEphemeris()`（DE431）
   - 与鼎新图结果进行比较

2. **检查 `SE_DE_NUMBER` 常量：**
   在 `constants.js` 中：
   ```javascript
   exports.SE_DE_NUMBER = 431;  // 硬编码为 DE431
   ```
   这反映了 Swiss Ephemeris v2.0+ 的基础，但在 WASM 构建中**没有功能效果**。

3. **测试 Moshier 与 Swiss Ephemeris 的偏差：**
   - Moshier 精度约 1 角秒
   - 瑞士星历文件精度约 0.001 角秒
   - 在闸门边界附近，这种差异可能会导致不同的结果

---

## 总结

| 问题 | 答案 |
|--------|--------|
| `@fusionstrings/swisseph-wasm` 支持不同的星历文件吗？ | **不支持**——无法加载任何 .se1 文件 |
| 可以配置为使用 DE406 吗？ | **不行**——Moshier 是唯一选项 |
| `swe_set_ephe_path()` 可用吗？ | **不**——未导出 |
| 有其他 WASM 方案吗？ | **有**——`@swisseph/browser` 支持通过虚拟文件系统加载 .se1 文件 |
| 鼎新图使用什么？ | 可能使用原生 `swisseph` + DE406 或 DE431 时代的 .se1 文件 |

**建议：** 将 `@fusionstrings/swisseph-wasm` 替换为 `@swisseph/browser`，它可以加载特定的 .se1 文件以匹配鼎新图的结果。包含 `calculateHouses()`，这对于人类图计算也至关重要。
