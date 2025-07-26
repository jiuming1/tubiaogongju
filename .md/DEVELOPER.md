# 开发者文档

## 项目架构

### 模块化设计

项目采用模块化架构，每个模块负责特定的功能：

```
DataVisualizationApp (主应用)
├── FileHandler (文件处理)
├── DataParser (数据解析)
├── ChartGenerator (图表生成)
├── ExportManager (导出管理)
└── NotificationSystem (通知系统)
```

### 核心类说明

#### DataVisualizationApp
主应用程序类，负责：
- 初始化所有模块
- 管理应用状态
- 协调各模块间的交互
- 处理用户界面事件

#### FileHandler
文件处理模块，负责：
- 文件类型验证
- 文件大小检查
- 文件读取
- 文件格式化工具

#### DataParser
数据解析模块，负责：
- Excel文件解析
- CSV文件解析
- 数据类型检测
- 数据验证

#### ChartGenerator
图表生成模块，负责：
- 图表数据准备
- Chart.js配置生成
- 主题颜色管理
- 图表实例管理

#### ExportManager
导出管理模块，负责：
- 图片格式导出
- PDF格式导出
- SVG格式导出
- 浏览器兼容性检查

#### NotificationSystem
通知系统模块，负责：
- 通知显示
- 通知类型管理
- 通知队列处理

## 代码规范

### JavaScript规范

1. **ES6+语法**: 使用现代JavaScript语法
2. **类和模块**: 使用ES6类和模块系统
3. **异步处理**: 使用async/await处理异步操作
4. **错误处理**: 使用try-catch处理异常
5. **命名规范**: 使用驼峰命名法

### 代码示例

```javascript
// 好的示例
class DataParser {
    static async parseFile(file) {
        try {
            const data = await this.readFile(file);
            return this.validateData(data);
        } catch (error) {
            throw new Error(`解析失败: ${error.message}`);
        }
    }
}

// 避免的写法
function parseFile(file, callback) {
    // 使用回调函数的旧式写法
}
```

### CSS规范

1. **Tailwind CSS**: 优先使用Tailwind工具类
2. **自定义样式**: 必要时在`<style>`标签中添加
3. **响应式设计**: 使用Tailwind的响应式前缀
4. **可访问性**: 考虑键盘导航和屏幕阅读器

## 开发环境设置

### 必需工具

1. **现代浏览器**: Chrome, Firefox, Safari, Edge
2. **代码编辑器**: VS Code, WebStorm等
3. **HTTP服务器**: 用于本地开发

### 推荐VS Code扩展

```json
{
    "recommendations": [
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "ritwickdey.liveserver"
    ]
}
```

### 本地开发

```bash
# 启动本地服务器
python -m http.server 8000
# 或
npx http-server
# 或使用VS Code Live Server扩展
```

## 添加新功能

### 1. 添加新的图表类型

```javascript
// 在ChartGenerator中添加新类型
static CHART_TYPES = {
    // 现有类型...
    SCATTER: 'scatter'  // 新增散点图
};

// 在createConfig方法中添加配置
static createConfig(type, chartData, colors, options = {}) {
    // 现有代码...
    
    if (type === 'scatter') {
        // 散点图特殊配置
        config.data.datasets[0].showLine = false;
    }
    
    return config;
}
```

### 2. 添加新的导出格式

```javascript
// 在ExportManager中添加新格式
static EXPORT_FORMATS = {
    // 现有格式...
    WEBP: 'webp'  // 新增WebP格式
};

// 在exportChart方法中添加处理逻辑
static async exportChart(container, format, filename, width, height, background) {
    if (format === 'webp') {
        return this.exportAsWebP(container, filename, width, height, background);
    }
    // 现有代码...
}
```

### 3. 添加新的数据源

```javascript
// 在DataParser中添加新的解析方法
static parseJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        return this.convertJSONToArray(data);
    } catch (error) {
        throw new Error('JSON解析失败');
    }
}
```

## 测试指南

### 单元测试

```javascript
// 在test-runner.html中添加新测试
testRunner.test('新功能测试', () => {
    const result = YourModule.yourMethod(testData);
    assertEquals(result.expected, actual, '测试失败消息');
});
```

### 集成测试

1. 测试完整的用户流程
2. 测试错误处理
3. 测试边界情况
4. 测试浏览器兼容性

### 性能测试

```javascript
// 性能测试示例
function performanceTest() {
    const start = performance.now();
    
    // 执行要测试的代码
    YourModule.expensiveOperation(largeDataSet);
    
    const end = performance.now();
    console.log(`执行时间: ${end - start}ms`);
}
```

## 调试技巧

### 1. 浏览器开发者工具

- **Console**: 查看日志和错误
- **Network**: 监控文件加载
- **Performance**: 分析性能问题
- **Memory**: 检查内存泄漏

### 2. 调试代码

```javascript
// 使用console.log调试
console.log('数据状态:', this.data);

// 使用debugger断点
debugger;

// 使用console.table显示表格数据
console.table(parsedData);
```

### 3. 错误处理

```javascript
// 详细的错误信息
try {
    // 可能出错的代码
} catch (error) {
    console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        context: { /* 相关上下文 */ }
    });
}
```

## 性能优化

### 1. 代码优化

- 使用事件委托减少事件监听器
- 避免频繁的DOM操作
- 使用requestAnimationFrame优化动画
- 实现虚拟滚动处理大数据

### 2. 资源优化

- 压缩JavaScript和CSS
- 使用CDN加载第三方库
- 实现懒加载
- 优化图片资源

### 3. 内存管理

```javascript
// 及时清理事件监听器
class MyComponent {
    destroy() {
        this.element.removeEventListener('click', this.handleClick);
        this.chart?.destroy();
        this.data = null;
    }
}
```

## 部署配置

### 1. 生产环境优化

```html
<!-- 启用压缩 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.min.js"></script>

<!-- 添加SRI完整性检查 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.min.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

### 2. 服务器配置

```nginx
# Nginx配置示例
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/data-visualization-tool;
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/css application/javascript;
    
    # 设置缓存头
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

## 常见问题

### 1. Chart.js相关

**问题**: 图表不显示
**解决**: 检查canvas元素是否正确初始化，数据格式是否正确

**问题**: 图表响应式问题
**解决**: 确保设置了`responsive: true`和`maintainAspectRatio: false`

**问题**: "Canvas is already in use" 错误
**解决**: 这是Chart.js的常见问题，需要在创建新图表前正确销毁旧图表
```javascript
// 正确的销毁方法
if (chart) {
    chart.destroy();
    chart = null;
}

// 清理Canvas
const ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);

// 清理Chart.js内部注册表
const existingChart = Chart.getChart(canvas);
if (existingChart) {
    existingChart.destroy();
}
```

### 2. 文件解析相关

**问题**: Excel文件解析失败
**解决**: 检查文件格式，确保使用正确的读取方式（binary vs text）

**问题**: CSV解析错误
**解决**: 处理引号和逗号的转义，考虑不同的换行符

### 3. 导出相关

**问题**: 导出的图片模糊
**解决**: 增加canvas的scale参数，使用高DPI设置

**问题**: PDF导出失败
**解决**: 检查jsPDF版本兼容性，确保正确的图片格式

## 贡献指南

### 1. 代码提交

```bash
# 创建功能分支
git checkout -b feature/new-chart-type

# 提交代码
git add .
git commit -m "feat: 添加散点图支持"

# 推送分支
git push origin feature/new-chart-type
```

### 2. 提交信息规范

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. Pull Request

1. 确保所有测试通过
2. 更新相关文档
3. 添加必要的测试用例
4. 描述清楚变更内容

## 版本发布

### 1. 版本号规范

使用语义化版本号：`MAJOR.MINOR.PATCH`

- MAJOR: 不兼容的API修改
- MINOR: 向后兼容的功能性新增
- PATCH: 向后兼容的问题修正

### 2. 发布流程

1. 更新版本号
2. 更新CHANGELOG
3. 创建发布标签
4. 部署到生产环境

## 联系方式

如有开发相关问题，请：

1. 查看现有文档
2. 搜索相关Issue
3. 创建新的Issue
4. 联系维护者

---

Happy Coding! 🚀