#!/usr/bin/env python3
"""
法藏 RAG 索引构建脚本
扫描寂如师父转写音频文件，分块并建立搜索索引
输出：src/data/dharma/dharma-index.json（给前端搜索用）

用法：python3 scripts/build-dharma-index.py
"""

import os
import json
import re
import glob
from pathlib import Path

# 寂如师父转写文件目录
TRANSCRIPTION_DIR = os.path.expanduser(
    "~/LifeOS/10-19 学习成长/10.02 经典学习/寂如师"
)

# 输出文件
OUTPUT_FILE = os.path.join(
    os.path.dirname(__file__), 
    "../src/data/dharma/dharma-index.json"
)

# 每个块的字数
CHUNK_SIZE = 500

def find_transcription_files():
    """查找所有转写文件"""
    patterns = [
        "**/*.txt",
        "**/*.md",
    ]
    files = []
    for pattern in patterns:
        matches = glob.glob(os.path.join(TRANSCRIPTION_DIR, pattern), recursive=True)
        files.extend(matches)
    
    # 过滤非内容文件
    skip_patterns = ['node_modules', '.git', '__pycache__']
    files = [f for f in files if not any(s in f for s in skip_patterns)]
    
    return sorted(set(files))

def extract_metadata(filepath, content):
    """从文件路径和内容提取元数据"""
    rel = os.path.relpath(filepath, TRANSCRIPTION_DIR)
    parts = rel.split(os.sep)
    
    # 提取主题标签
    topics = []
    for p in parts:
        if '菠萝' in p:
            topics.append('菠萝讲堂')
        if '寂如' in p:
            topics.append('寂如师父')
    
    # 提取标题（第一个有意义的标题）
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else Path(rel).stem
    
    # 清理文件名中的序号和日期
    title = re.sub(r'^\d{4,8}-', '', title)
    title = re.sub(r'^\d{3,4}\s*', '', title)
    
    return {
        'file': rel,
        'title': title.strip(),
        'topics': topics,
    }

def chunk_content(content, metadata):
    """将内容分块"""
    # 移除markdown标记
    text = re.sub(r'#{1,6}\s+', '', content)
    text = re.sub(r'\*\*', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    # 按段落分割
    paragraphs = re.split(r'\n\s*\n', text)
    
    chunks = []
    current_chunk = ""
    chunk_id = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para or len(para) < 10:
            continue
        
        if len(current_chunk) + len(para) > CHUNK_SIZE * 2 and current_chunk:
            chunks.append({
                'id': f"{metadata['file']}#{chunk_id}",
                'text': current_chunk.strip(),
                'title': metadata['title'],
                'file': metadata['file'],
                'topics': metadata['topics'],
            })
            current_chunk = para
            chunk_id += 1
        else:
            current_chunk += "\n" + para
    
    if current_chunk.strip():
        chunks.append({
            'id': f"{metadata['file']}#{chunk_id}",
            'text': current_chunk.strip()[:1000],  # 限制单块大小
            'title': metadata['title'],
            'file': metadata['file'],
            'topics': metadata['topics'],
        })
    
    return chunks

def build_index():
    """构建完整索引"""
    print("🔍 扫描转写文件...")
    files = find_transcription_files()
    print(f"   找到 {len(files)} 个文件")
    
    all_chunks = []
    stats = {'files': 0, 'chunks': 0, 'total_chars': 0}
    
    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if len(content) < 50:
                continue
            
            metadata = extract_metadata(filepath, content)
            chunks = chunk_content(content, metadata)
            
            all_chunks.extend(chunks)
            stats['files'] += 1
            stats['chunks'] += len(chunks)
            stats['total_chars'] += len(content)
            
            if stats['files'] % 20 == 0:
                print(f"   已处理 {stats['files']} 个文件，{stats['chunks']} 个块...")
                
        except Exception as e:
            print(f"   ⚠️ 跳过 {filepath}: {e}")
    
    # 创建关键词索引（简单倒排）
    print("\n📊 构建关键词索引...")
    keyword_index = {}
    stop_words = {'的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', 
                  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
                  '自己', '这', '他', '她', '它', '们', '那', '什么', '怎么', '为什么', '因为',
                  '所以', '但是', '如果', '虽然', '而且', '或者', '还是', '只是', '不过'}
    
    for i, chunk in enumerate(all_chunks):
        words = set(re.findall(r'[\u4e00-\u9fff]{2,6}', chunk['text']))
        for word in words:
            if word in stop_words:
                continue
            if word not in keyword_index:
                keyword_index[word] = []
            keyword_index[word].append(i)
            if len(keyword_index[word]) > 100:  # 限制每个词索引数量
                keyword_index[word] = keyword_index[word][:100]
    
    # 写入索引文件
    output = {
        'stats': stats,
        'chunks': all_chunks,
        'keywords': dict(list(keyword_index.items())[:50000]),  # 限制关键词数量
        'built_at': os.path.getmtime(__file__),
    }
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 索引构建完成！")
    print(f"   处理文件: {stats['files']}")
    print(f"   总字符数: {stats['total_chars']:,}")
    print(f"   分块数: {stats['chunks']}")
    print(f"   关键词数: {len(keyword_index):,}")
    print(f"   输出: {OUTPUT_FILE}")
    print(f"   大小: {os.path.getsize(OUTPUT_FILE) / 1024 / 1024:.1f} MB")

if __name__ == '__main__':
    build_index()
