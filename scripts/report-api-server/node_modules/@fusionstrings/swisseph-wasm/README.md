# swisseph-wasm 🌌

**High-precision, WebAssembly bindings for the Swiss Ephemeris.**

> - 🚀 **Best-in-Class**: Faster, smaller, and more accurate than pure JS
>   implementations.
> - 🛡️ **Safe**: Rust-based memory safety for FFI interactions.
> - 📦 **Universal**: Works in Node.js, Deno, Bun, and Browsers.

[![JSR](https://jsr.io/badges/@fusionstrings/swisseph-wasm)](https://jsr.io/@fusionstrings/swisseph-wasm)
[![npm](https://img.shields.io/npm/v/@fusionstrings/swisseph-wasm)](https://www.npmjs.com/package/@fusionstrings/swisseph-wasm)
[![Crates.io](https://img.shields.io/crates/v/swisseph-wasm)](https://crates.io/crates/swisseph-wasm)
[![CI](https://github.com/fusionstrings/swisseph-wasm/actions/workflows/ci.yml/badge.svg)](https://github.com/fusionstrings/swisseph-wasm/actions/workflows/ci.yml)

## Features

- **Full Swiss Ephemeris**: Wraps the complete C library (v2.10.03).
- **Zero Dependencies**: Generated WASM has no external runtime deps.
- **Type-Safe**: Complete TypeScript definitions.
- **Isomorphic**: Runs everywhere WebAssembly runs.

## ⚡ Benchmarks

### 1. Complex Calculations (e.g. Moon Position)

When precision matters, `swisseph-wasm` is both **faster** and **more
accurate**.

| Environment      | swisseph-wasm       | astronomy-engine | Comparison          |
| :--------------- | :------------------ | :--------------- | :------------------ |
| **Deno (Bench)** | **~182,000 iter/s** | ~126,000 iter/s  | **1.44x Faster** 🚀 |

### 2. Simple Calculations (e.g. Sun Position)

For simple calculations, the overhead of calling WebAssembly dominates. Pure JS
is faster here.

| Environment          | swisseph-wasm    | astronomy-engine     | Note                    |
| :------------------- | :--------------- | :------------------- | :---------------------- |
| **Browser (Chrome)** | ~319,000 ops/sec | **~577,000 ops/sec** | Inlined WASM vs Pure JS |
| **Deno (Native)**    | ~178,000 ops/sec | **~434,000 ops/sec** | Default Loader          |

> **Summary**: Use `swisseph-wasm` for professional-grade astrology (precision +
> complex speed). Use `astronomy-engine` for UI/visualizations (low precision +
> simple speed).

Run them yourself:

```bash
deno task bench
deno run -A benches/deno_throughput.ts
# For browser: Serve root and open benches/browser_bench.html
```

## Installation

### Deno / JSR

```bash
deno add jsr:@fusionstrings/swisseph-wasm
```

### Rust (Cargo)

Use as a native Rust crate:

```bash
cargo add swisseph-wasm
```

**Advanced**: Import raw WASM (Deno):

```typescript
import wasmBytes from "@fusionstrings/swisseph-wasm/wasm";
const module = new WebAssembly.Module(wasmBytes);
```

### NPM / Node.js

```bash
npm install @fusionstrings/swisseph-wasm
```

### Browser (Zero-Config)

Use the bundled browser version (inlined WASM) directly:

```typescript
import { swe_julday } from "@fusionstrings/swisseph-wasm/browser";
// WASM initializes automatically
```

## Quick Start

```typescript
import {
  SE_GREG_CAL,
  SE_MOON,
  SE_SUN,
  swe_calc_ut,
  swe_julday,
} from "@fusionstrings/swisseph-wasm";

// 1. Calculate Julian Day for Jan 1, 2000, 12:00 UTC
const jd = swe_julday(2000, 1, 1, 12.0, SE_GREG_CAL);
console.log(`Julian Day: ${jd}`); // 2451545.0

// 2. Calculate Sun Position
const sun = swe_calc_ut(jd, SE_SUN, 0);
console.log("Sun Longitude:", sun.longitude);

// 3. Calculate Moon Position
const moon = swe_calc_ut(jd, SE_MOON, 0);
console.log("Moon Longitude:", moon.longitude);
```

## Building from Source

### Prerequisites

- **Rust**: `rustup target add wasm32-unknown-unknown`
- **Deno**: For task management.
- **LLVM**: Required for compiling the C library to WASM.

**macOS Users**:

```bash
brew install llvm
```

### Build Command

The build script automatically detects Homebrew LLVM.

```bash
deno task build
```

## Maintenance

### Version Management

To update the version across Deno, Cargo, and NPM configs:

```bash
deno task bump-version <new-version>
# Example: deno task bump-version 1.2.3
```

This command validates the version format, updates all config files, and syncs
`Cargo.lock`.

## License

MIT License. Based on the Swiss Ephemeris (GPL/Commercial dual license). _Note:
Using this library implies compliance with the Swiss Ephemeris license terms._
