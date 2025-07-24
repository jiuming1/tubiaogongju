#!/bin/bash

# 数据可视化工具 - GitHub Pages 部署脚本

echo "🚀 开始部署到GitHub Pages..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在data-visualization-tool目录中运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建CSS
echo "🎨 构建Tailwind CSS..."
npm run build:css

# 检查构建是否成功
if [ ! -f "css/output.css" ]; then
    echo "❌ CSS构建失败"
    exit 1
fi

# 提交更改
echo "📝 提交更改..."
git add .
git status

read -p "请输入提交信息 (默认: Deploy to GitHub Pages): " commit_message
commit_message=${commit_message:-"Deploy to GitHub Pages"}

git commit -m "$commit_message"

# 推送到GitHub
echo "🚀 推送到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 你的网站将在几分钟后在以下地址可用："
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/"

echo ""
echo "📊 你可以在GitHub仓库的Actions标签页查看部署状态"