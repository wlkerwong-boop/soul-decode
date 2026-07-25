# 九宫学理 · 笔画准确性原则

> 写入日期：2026-07-25
> 依据：康熙字典在线 https://m.kangxizidian.com.cn/

## 核心原则

**所有姓名用字必须以康熙字典繁体笔画为准，不准用简体笔画，不准用默认值。**

## 查字流程

1. **输入字** → 先查 S2T 简繁映射，转到繁体
2. **繁体字** → 查本地康熙字典 JSON（63,696 字）
3. **若本地缺失** → 调用 https://m.kangxizidian.com.cn/ 在线查询
4. **不准回退** → 禁止用 10 画默认值替代真实笔画

## 验证清单

每新增一个姓名测试用例，逐字验证：

| 序号 | 字 | S2T映射 | 繁体 | 康熙笔画 | 验证URL |
|------|-----|---------|------|----------|---------|
| 示例 | 张 | 张→張 | 張 | 11 | kangxizidian.com.cn |
| 示例 | 晓 | 晓→曉 | 曉 | 16 | kangxizidian.com.cn |
| 示例 | 霞 | (无繁简) | 霞 | 17 | kangxizidian.com.cn |

## 已知陷阱

- 简体在本地 JSON 中也有笔画（如"张"=7），但那是**简体笔画**，姓名学必须用繁体
- S2T 映射优先级高于本地 JSON 直接查询——先看有没有繁体映射
- 部首拆分仅对未在康熙字典中独立存在的合体字进行

## 自检命令

```bash
# 验证任意姓名的笔画
python3 -c "
import json
with open('public/data/kangxi-strokes.json') as f: d=json.load(f)
s2t={'张':'張','晓':'曉'}
name='张晓霞'
total=sum(d.get(s2t.get(c,c),d.get(c,0)) for c in name)
print(f'{name}: {total}画')
"
```
