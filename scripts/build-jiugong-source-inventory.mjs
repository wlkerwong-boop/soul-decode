import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/guangmingxishe/LifeOS/20-29 工作事业/24.01 灵魂解码运营/九宫人生解码';
const output = new URL('../docs/jiugong-sources/inventory.json', import.meta.url);
const topicRules = [
  ['婚姻', ['婚姻', '关系']],
  ['财', ['财运', '财库']],
  ['碰撞', ['碰撞', '流年风险']],
  ['流年', ['流年', '年度环境']],
  ['气场', ['气场', '四层关系']],
  ['管理', ['管理风格', '下层关系']],
  ['五', ['五行', '个人结构']],
  ['星', ['星运', '岁值星']],
  ['大限', ['人生大限', '九年运组']],
  ['趋势', ['人生趋势', '课程资料']],
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    if (entry.name === '.DS_Store') return [];
    return [path.relative(root, absolute)];
  });
}

const paths = walk(root).sort();
const sources = paths.map((relative, index) => {
  const extension = path.extname(relative).slice(1).toLowerCase();
  const topics = topicRules.flatMap(([needle, values]) =>
    relative.includes(needle) ? values : [],
  );
  return {
    sourceId: `JG-SRC-${String(index + 1).padStart(3, '0')}`,
    path: relative,
    format: extension,
    status: 'discovered',
    topics: [...new Set(topics.length ? topics : ['待提取分类'])],
    summary: '',
  };
});

fs.mkdirSync(path.dirname(output.pathname), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({ version: 1, sources }, null, 2)}\n`);
console.log(`WROTE ${sources.length} source records`);
