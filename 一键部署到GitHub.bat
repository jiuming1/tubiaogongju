@echo off
chcp 65001 >nul
title 图表工具 - 一键部署到GitHub Pages

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    图表可视化工具                              ║
echo ║                  一键部署到GitHub Pages                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 步骤1：检查环境
echo 🔍 步骤1/6: 检查部署环境...
echo.

if not exist "package.json" (
    echo ❌ 错误：未找到package.json文件
    echo 请确保在data-visualization-tool目录中运行此脚本
    pause
    exit /b 1
)

if not exist ".git" (
    echo ❌ 错误：未找到Git仓库
    echo 请先初始化Git仓库
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

REM 步骤2：检查Git配置
echo 🔧 步骤2/6: 检查Git配置...
echo.

for /f "delims=" %%i in ('git config user.name 2^>nul') do set git_user_name=%%i
for /f "delims=" %%i in ('git config user.email 2^>nul') do set git_user_email=%%i

if not defined git_user_name (
    echo ⚠️  Git用户名未配置
    set /p git_name="请输入你的GitHub用户名: "
    git config --global user.name "!git_name!"
    set git_user_name=!git_name!
)

if not defined git_user_email (
    echo ⚠️  Git邮箱未配置
    set /p git_email="请输入你的GitHub邮箱: "
    git config --global user.email "!git_email!"
    set git_user_email=!git_email!
)

echo ✅ Git配置完成
echo   用户名: %git_user_name%
echo   邮箱: %git_user_email%
echo.

REM 步骤3：构建项目
echo 🏗️  步骤3/6: 构建项目...
echo.

echo 📦 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🎨 构建Tailwind CSS...
call npm run build:css
if errorlevel 1 (
    echo ❌ CSS构建失败
    pause
    exit /b 1
)

if not exist "css\output.css" (
    echo ❌ CSS输出文件不存在
    pause
    exit /b 1
)

echo ✅ 项目构建完成
echo.

REM 步骤4：准备Git提交
echo 📝 步骤4/6: 准备Git提交...
echo.

echo 当前Git状态:
git status --porcelain

echo.
echo 📋 添加所有文件到Git...
git add .

echo 💾 创建提交...
set commit_msg=部署图表可视化工具到GitHub Pages - %date% %time%
git commit -m "%commit_msg%"

if errorlevel 1 (
    echo ⚠️  没有新的更改需要提交，继续推送...
)

echo ✅ Git提交准备完成
echo.

REM 步骤5：推送到GitHub
echo 🚀 步骤5/6: 推送到GitHub...
echo.

echo 🌐 推送到远程仓库...
git push -u origin main

if errorlevel 1 (
    echo ❌ 推送失败，尝试强制推送...
    git push -f origin main
    
    if errorlevel 1 (
        echo ❌ 推送仍然失败
        echo.
        echo 可能的原因：
        echo 1. 网络连接问题
        echo 2. GitHub权限问题
        echo 3. 仓库不存在或无写入权限
        echo.
        echo 请检查：
        echo - 网络连接是否正常
        echo - GitHub仓库是否存在: https://github.com/jiuming1/tubiaogongju
        echo - 是否有推送权限
        echo.
        pause
        exit /b 1
    )
)

echo ✅ 代码推送成功！
echo.

REM 步骤6：配置GitHub Pages
echo ⚙️  步骤6/6: 配置GitHub Pages...
echo.

echo 🔧 现在需要在GitHub上启用Pages功能：
echo.
echo 📋 请按照以下步骤操作：
echo.
echo 1️⃣  打开GitHub Pages设置页面：
echo    https://github.com/jiuming1/tubiaogongju/settings/pages
echo.
echo 2️⃣  在"Source"部分：
echo    - 选择 "GitHub Actions"
echo    - 点击 "Save" 保存
echo.
echo 3️⃣  等待部署完成（通常2-5分钟）
echo.
echo 4️⃣  访问你的网站：
echo    https://jiuming1.github.io/tubiaogongju/
echo.

set /p open_settings="是否现在打开GitHub Pages设置页面？(y/n): "
if /i "%open_settings%"=="y" (
    start https://github.com/jiuming1/tubiaogongju/settings/pages
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        部署完成！                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📊 重要链接：
echo.
echo 🌐 你的网站地址：
echo    https://jiuming1.github.io/tubiaogongju/
echo.
echo ⚙️  GitHub Pages设置：
echo    https://github.com/jiuming1/tubiaogongju/settings/pages
echo.
echo 📈 部署状态监控：
echo    https://github.com/jiuming1/tubiaogongju/actions
echo.
echo 📁 项目仓库：
echo    https://github.com/jiuming1/tubiaogongju
echo.
echo 💡 提示：
echo - 首次部署需要2-5分钟
echo - 确保在GitHub Pages设置中选择了"GitHub Actions"
echo - 如有问题，请查看Actions页面的部署日志
echo.

set /p open_actions="是否查看部署状态？(y/n): "
if /i "%open_actions%"=="y" (
    start https://github.com/jiuming1/tubiaogongju/actions
)

echo.
echo 🎉 恭喜！部署流程已完成！
echo.
pause