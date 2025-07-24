@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title 调试部署脚本

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      调试部署脚本                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 开始调试...
echo.

REM 显示当前目录和文件
echo 📁 当前目录: %cd%
echo.

echo 📋 检查关键文件:
if exist "package.json" (echo ✅ package.json) else (echo ❌ package.json)
if exist ".git" (echo ✅ .git) else (echo ❌ .git)
if exist "index.html" (echo ✅ index.html) else (echo ❌ index.html)
echo.

REM 检查Git状态
echo 🔧 Git状态:
git --version
echo.

echo Git配置:
git config user.name
git config user.email
echo.

echo 远程仓库:
git remote -v
echo.

REM 检查Node.js和npm
echo 📦 Node.js环境:
node --version
npm --version
echo.

REM 检查package.json脚本
echo 📜 package.json脚本:
type package.json | findstr "scripts" -A 10
echo.

echo 🏗️  尝试构建...
echo.

echo 步骤1: npm install
call npm install
echo npm install 退出代码: %errorlevel%
echo.

echo 步骤2: npm run build:css
call npm run build:css
echo npm run build:css 退出代码: %errorlevel%
echo.

echo 检查构建结果:
if exist "css\output.css" (
    echo ✅ css\output.css 存在
    dir "css\output.css"
) else (
    echo ❌ css\output.css 不存在
)
echo.

echo 🔍 调试完成！
echo.
echo 请查看上面的输出，找出问题所在。
echo 如果一切正常，可以继续手动执行Git操作：
echo.
echo git add .
echo git commit -m "部署测试"
echo git push origin main
echo.

pause