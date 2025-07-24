#!/bin/bash

# 数据可视化工具 - 部署到 GitHub Pages
# 仓库: https://github.com/jiuming1/tubiaogongju.git

echo "🚀 开始部署图表工具到GitHub Pages..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在data-visualization-tool目录中运行此脚本"
    exit 1
fi

# 检查Git状态
if [ ! -d ".git" ]; then
    echo "📁 初始化Git仓库..."
    git init
    git remote add origin https://github.com/jiuming1/tubiaogongju.git
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

echo "✅ 构建成功！"

# 添加所有文件
echo "📝 准备提交文件..."
git add .

# 显示状态
git status

# 提交更改
read -p "请输入提交信息 (默认: 初始部署图表可视化工具): " commit_message
commit_message=${commit_message:-"初始部署图表可视化工具"}

git commit -m "$commit_message"

# 推送到GitHub
echo "🚀 推送到GitHub仓库..."
git branch -M main
git push -u origin main

echo ""
echo "✅ 代码已成功推送到GitHub！"
echo ""
echo "🔧 接下来请按照以下步骤启用GitHub Pages："
echo "1. 访问: https://github.com/jiuming1/tubiaogongju/settings/pages"
echo "2. 在 'Source' 部分选择 'GitHub Actions'"
echo "3. 保存设置"
echo ""
echo "🌐 部署完成后，你的网站将在以下地址可用："
echo "   https://jiuming1.github.io/tubiaogongju/"
echo ""
echo "📊 你可以在以下地址查看部署状态："
echo "   https://github.com/jiuming1/tubiaogongju/actions"