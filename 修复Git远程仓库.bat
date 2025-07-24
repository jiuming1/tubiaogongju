@echo off
chcp 65001 >nul
echo 🔧 修复Git远程仓库设置...
echo.

echo 📋 当前远程仓库设置：
git remote -v
echo.

echo 🔄 更新远程仓库URL...
git remote set-url origin https://github.com/jiuming1/tubiaogongju.git

if errorlevel 1 (
    echo ❌ 更新失败，尝试删除并重新添加...
    git remote remove origin
    git remote add origin https://github.com/jiuming1/tubiaogongju.git
)

echo.
echo ✅ 远程仓库设置已更新：
git remote -v

echo.
echo 🚀 现在可以推送代码了...
echo 运行以下命令推送代码：
echo.
echo git add .
echo git commit -m "部署图表工具"
echo git push -u origin main
echo.

set /p auto_push="是否立即推送代码？(y/n): "
if /i "%auto_push%"=="y" (
    echo.
    echo 📝 添加文件...
    git add .
    
    echo 💾 提交更改...
    git commit -m "部署图表可视化工具到GitHub Pages"
    
    echo 🚀 推送到GitHub...
    git push -u origin main
    
    if errorlevel 1 (
        echo.
        echo ❌ 推送失败，请检查网络连接和GitHub权限
        echo 你可能需要：
        echo 1. 检查网络连接
        echo 2. 确认GitHub仓库存在且有写入权限
        echo 3. 配置Git用户信息：
        echo    git config --global user.name "你的用户名"
        echo    git config --global user.email "你的邮箱"
    ) else (
        echo.
        echo ✅ 代码推送成功！
        echo.
        echo 🔧 接下来请启用GitHub Pages：
        echo 1. 访问: https://github.com/jiuming1/tubiaogongju/settings/pages
        echo 2. 在 'Source' 部分选择 'GitHub Actions'
        echo 3. 保存设置
        echo.
        echo 🌐 部署完成后访问: https://jiuming1.github.io/tubiaogongju/
    )
)

echo.
pause