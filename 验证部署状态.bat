@echo off
chcp 65001 >nul
title 验证GitHub Pages部署状态

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    验证部署状态                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 正在检查部署状态...
echo.

REM 检查本地Git状态
echo 📋 本地Git状态：
git status --porcelain
if errorlevel 1 (
    echo ❌ Git仓库状态异常
) else (
    echo ✅ 本地Git状态正常
)
echo.

REM 检查远程仓库连接
echo 🌐 检查远程仓库连接：
git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到远程仓库
    echo 请检查网络连接和仓库权限
) else (
    echo ✅ 远程仓库连接正常
)
echo.

REM 显示重要链接
echo 📊 重要链接和检查项：
echo.
echo 🌐 你的网站地址：
echo    https://jiuming1.github.io/tubiaogongju/
echo.
echo ⚙️  GitHub Pages设置（确保选择了GitHub Actions）：
echo    https://github.com/jiuming1/tubiaogongju/settings/pages
echo.
echo 📈 GitHub Actions部署状态：
echo    https://github.com/jiuming1/tubiaogongju/actions
echo.
echo 📁 项目仓库：
echo    https://github.com/jiuming1/tubiaogongju
echo.

echo 🔧 部署检查清单：
echo.
echo □ 1. 代码已推送到GitHub仓库
echo □ 2. GitHub Pages已启用并选择"GitHub Actions"作为源
echo □ 3. GitHub Actions工作流正在运行或已完成
echo □ 4. 网站可以正常访问
echo.

set /p check_website="是否现在检查网站？(y/n): "
if /i "%check_website%"=="y" (
    echo 🌐 正在打开网站...
    start https://jiuming1.github.io/tubiaogongju/
)

set /p check_actions="是否查看GitHub Actions状态？(y/n): "
if /i "%check_actions%"=="y" (
    echo 📈 正在打开GitHub Actions...
    start https://github.com/jiuming1/tubiaogongju/actions
)

set /p check_settings="是否检查GitHub Pages设置？(y/n): "
if /i "%check_settings%"=="y" (
    echo ⚙️  正在打开GitHub Pages设置...
    start https://github.com/jiuming1/tubiaogongju/settings/pages
)

echo.
echo 💡 故障排除提示：
echo.
echo 如果网站无法访问：
echo 1. 确认GitHub Pages已启用
echo 2. 检查GitHub Actions是否成功完成
echo 3. 等待DNS传播（可能需要几分钟）
echo 4. 清除浏览器缓存后重试
echo.
echo 如果GitHub Actions失败：
echo 1. 查看Actions页面的错误日志
echo 2. 检查package.json和依赖是否正确
echo 3. 确认所有必要文件都已提交
echo.

pause