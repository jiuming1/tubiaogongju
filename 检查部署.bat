@echo off
chcp 65001 >nul
echo 🔍 检查GitHub Pages部署状态...
echo.

echo 📊 相关链接：
echo.
echo 🌐 你的网站地址：
echo    https://jiuming1.github.io/tubiaogongju/
echo.
echo ⚙️ GitHub Pages 设置：
echo    https://github.com/jiuming1/tubiaogongju/settings/pages
echo.
echo 📈 部署状态（GitHub Actions）：
echo    https://github.com/jiuming1/tubiaogongju/actions
echo.
echo 📁 仓库主页：
echo    https://github.com/jiuming1/tubiaogongju
echo.
echo 💡 提示：
echo - 首次部署通常需要2-5分钟
echo - 确保在GitHub Pages设置中选择了 'GitHub Actions' 作为源
echo - 如果网站无法访问，请检查Actions页面的部署日志
echo.

REM 尝试打开网站（可选）
set /p open_site="是否要在浏览器中打开网站？(y/n): "
if /i "%open_site%"=="y" (
    start https://jiuming1.github.io/tubiaogongju/
)

set /p open_actions="是否要查看部署状态？(y/n): "
if /i "%open_actions%"=="y" (
    start https://github.com/jiuming1/tubiaogongju/actions
)

echo.
pause