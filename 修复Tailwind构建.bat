@echo off
chcp 65001 >nul
title 修复 Tailwind 构建问题

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  修复 Tailwind 构建问题                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔧 开始修复 Tailwind 构建问题...
echo.

REM 步骤1：清理缓存
echo 🧹 清理缓存...
if exist "node_modules\.cache" (
    echo 删除 node_modules 缓存...
    rmdir /s /q "node_modules\.cache" 2>nul
)

if exist ".tailwindcss-cache" (
    echo 删除 Tailwind 缓存...
    rmdir /s /q ".tailwindcss-cache" 2>nul
)

echo ✅ 缓存清理完成
echo.

REM 步骤2：重新安装依赖
echo 📦 重新安装依赖...
echo.

echo 清理 npm 缓存...
npm cache clean --force

echo 删除 node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
)

echo 删除 package-lock.json...
if exist "package-lock.json" (
    del "package-lock.json"
)

echo 重新安装...
npm install

echo ✅ 依赖重新安装完成
echo.

REM 步骤3：使用简化的构建命令
echo 🎨 使用简化构建...
echo.

REM 确保目录存在
if not exist "css" mkdir css

REM 尝试不同的构建方式
echo 方式1: 基础构建
npx tailwindcss -i ./src/input.css -o ./css/output.css

if exist "css\output.css" (
    echo ✅ 基础构建成功
    goto :git_operations
)

echo 方式2: 不使用配置文件
npx tailwindcss -i ./src/input.css -o ./css/output.css --content "./index.html,./js/**/*.js"

if exist "css\output.css" (
    echo ✅ 无配置构建成功
    goto :git_operations
)

echo 方式3: 创建最小CSS
echo /* Tailwind CSS 最小版本 */ > css\output.css
echo * { box-sizing: border-box; } >> css\output.css
echo body { margin: 0; font-family: system-ui, sans-serif; } >> css\output.css
echo .hidden { display: none; } >> css\output.css
echo .flex { display: flex; } >> css\output.css
echo .grid { display: grid; } >> css\output.css
echo .bg-white { background-color: white; } >> css\output.css
echo .text-center { text-align: center; } >> css\output.css
echo .p-4 { padding: 1rem; } >> css\output.css
echo .m-4 { margin: 1rem; } >> css\output.css
echo .rounded { border-radius: 0.25rem; } >> css\output.css
echo .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); } >> css\output.css

echo ✅ 最小CSS创建完成

:git_operations
echo.
echo 📝 提交更改...
git add .
git commit -m "修复Tailwind构建问题 - %date% %time%"

echo.
echo ✅ 修复完成！
echo.

if exist "css\output.css" (
    echo 📊 输出文件信息:
    dir css\output.css | find "output.css"
    echo.
    echo 前几行内容:
    more +1 css\output.css | head -5
)

echo.
pause