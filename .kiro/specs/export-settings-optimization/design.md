# 导出设置优化设计文档

## 概述

本设计文档描述了导出设置优化功能的技术架构和实现方案。目标是解决当前导出功能中用户不知道选择合适尺寸、图片清晰度不够等问题，提供智能化、用户友好的导出体验。

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    导出设置优化系统                          │
├─────────────────────────────────────────────────────────────┤
│  UI层                                                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   预设选择器     │ │   实时预览       │ │   质量控制       ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  业务逻辑层                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ 尺寸计算引擎     │ │ 质量优化器       │ │ 模板管理器       ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  数据层                                                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   预设配置       │ │   用户偏好       │ │   导出历史       ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

1. **ExportSettingsManager**: 导出设置管理器
2. **SizePresetManager**: 尺寸预设管理器
3. **QualityOptimizer**: 质量优化器
4. **PreviewGenerator**: 预览生成器
5. **TemplateManager**: 模板管理器

## 组件和接口

### ExportSettingsManager

```javascript
class ExportSettingsManager {
    constructor(chartContainer)
    
    // 核心方法
    initialize()
    getRecommendedSize(chartType, dataComplexity)
    updatePreview(settings)
    exportWithSettings(settings)
    
    // 事件处理
    onPresetChange(presetId)
    onCustomSizeChange(width, height)
    onQualityChange(quality)
    
    // 配置管理
    saveTemplate(name, settings)
    loadTemplate(templateId)
    getExportHistory()
}
```

### SizePresetManager

```javascript
class SizePresetManager {
    // 预设配置
    static PRESETS = {
        web: { name: '网页展示', sizes: [...] },
        print: { name: '打印输出', sizes: [...] },
        presentation: { name: '演示文稿', sizes: [...] },
        social: { name: '社交媒体', sizes: [...] }
    }
    
    // 方法
    getPresetsByCategory(category)
    getRecommendedPreset(chartType, usage)
    calculateOptimalSize(chartData)
}
```

### QualityOptimizer

```javascript
class QualityOptimizer {
    // 质量级别
    static QUALITY_LEVELS = {
        standard: { scale: 1, compression: 0.8 },
        high: { scale: 2, compression: 0.9 },
        ultra: { scale: 3, compression: 0.95 }
    }
    
    // 方法
    optimizeForFormat(format, quality)
    calculateFileSize(width, height, format, quality)
    getRecommendedQuality(usage, fileSize)
}
```

## 数据模型

### 导出设置模型

```javascript
const ExportSettings = {
    // 基本设置
    format: 'png', // png, jpg, svg, pdf
    width: 1920,
    height: 1080,
    
    // 质量设置
    quality: 'high', // standard, high, ultra
    dpi: 300,
    compression: 0.9,
    
    // 背景设置
    background: 'transparent', // transparent, white, custom
    backgroundColor: '#ffffff',
    
    // 高级设置
    antialiasing: true,
    smoothing: true,
    pixelRatio: 2,
    
    // 元数据
    filename: 'chart',
    timestamp: Date.now(),
    chartType: 'bar'
}
```

### 尺寸预设模型

```javascript
const SizePreset = {
    id: 'web-hd',
    name: 'HD网页 (1920×1080)',
    category: 'web',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    dpi: 96,
    usage: ['网页展示', '在线分享'],
    description: '适合高清网页展示和在线分享'
}
```

## 错误处理

### 错误类型定义

```javascript
const ExportErrors = {
    INVALID_SIZE: 'INVALID_SIZE',
    MEMORY_LIMIT: 'MEMORY_LIMIT',
    FORMAT_NOT_SUPPORTED: 'FORMAT_NOT_SUPPORTED',
    QUALITY_TOO_HIGH: 'QUALITY_TOO_HIGH',
    PREVIEW_FAILED: 'PREVIEW_FAILED'
}
```

### 错误处理策略

1. **尺寸验证错误**: 提供建议的尺寸范围
2. **内存限制错误**: 自动降低质量或尺寸
3. **格式不支持错误**: 提供替代格式建议
4. **预览失败错误**: 使用降级预览方案

## 测试策略

### 单元测试

1. **尺寸计算测试**
   - 测试不同图表类型的推荐尺寸计算
   - 测试纵横比保持逻辑
   - 测试边界值处理

2. **质量优化测试**
   - 测试不同质量级别的参数计算
   - 测试文件大小估算准确性
   - 测试格式特定的优化

3. **预设管理测试**
   - 测试预设加载和应用
   - 测试自定义预设保存
   - 测试预设分类和筛选

### 集成测试

1. **导出流程测试**
   - 测试完整的导出流程
   - 测试不同格式的导出结果
   - 测试批量导出功能

2. **预览功能测试**
   - 测试实时预览更新
   - 测试预览准确性
   - 测试预览性能

### 用户体验测试

1. **可用性测试**
   - 测试界面直观性
   - 测试操作流畅性
   - 测试错误提示清晰度

2. **性能测试**
   - 测试大尺寸导出性能
   - 测试预览生成速度
   - 测试内存使用情况

## 实现细节

### 智能尺寸推荐算法

```javascript
function calculateRecommendedSize(chartType, dataPoints, textLength) {
    const baseSize = CHART_BASE_SIZES[chartType];
    
    // 根据数据复杂度调整
    const complexityFactor = Math.min(dataPoints / 100, 2);
    
    // 根据文本长度调整
    const textFactor = Math.min(textLength / 50, 1.5);
    
    return {
        width: Math.round(baseSize.width * complexityFactor * textFactor),
        height: Math.round(baseSize.height * complexityFactor)
    };
}
```

### 高清导出优化

```javascript
function optimizeForHighDPI(canvas, settings) {
    const pixelRatio = settings.pixelRatio || window.devicePixelRatio || 1;
    
    // 设置实际尺寸
    canvas.width = settings.width * pixelRatio;
    canvas.height = settings.height * pixelRatio;
    
    // 设置显示尺寸
    canvas.style.width = settings.width + 'px';
    canvas.style.height = settings.height + 'px';
    
    // 缩放绘图上下文
    const ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);
    
    return canvas;
}
```

### 实时预览生成

```javascript
class PreviewGenerator {
    constructor(chartContainer) {
        this.container = chartContainer;
        this.previewCache = new Map();
    }
    
    async generatePreview(settings) {
        const cacheKey = this.getCacheKey(settings);
        
        if (this.previewCache.has(cacheKey)) {
            return this.previewCache.get(cacheKey);
        }
        
        const preview = await this.createPreview(settings);
        this.previewCache.set(cacheKey, preview);
        
        return preview;
    }
    
    createPreview(settings) {
        // 创建缩小版本的预览
        const previewSettings = {
            ...settings,
            width: Math.min(settings.width, 400),
            height: Math.min(settings.height, 300)
        };
        
        return html2canvas(this.container, previewSettings);
    }
}
```

## 性能优化

### 1. 预览缓存策略

- 使用LRU缓存存储预览图片
- 根据设置变化智能失效缓存
- 压缩预览图片减少内存占用

### 2. 异步处理

- 使用Web Workers处理大尺寸导出
- 实现渐进式预览加载
- 支持导出过程中的取消操作

### 3. 内存管理

- 监控内存使用情况
- 自动清理过期缓存
- 提供内存不足时的降级方案

## 用户界面设计

### 布局结构

```
┌─────────────────────────────────────────────────────────┐
│                    导出设置面板                          │
├─────────────────────────────────────────────────────────┤
│  预设选择  │  自定义尺寸  │  质量设置  │  预览窗口      │
│  ┌───────┐ │  ┌────────┐ │  ┌──────┐ │  ┌──────────┐  │
│  │ 网页  │ │  │ 宽度   │ │  │ 高质量│ │  │          │  │
│  │ 打印  │ │  │ 高度   │ │  │ 标准  │ │  │  预览图  │  │
│  │ 社交  │ │  │ 比例   │ │  │ 超高  │ │  │          │  │
│  └───────┘ │  └────────┘ │  └──────┘ │  └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  高级选项  │  模板管理  │  批量导出  │  导出按钮      │
└─────────────────────────────────────────────────────────┘
```

### 交互流程

1. **选择预设** → 自动填充尺寸 → 生成预览
2. **自定义尺寸** → 验证输入 → 更新预览
3. **调整质量** → 计算文件大小 → 更新预览
4. **确认导出** → 显示进度 → 完成下载

这个设计提供了完整的解决方案来优化导出设置，解决用户在尺寸选择和图片质量方面的困扰。"