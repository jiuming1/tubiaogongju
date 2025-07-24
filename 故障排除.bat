@echo off
chcp 65001 >nul
title 部署故障排除工具

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    部署故障排除                                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:menu
echo 请选择要执行的故障排除操作：
echo.
echo 1. 检查项目文件完整性
echo 2. 重新构建CSS文件
echo 3. 检查Git配置
echo 4. 强制重新推送
echo 5. 查看详细的Git日志
echo 6. 测试本地服务器
echo 7. 重置并重新部署
echo 8. 退出
echo.

set /p choice="请输入选项 (1-8): "

if "%choice%"=="1" goto check_files
if "%choice%"=="2" goto rebuild_css
if "%choice%"=="3" goto check_git
if "%choice%"=="4" goto force_push
if "%choice%"=="5" goto git_log
if "%choice%"=="6" goto test_server
if "%choice%"=="7" goto reset_deploy
if "%choice%"=="8" goto exit
goto menu

:check_files
echo.
echo 🔍 检查项目文件完整性...
echo.

echo 检查关键文件：
if exist "index.html" (echo ✅ index.html) else (echo ❌ index.html 缺失)
if exist "package.json" (echo ✅ package.json) else (echo ❌ package.json 缺失)
if exist "tailwind.config.js" (echo ✅ tailwind.config.js) else (echo ❌ tailwind.config.js 缺失)
if exist "src\input.css" (echo ✅ src\input.css) else (echo ❌ src\input.css 缺失)
if exist "css\output.css" (echo ✅ css\output.css) else (echo ❌ css\output.css 缺失)
if exist ".github\workflows\deploy.yml" (echo ✅ .github\workflows\deploy.yml) else (echo ❌ GitHub Actions配置缺失)

echo.
echo 检查JavaScript文件：
for %%f in (js\*.js) do echo ✅ %%f

echo.
pause
goto menu

:rebuild_css
echo.
echo 🎨 重新构建CSS文件...
echo.

if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
)

echo 🏗️  构建Tailwind CSS...
npm run build:css

if exist "css\output.css" (
    echo ✅ CSS构建成功
) else (
    echo ❌ CSS构建失败
)

echo.
pause
goto menu

:check_git
echo.
echo 🔧 检查Git配置...
echo.

echo Git用户配置：
git config user.name
git config user.email

echo.
echo 远程仓库配置：
git remote -v

echo.
echo 当前分支：
git branch

echo.
echo Git状态：
git status

echo.
pause
goto menu

:force_push
echo.
echo 🚀 强制重新推送...
echo.

echo ⚠️  警告：这将强制推送所有更改到GitHub
set /p confirm="确定要继续吗？(y/n): "
if /i not "%confirm%"=="y" goto menu

git add .
git commit -m "强制重新部署 - %date% %time%"
git push -f origin main

echo.
if errorlevel 1 (
    echo ❌ 推送失败
) else (
    echo ✅ 推送成功
)

echo.
pause
goto menu

:git_log
echo.
echo 📋 Git提交历史...
echo.

git log --oneline -10

echo.
echo 最近的提交详情：
git show --stat HEAD

echo.
pause
goto menu

:test_server
echo.
echo 🌐 启动本地测试服务器...
echo.

if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
)

echo 🚀 启动服务器在 http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.

npm start

echo.
pause
goto menu

:reset_deploy
echo.
echo 🔄 重置并重新部署...
echo.

echo ⚠️  警告：这将重置所有本地更改并重新部署
set /p confirm="确定要继续吗？(y/n): "
if /i not "%confirm%"=="y" goto menu

echo 📦 重新安装依赖...
rmdir /s /q node_modules 2>nul
npm install

echo 🎨 重新构建CSS...
npm run build:css

echo 📝 提交所有更改...
git add .
git commit -m "重置并重新部署 - %date% %time%"

echo 🚀 推送到GitHub...
git push origin main

echo.
echo ✅ 重置部署完成！
echo.
pause
goto menu

:exit
echo.
echo 👋 再见！
echo.
pause
exit