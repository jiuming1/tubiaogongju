@echo off
chcp 65001 >nul
title 图表可视化工具 - 部署助手

:main_menu
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  图表可视化工具部署助手                          ║
echo ║                                                              ║
echo ║              https://jiuming1.github.io/tubiaogongju/        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 选择你要执行的操作：
echo.
echo 1. 🎯 一键部署到GitHub Pages（推荐）
echo 2. 🔍 验证部署状态
echo 3. 🛠️  故障排除工具
echo 4. 🌐 测试本地服务器
echo 5. 📖 查看完整部署指南
echo 6. 🔗 打开重要链接
echo 7. ❌ 退出
echo.

set /p choice="请选择操作 (1-7): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto verify
if "%choice%"=="3" goto troubleshoot
if "%choice%"=="4" goto local_server
if "%choice%"=="5" goto guide
if "%choice%"=="6" goto links
if "%choice%"=="7" goto exit

echo 无效选择，请重试...
timeout /t 2 >nul
goto main_menu

:deploy
cls
echo 🎯 启动一键部署...
echo.
call "一键部署到GitHub.bat"
echo.
echo 按任意键返回主菜单...
pause >nul
goto main_menu

:verify
cls
echo 🔍 验证部署状态...
echo.
call "验证部署状态.bat"
echo.
echo 按任意键返回主菜单...
pause >nul
goto main_menu

:troubleshoot
cls
echo 🛠️  启动故障排除工具...
echo.
call "故障排除.bat"
echo.
echo 按任意键返回主菜单...
pause >nul
goto main_menu

:local_server
cls
echo 🌐 启动本地测试服务器...
echo.
echo 正在启动服务器，请稍候...
echo 服务器将在 http://localhost:8000 运行
echo 按 Ctrl+C 停止服务器
echo.
npm start
echo.
echo 按任意键返回主菜单...
pause >nul
goto main_menu

:guide
cls
echo 📖 打开完整部署指南...
echo.
if exist "完整部署指南.md" (
    start "完整部署指南.md"
    echo ✅ 已打开部署指南文档
) else (
    echo ❌ 部署指南文档不存在
)
echo.
echo 按任意键返回主菜单...
pause >nul
goto main_menu

:links
cls
echo 🔗 重要链接：
echo.
echo 🌐 你的网站：
echo    https://jiuming1.github.io/tubiaogongju/
echo.
echo 📁 GitHub仓库：
echo    https://github.com/jiuming1/tubiaogongju
echo.
echo ⚙️  GitHub Pages设置：
echo    https://github.com/jiuming1/tubiaogongju/settings/pages
echo.
echo 📈 部署状态：
echo    https://github.com/jiuming1/tubiaogongju/actions
echo.

set /p open_choice="选择要打开的链接 (1=网站, 2=仓库, 3=设置, 4=状态, 0=返回): "

if "%open_choice%"=="1" start https://jiuming1.github.io/tubiaogongju/
if "%open_choice%"=="2" start https://github.com/jiuming1/tubiaogongju
if "%open_choice%"=="3" start https://github.com/jiuming1/tubiaogongju/settings/pages
if "%open_choice%"=="4" start https://github.com/jiuming1/tubiaogongju/actions
if "%open_choice%"=="0" goto main_menu

echo.
echo 按任意键返回主菜单...
pause >nul
goto main_menu

:exit
cls
echo.
echo 👋 感谢使用图表可视化工具部署助手！
echo.
echo 🌐 你的网站地址：https://jiuming1.github.io/tubiaogongju/
echo.
echo 如有问题，请运行故障排除工具或查看完整部署指南。
echo.
pause
exit