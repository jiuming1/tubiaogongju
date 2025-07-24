@echo off
chcp 65001 >nul
title Tailwind CSS 诊断工具

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                   Tailwind CSS 诊断工具                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 开始诊断 Tailwind CSS 构建问题...
echo.

REM 检查必要文件
echo 📋 检查必要文件...
echo.

if exist "src\input.css" (
    echo ✅ src\input.css 存在
) else (
    echo ❌ src\input.css 不存在
    echo 创建基础的 input.css 文件...
    if not exist "src" mkdir src
    echo @tailwind base; > src\input.css
    echo @tailwind components; >> src\input.css
    echo @tailwind utilities; >> src\input.css
    echo ✅ 已创建 src\input.css
)

if exist "tailwind.config.js" (
    echo ✅ tailwind.config.js 存在
) else (
    echo ❌ tailwind.config.js 不存在
)

if exist "package.json" (
    echo ✅ package.json 存在
) else (
    echo ❌ package.json 不存在
)

echo.

REM 检查Node.js和npm
echo 🔧 检查环境...
echo.

echo Node.js 版本:
node --version
echo.

echo npm 版本:
npm --version
echo.

echo npx 版本:
npx --version
echo.

REM 检查Tailwind CSS安装
echo 📦 检查 Tailwind CSS...
echo.

echo 检查本地安装:
if exist "node_modules\tailwindcss" (
    echo ✅ Tailwind CSS 已本地安装
) else (
    echo ⚠️  Tailwind CSS 未本地安装，将使用 npx
)

echo.

REM 显示配置内容
echo 📄 显示 tailwind.config.js 内容:
echo.
type tailwind.config.js
echo.

REM 显示input.css内容
echo 📄 显示 src\input.css 内容:
echo.
type src\input.css
echo.

REM 尝试构建（调试模式）
echo 🔨 尝试构建 CSS（调试模式）...
echo.

echo 命令: npx tailwindcss -i ./src/input.css -o ./css/debug-output.css --verbose
npx tailwindcss -i ./src/input.css -o ./css/debug-output.css --verbose

echo.

if exist "css\debug-output.css" (
    echo ✅ 调试构建成功！
    echo 输出文件大小:
    dir css\debug-output.css | find "debug-output.css"
    echo.
    echo 输出文件前几行:
    more +1 css\debug-output.css | head -10
) else (
    echo ❌ 调试构建失败
)

echo.
echo 🔍 诊断完成！
echo.

pause