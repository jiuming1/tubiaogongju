@echo off
chcp 65001 >nul
echo 🚀 完成GitHub Pages部署...
echo.

REM 检查Git状态
echo 📋 当前Git状态：
git status

echo.
echo 📝 添加所有文件到Git...
git add .

echo.
set /p commit_message="请输入提交信息 (默认: 完成图表工具部署): "
if "%commit_message%"=="" set commit_message=完成图表工具部署

echo 💾 提交更改...
git commit -m "%commit_message%"

echo.
echo 🚀 推送到GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败，可能需要先设置远程仓库
    echo 运行以下命令设置远程仓库：
    echo git remote add origin https://github.com/jiuming1/tubiaogongju.git
    echo 然后重新运行此脚本
    pause
    exit /b 1
)

echo.
echo ✅ 代码已成功推送到GitHub！
echo.
echo 🔧 现在请按照以下步骤启用GitHub Pages：
echo.
echo 1. 访问: https://github.com/jiuming1/tubiaogongju/settings/pages
echo 2. 在 'Source' 部分选择 'GitHub Actions'
echo 3. 点击 'Save' 保存设置
echo.
echo 🌐 部署完成后，你的网站将在以下地址可用：
echo    https://jiuming1.github.io/tubiaogongju/
echo.
echo 📊 查看部署状态：
echo    https://github.com/jiuming1/tubiaogongju/actions
echo.
echo 🎉 部署通常需要2-5分钟完成！
echo.
pause