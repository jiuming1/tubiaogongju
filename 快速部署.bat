@echo off
chcp 65001 >nul
title 快速部署脚本

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      快速部署脚本                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🚀 开始快速部署...
echo.

REM 步骤1：检查环境
echo 📋 检查环境...
if not exist "package.json" (
    echo ❌ package.json 不存在
    pause
    exit /b 1
)

if not exist "src\input.css" (
    echo ❌ src\input.css 不存在
    pause
    exit /b 1
)

if not exist "tailwind.config.js" (
    echo ❌ tailwind.config.js 不存在
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

REM 步骤2：直接运行Tailwind命令
echo 🎨 构建CSS...
echo.

REM 使用npx直接运行，避免npm脚本问题
echo 正在运行: npx tailwindcss -i ./src/input.css -o ./css/output.css --minify
npx tailwindcss -i ./src/input.css -o ./css/output.css --minify

if not exist "css\output.css" (
    echo ❌ CSS构建失败
    echo.
    echo 尝试创建css目录...
    mkdir css 2>nul
    echo 重新构建...
    npx tailwindcss -i ./src/input.css -o ./css/output.css --minify
    
    if not exist "css\output.css" (
        echo ❌ CSS构建仍然失败
        pause
        exit /b 1
    )
)

echo ✅ CSS构建成功
echo.

REM 步骤3：Git操作
echo 📝 Git操作...
echo.

echo 添加文件...
git add .

echo 提交更改...
git commit -m "快速部署 - %date% %time%"

echo 推送到GitHub...
git push origin main

if errorlevel 1 (
    echo ⚠️  推送失败，尝试强制推送...
    git push -f origin main
)

echo.
echo ✅ 部署完成！
echo.

echo 🔧 接下来的步骤：
echo 1. 访问: https://github.com/jiuming1/tubiaogongju/settings/pages
echo 2. 选择 "GitHub Actions" 作为源
echo 3. 保存设置
echo 4. 等待部署完成
echo 5. 访问: https://jiuming1.github.io/tubiaogongju/
echo.

set /p open_settings="打开GitHub Pages设置？(y/n): "
if /i "%open_settings%"=="y" (
    start https://github.com/jiuming1/tubiaogongju/settings/pages
)

pause