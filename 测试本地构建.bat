@echo off
chcp 65001 >nul
title 测试本地构建

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      测试本地构建                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🧪 开始测试本地构建...
echo.

REM 步骤1：检查环境
echo 📋 检查环境...
echo Node.js 版本:
node --version
echo npm 版本:
npm --version
echo.

REM 步骤2：安装依赖
echo 📦 安装依赖...
npm install
echo.

REM 步骤3：测试构建
echo 🔨 测试构建...
echo.

echo 运行构建命令:
npm run build:css

echo.

REM 检查结果
if exist "css\output.css" (
    echo ✅ 构建成功！
    echo.
    echo 📊 文件信息:
    dir css\output.css | find "output.css"
    echo.
    echo 📄 文件内容预览（前10行）:
    more +1 css\output.css | head -10
    echo.
    echo 🎯 构建测试通过！
) else (
    echo ❌ 构建失败！
    echo.
    echo 🔍 诊断信息:
    echo - 检查 src/input.css 是否存在
    echo - 检查 tailwind.config.js 是否正确
    echo - 检查 node_modules 是否完整安装
    echo.
    echo 建议运行 "修复Tailwind构建.bat" 来解决问题
)

echo.
echo 🧪 测试完成！
echo.

pause