#!/bin/bash
# Vercel 环境变量配置脚本
# 用法: ./setup-vercel.sh <VERCEL_TOKEN>
# Vercel Token 获取: https://vercel.com/account/tokens

TOKEN=$1
PROJECT="soul-decode"
TEAM_ID=""  # 个人项目留空

if [ -z "$TOKEN" ]; then
  echo "请提供 Vercel Token: ./setup-vercel.sh <token>"
  echo "Token 获取: https://vercel.com/account/tokens"
  exit 1
fi

# 添加环境变量
echo "正在配置 DEEPSEEK_API_KEY..."
curl -s -X POST "https://api.vercel.com/v1/projects/\${PROJECT}/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DEEPSEEK_API_KEY",
    "value": "sk-c2c7afa08ffe493cb6b980995227d079",
    "target": "production",
    "type": "encrypted"
  }' 2>/dev/null

echo ""
echo "正在配置 AI_BASE_URL..."
curl -s -X POST "https://api.vercel.com/v1/projects/\${PROJECT}/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "AI_BASE_URL",
    "value": "https://api.deepseek.com/v1",
    "target": "production",
    "type": "encrypted"
  }' 2>/dev/null

echo ""
echo "正在配置 AI_MODEL..."
curl -s -X POST "https://api.vercel.com/v1/projects/\${PROJECT}/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "AI_MODEL",
    "value": "deepseek-chat",
    "target": "production",
    "type": "encrypted"
  }' 2>/dev/null

echo ""
echo "✅ 环境变量已配置。重新部署后生效。"
