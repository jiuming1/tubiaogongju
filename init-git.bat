@echo off
chcp 65001 >nul
echo 🔧 初始化Git仓库并连接到GitHub...
echo.

REM 检查是否已经是Git仓库
if exist ".git" (
    echo ℹ️  Git仓库已存在
    git remote -v
    echo.
    echo 如果需要重新设置远程仓库，请手动运行：
    echo git remote set-url origin https://github.com/jiuming1/tubiaogongju.git
    pause
    exit /b 0
)

REM 初始化Git仓库
echo 📁 初始化Git仓库...
git init

REM 添加远程仓库
echo 🔗 添加远程仓库...
git remote add origin https://github.com/jiuming1/tubiaogongju.git

REM 设置默认分支
git branch -M main

echo ✅ Git仓库初始化完成！
echo.
echo 远程仓库: https://github.com/jiuming1/tubiaogongju.git
echo 默认分支: main
echo.
echo 接下来你可以运行 deploy.bat 来部署项目
pause