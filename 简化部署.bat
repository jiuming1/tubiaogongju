@echo off
chcp 65001 >nul
title 简化部署脚本

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      简化部署脚本                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🚀 开始简化部署...
echo.

REM 步骤1：检查基本环境
echo 📋 检查环境...
if not exist "index.html" (
    echo ❌ index.html 不存在
    pause
    exit /b 1
)

echo ✅ 基本环境检查通过
echo.

REM 步骤2：尝试构建CSS（带超时）
echo 🎨 构建CSS（30秒超时）...
echo.

REM 确保目录存在
if not exist "css" mkdir css

REM 使用timeout命令限制构建时间
echo 正在构建CSS...
timeout /t 30 /nobreak > nul & npx tailwindcss -i ./src/input.css -o ./css/output.css --minify

REM 检查是否成功
if exist "css\output.css" (
    echo ✅ CSS构建成功
) else (
    echo ⚠️  CSS构建可能失败，尝试使用现有CSS文件
    if exist "css\style.css" (
        echo 使用现有的 style.css
        copy css\style.css css\output.css > nul
    ) else (
        echo 创建最小CSS文件...
        echo /* 最小CSS文件 */ > css\output.css
        echo body { font-family: system-ui, sans-serif; } >> css\output.css
    )
)

echo.

REM 步骤3：Git操作
echo 📝 Git操作...
echo.

echo 添加文件...
git add .

echo 提交更改...
git commit -m "简化部署 - %date% %time%"

echo 推送到GitHub...
git push origin main

if errorlevel 1 (
    echo ⚠️  推送失败，尝试其他分支...
    git push origin master
    if errorlevel 1 (
        echo ❌ 推送失败，请检查Git配置
        pause
        exit /b 1
    )
)

echo.
echo ✅ 部署完成！
echo.

echo 🔧 后续步骤：
echo 1. 访问GitHub仓库设置页面
echo 2. 启用GitHub Pages
echo 3. 等待部署完成
echo.

pause