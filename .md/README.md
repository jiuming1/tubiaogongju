<<<<<<< HEAD
# tubiaogongju
一个简单易用的Web数据可视化工具，支持Excel和CSV文件上传，快速生成各种类型的交互式图表。
=======
# 数据可视化工具 (DataViz)

一个简单易用的Web数据可视化工具，支持Excel和CSV文件上传，快速生成各种类型的交互式图表。

## 🌟 特性

- **多格式支持**: 支持 .xlsx, .xls, .csv 文件格式
- **多种图表类型**: 柱状图、折线图、饼图、环形图、雷达图、散点图、气泡图、面积图、极坐标图、箱线图、热力图、瀑布图、仪表盘图
- **实时预览**: 上传后立即预览数据
- **智能类型检测**: 自动检测数据列类型（数值、文本、日期）
- **主题定制**: 6种预设颜色主题
- **多格式导出**: 支持PNG、JPG、PDF、SVG格式导出
- **响应式设计**: 完美适配桌面和移动设备
- **键盘快捷键**: 提高操作效率
- **无服务器**: 纯前端实现，数据不会上传到服务器

## 🚀 快速开始

### 在线使用

1. 在浏览器中打开 `index.html`
2. 拖拽或选择Excel/CSV文件上传
3. 选择图表类型和数据列
4. 自定义图表样式
5. 生成并导出图表

### 本地部署

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd data-visualization-tool

# 使用任何HTTP服务器运行
# 例如使用Python
python -m http.server 8000

# 或使用Node.js的http-server
npx http-server

# 在浏览器中访问
# http://localhost:8000
```

## 📁 项目结构

```
data-visualization-tool/
├── index.html              # 主页面
├── js/                     # JavaScript模块
│   ├── app.js             # 主应用程序
│   ├── file-handler.js    # 文件处理模块
│   ├── data-parser.js     # 数据解析模块
│   ├── chart-generator.js # 图表生成模块
│   ├── export-manager.js  # 导出管理模块
│   └── notification-system.js # 通知系统
├── test-data/             # 测试数据文件
│   ├── sample-data.csv
│   ├── product-sales.csv
│   ├── large-dataset.csv
│   ├── empty-data.csv
│   └── special-characters.csv
├── tests/                 # 测试文件
│   ├── test-runner.html   # 测试运行器
│   └── README.md         # 测试说明
└── README.md             # 项目说明
```

## 🎯 使用指南

### 1. 上传数据

**支持的文件格式:**
- Excel文件 (.xlsx, .xls)
- CSV文件 (.csv)

**上传方式:**
- 拖拽文件到上传区域
- 点击"浏览文件"按钮选择文件

**文件限制:**
- 最大文件大小: 10MB
- 必须包含标题行
- 至少需要2行数据（标题行 + 数据行）

### 2. 数据预览

上传成功后，系统会：
- 显示前10行数据预览
- 自动检测列数据类型
- 在列选择器中标注数据类型

### 3. 选择图表类型

**可用图表类型:**

**基础图表:**
- **柱状图**: 适合比较不同类别的数值
- **折线图**: 适合显示趋势变化
- **饼图**: 适合显示部分与整体的关系
- **环形图**: 饼图的变体，中心留空
- **雷达图**: 适合多维数据比较

**高级图表:**
- **散点图**: 适合展示两个数值变量的相关性
- **气泡图**: 同时展示三个维度的数据关系
- **面积图**: 适合展示数据随时间的累积变化趋势

**专业图表:**
- **极坐标图**: 适合展示周期性或方向性数据
- **热力图**: 适合展示二维数据的密度分布

**统计图表:**
- **箱线图**: 适合展示数据分布特征和异常值

**财务图表:**
- **瀑布图**: 适合展示数值的累积变化过程

**KPI图表:**
- **仪表盘图**: 适合直观展示KPI指标完成情况

### 4. 配置图表

**数据列选择:**
- X轴/类别: 选择作为横轴或分类的列
- Y轴/数值: 选择作为数值的列

**图表选项:**
- 图表标题: 自定义图表标题
- 颜色主题: 选择预设的颜色主题
- 显示图例: 控制图例的显示/隐藏
- 显示网格线: 控制网格线的显示/隐藏

### 5. 导出图表

**支持格式:**
- PNG: 适合网页使用
- JPG: 适合打印和分享
- PDF: 适合文档嵌入
- SVG: 矢量格式，可无损缩放

**导出选项:**
- 自定义文件名
- 设置图片尺寸
- 选择背景（透明/白色）

## ⌨️ 键盘快捷键

- `Ctrl + Enter`: 生成图表
- `Ctrl + S`: 导出图表
- `F1`: 显示快捷键帮助
- `Escape`: 关闭菜单/对话框

## 🔧 技术栈

### 前端技术
- **HTML5**: 语义化标记
- **CSS3**: 现代样式和动画
- **JavaScript (ES6+)**: 模块化开发
- **Tailwind CSS**: 实用优先的CSS框架

### 第三方库
- **Chart.js**: 图表渲染库
- **SheetJS (XLSX)**: Excel文件解析
- **html2canvas**: HTML转图片
- **jsPDF**: PDF生成
- **Font Awesome**: 图标库

## 🌐 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 移动端支持

- 响应式设计，适配各种屏幕尺寸
- 触摸友好的交互元素
- 移动端优化的菜单和导航
- 支持移动设备文件选择

## 🧪 测试

### 运行测试

1. 在浏览器中打开 `tests/test-runner.html`
2. 点击"运行所有测试"
3. 查看测试结果

### 测试覆盖

- 文件处理功能
- 数据解析功能
- 图表生成功能
- 导出功能
- 错误处理
- 边界情况

详细测试说明请参考 `tests/README.md`

## 🚀 部署

### GitHub Pages 自动部署

本项目已配置GitHub Actions自动部署到GitHub Pages：

**在线访问地址**: https://jiuming1.github.io/tubiaogongju/

### 部署步骤

1. **克隆此仓库**：
   ```bash
   git clone https://github.com/jiuming1/tubiaogongju.git
   cd tubiaogongju
   ```

2. **启用GitHub Pages**：
   - 访问: https://github.com/jiuming1/tubiaogongju/settings/pages
   - 在Source部分选择"GitHub Actions"
   - 保存设置

3. **推送代码触发部署**：
   ```bash
   git push origin main
   ```

4. **查看部署状态**：
   - 访问: https://github.com/jiuming1/tubiaogongju/actions

### 快速部署

**Windows用户**：
1. 双击运行 `deploy.bat`
2. 按照提示操作

**命令行用户**：
```bash
npm install
npm run build:css
git add .
git commit -m "部署图表工具"
git push origin main
```

### 其他静态网站部署

本项目也可以部署到其他平台：

**推荐平台:**
- Netlify
- Vercel  
- Firebase Hosting

详细部署说明请参考：
- [DEPLOYMENT.md](DEPLOYMENT.md) - 英文版
- [部署指南.md](部署指南.md) - 中文版

### 服务器部署

如果需要在自己的服务器上部署：

```bash
# 使用Nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/data-visualization-tool;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请：

1. 查看现有的 [Issues](../../issues)
2. 如果问题不存在，创建新的 Issue
3. 提供详细的问题描述和复现步骤

## 📞 联系我们

- 项目主页: [GitHub Repository](../../)
- 问题反馈: [Issues](../../issues)
- 功能请求: [Feature Requests](../../issues/new?template=feature_request.md)

## 🙏 致谢

感谢以下开源项目：

- [Chart.js](https://www.chartjs.org/) - 强大的图表库
- [SheetJS](https://sheetjs.com/) - Excel文件处理
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Font Awesome](https://fontawesome.com/) - 图标库

---

**DataViz** - 让数据可视化变得简单 ✨
>>>>>>> 7495899 (部署图表可视化工具到GitHub Pages)
