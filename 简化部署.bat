@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title 图表工具 - 简化部署

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    图表可视化工具                              ║
echo ║                    简化部署脚本                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 检查基本环境
echo 🔍 检查环境...
if not exist "package.json" (
    echo ❌ 错误：未找到package.json文件
    pause
    exit /b 1
)

if not exist ".git" (
    echo ❌ 错误：未找到Git仓库
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

REM 构建项目
echo 🏗️  构建项目...
echo.

echo 📦 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🎨 构建CSS...
call npm run build:css
if errorlevel 1 (
    echo ❌ CSS构建失败
    pause
    exit /b 1
)

echo ✅ 项目构建完成
echo.

REM Git操作
echo 📝 准备Git提交...
echo.

echo 添加文件...
git add .

echo 创建提交...
git commit -m "部署图表工具 - %date% %time%"

echo ✅ Git提交完成
echo.

REM 推送到GitHub
echo 🚀 推送到GitHub...
echo.

git push origin main
if errorlevel 1 (
    echo ⚠️  标准推送失败，尝试强制推送...
    git push -f origin main
    if errorlevel 1 (
        echo ❌ 推送失败
        echo.
        echo 可能的原因：
        echo 1. 网络连接问题
        echo 2. GitHub权限问题
        echo 3. 仓库配置问题
        echo.
        pause
        exit /b 1
    )
)

echo ✅ 推送成功！
echo.

REM 完成提示
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        部署完成！                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔧 现在需要启用GitHub Pages：
echo.
echo 1️⃣  访问: https://github.com/jiuming1/tubiaogongju/settings/pages
echo 2️⃣  在"Source"部分选择"GitHub Actions"
echo 3️⃣  点击"Save"保存
echo 4️⃣  等待2-5分钟完成部署
echo 5️⃣  访问: https://jiuming1.github.io/tubiaogongju/
echo.

set /p open_settings="是否现在打开GitHub Pages设置？(y/n): "
if /i "!open_settings!"=="y" (
    start https://github.com/jiuming1/tubiaogongju/settings/pages
)

set /p open_actions="是否查看部署状态？(y/n): "
if /i "!open_actions!"=="y" (
    start https://github.com/jiuming1/tubiaogongju/actions
)

echo.
echo 🎉 部署脚本执行完成！
echo 📊 重要链接已保存，请按照提示完成GitHub Pages设置。
echo.
pause