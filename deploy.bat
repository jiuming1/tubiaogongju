@echo off
chcp 65001 >nul
echo 🚀 开始部署图表工具到GitHub Pages...
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误：请在data-visualization-tool目录中运行此脚本
    pause
    exit /b 1
)

REM 检查Git状态
if not exist ".git" (
    echo 📁 初始化Git仓库...
    git init
    git remote add origin https://github.com/jiuming1/tubiaogongju.git
)

REM 安装依赖
echo 📦 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

REM 构建CSS
echo 🎨 构建Tailwind CSS...
call npm run build:css
if errorlevel 1 (
    echo ❌ CSS构建失败
    pause
    exit /b 1
)

REM 检查构建是否成功
if not exist "css\output.css" (
    echo ❌ CSS构建失败 - 输出文件不存在
    pause
    exit /b 1
)

echo ✅ 构建成功！
echo.

REM 添加所有文件
echo 📝 准备提交文件...
git add .

REM 显示状态
git status

echo.
set /p commit_message="请输入提交信息 (默认: 部署图表可视化工具): "
if "%commit_message%"=="" set commit_message=部署图表可视化工具

git commit -m "%commit_message%"

REM 推送到GitHub
echo 🚀 推送到GitHub仓库...
git branch -M main
git push -u origin main

echo.
echo ✅ 代码已成功推送到GitHub！
echo.
echo 🔧 接下来请按照以下步骤启用GitHub Pages：
echo 1. 访问: https://github.com/jiuming1/tubiaogongju/settings/pages
echo 2. 在 'Source' 部分选择 'GitHub Actions'
echo 3. 保存设置
echo.
echo 🌐 部署完成后，你的网站将在以下地址可用：
echo    https://jiuming1.github.io/tubiaogongju/
echo.
echo 📊 你可以在以下地址查看部署状态：
echo    https://github.com/jiuming1/tubiaogongju/actions
echo.
pause