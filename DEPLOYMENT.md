# 部署指南

本文档说明如何将数据可视化工具部署到GitHub Pages。

## 自动部署（推荐）

### 1. 准备GitHub仓库

1. 在GitHub上创建一个新的仓库
2. 将代码推送到仓库的`main`或`master`分支

### 2. 启用GitHub Pages

1. 进入GitHub仓库设置页面
2. 滚动到"Pages"部分
3. 在"Source"下选择"GitHub Actions"
4. 保存设置

### 3. 配置仓库权限

确保GitHub Actions有足够的权限：

1. 进入仓库设置 → Actions → General
2. 在"Workflow permissions"部分选择"Read and write permissions"
3. 勾选"Allow GitHub Actions to create and approve pull requests"

### 4. 推送代码触发部署

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

部署完成后，你的应用将在以下地址可用：
`https://your-username.github.io/repository-name/`

## 手动部署

如果你想手动部署，可以按照以下步骤：

### 1. 本地构建

```bash
cd data-visualization-tool
npm install
npm run build
```

### 2. 部署到GitHub Pages

1. 创建`gh-pages`分支
2. 将构建后的文件复制到该分支
3. 推送到GitHub

```bash
# 创建并切换到gh-pages分支
git checkout --orphan gh-pages

# 添加构建文件
git add .
git commit -m "Deploy to GitHub Pages"

# 推送到GitHub
git push origin gh-pages
```

## 自定义域名（可选）

如果你有自定义域名：

1. 在仓库根目录创建`CNAME`文件
2. 在文件中添加你的域名（如：`example.com`）
3. 在域名提供商处配置DNS记录指向GitHub Pages

## 故障排除

### 构建失败

1. 检查GitHub Actions日志
2. 确保所有依赖都在`package.json`中正确声明
3. 验证Node.js版本兼容性

### 页面无法访问

1. 确认GitHub Pages已启用
2. 检查仓库是否为公开状态
3. 验证分支设置是否正确

### CSS样式问题

1. 确保Tailwind CSS构建成功
2. 检查`css/output.css`文件是否存在
3. 验证HTML中的CSS链接路径

## 开发工作流

### 本地开发

```bash
# 启动开发服务器
npm start

# 监听CSS变化（另一个终端）
npm run dev
```

### 部署前测试

```bash
# 构建生产版本
npm run build

# 启动本地服务器测试
npm start
```

## 环境变量

如果需要配置环境变量，可以在GitHub仓库设置中添加：

1. 进入仓库设置 → Secrets and variables → Actions
2. 添加所需的环境变量
3. 在GitHub Actions工作流中使用

## 性能优化

### 启用压缩

GitHub Pages自动启用gzip压缩，无需额外配置。

### 缓存策略

静态资源会自动设置适当的缓存头。

### CDN加速

GitHub Pages使用全球CDN，确保快速访问。

## 监控和分析

### GitHub Pages分析

可以在仓库的Insights → Traffic中查看访问统计。

### 集成Google Analytics

在`index.html`中添加Google Analytics代码：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 安全考虑

### HTTPS

GitHub Pages自动提供HTTPS支持。

### 内容安全策略

考虑添加CSP头以增强安全性：

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;">
```

## 更新和维护

### 自动更新

每次推送到主分支都会触发自动部署。

### 版本管理

使用Git标签管理版本：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 回滚

如果需要回滚到之前的版本：

```bash
git revert <commit-hash>
git push origin main
```