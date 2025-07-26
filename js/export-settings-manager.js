// 导出设置管理器
class ExportSettingsManager {
    constructor(chartContainer) {
        this.chartContainer = chartContainer;
        this.currentSettings = this.getDefaultSettings();
        this.previewCache = new Map();
        this.templates = this.loadTemplates();
        this.history = this.loadHistory();
        
        // 事件监听器
        this.listeners = {
            settingsChange: [],
            previewUpdate: [],
            exportComplete: []
        };
        
        console.log('ExportSettingsManager initialized');
    }

    // 获取默认设置
    getDefaultSettings() {
        return {
            // 基本设置
            format: 'png',
            width: 1920,
            height: 1080,
            filename: 'chart',
            
            // 质量设置
            quality: 'high',
            dpi: 300,
            compression: 0.9,
            pixelRatio: 2,
            
            // 背景设置
            background: 'transparent',
            backgroundColor: '#ffffff',
            
            // 高级设置
            antialiasing: true,
            smoothing: true,
            
            // 元数据
            timestamp: Date.now(),
            chartType: 'unknown'
        };
    }

    // 验证设置
    validateSettings(settings) {
        const errors = [];
        const warnings = [];

        // 验证尺寸
        if (settings.width < 100 || settings.width > 8000) {
            errors.push('宽度必须在100-8000像素之间');
        }
        if (settings.height < 100 || settings.height > 8000) {
            errors.push('高度必须在100-8000像素之间');
        }

        // 验证格式
        const supportedFormats = ['png', 'jpg', 'jpeg', 'svg', 'pdf'];
        if (!supportedFormats.includes(settings.format.toLowerCase())) {
            errors.push(`不支持的格式: ${settings.format}`);
        }

        // 验证质量
        const supportedQualities = ['standard', 'high', 'ultra'];
        if (!supportedQualities.includes(settings.quality)) {
            errors.push(`不支持的质量级别: ${settings.quality}`);
        }

        // 检查内存使用
        const estimatedMemory = this.estimateMemoryUsage(settings);
        if (estimatedMemory > 500 * 1024 * 1024) { // 500MB
            warnings.push('导出尺寸较大，可能需要较长时间处理');
        }

        // 检查文件大小
        const estimatedSize = this.estimateFileSize(settings);
        if (estimatedSize > 50 * 1024 * 1024) { // 50MB
            warnings.push('预估文件大小较大，建议降低质量或尺寸');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    // 估算内存使用
    estimateMemoryUsage(settings) {
        const pixelCount = settings.width * settings.height * settings.pixelRatio;
        const bytesPerPixel = 4; // RGBA
        return pixelCount * bytesPerPixel;
    }

    // 估算文件大小
    estimateFileSize(settings) {
        const baseSize = settings.width * settings.height;
        
        switch (settings.format.toLowerCase()) {
            case 'png':
                return baseSize * 0.5 * settings.compression;
            case 'jpg':
            case 'jpeg':
                return baseSize * 0.1 * settings.compression;
            case 'svg':
                return Math.min(baseSize * 0.01, 1024 * 1024); // SVG通常较小
            case 'pdf':
                return baseSize * 0.3;
            default:
                return baseSize * 0.3;
        }
    }

    // 更新设置
    updateSettings(newSettings) {
        const mergedSettings = { ...this.currentSettings, ...newSettings };
        const validation = this.validateSettings(mergedSettings);
        
        if (!validation.valid) {
            throw new Error(`设置验证失败: ${validation.errors.join(', ')}`);
        }

        this.currentSettings = mergedSettings;
        this.currentSettings.timestamp = Date.now();
        
        // 触发设置变更事件
        this.emit('settingsChange', this.currentSettings, validation.warnings);
        
        console.log('Export settings updated:', this.currentSettings);
        return validation;
    }

    // 获取当前设置
    getCurrentSettings() {
        return { ...this.currentSettings };
    }

    // 根据图表类型获取推荐设置
    getRecommendedSettings(chartType, dataComplexity = 'medium') {
        const baseRecommendations = {
            bar: { width: 1200, height: 800 },
            line: { width: 1400, height: 800 },
            pie: { width: 1000, height: 1000 },
            scatter: { width: 1200, height: 1200 },
            area: { width: 1400, height: 900 },
            radar: { width: 1000, height: 1000 }
        };

        const base = baseRecommendations[chartType] || { width: 1200, height: 800 };
        
        // 根据数据复杂度调整
        const complexityMultipliers = {
            low: 0.8,
            medium: 1.0,
            high: 1.3,
            very_high: 1.6
        };

        const multiplier = complexityMultipliers[dataComplexity] || 1.0;
        
        return {
            ...this.getDefaultSettings(),
            width: Math.round(base.width * multiplier),
            height: Math.round(base.height * multiplier),
            chartType
        };
    }

    // 保存模板
    saveTemplate(name, description = '') {
        const template = {
            id: `template_${Date.now()}`,
            name,
            description,
            settings: { ...this.currentSettings },
            createdAt: Date.now()
        };

        this.templates.set(template.id, template);
        this.saveTemplates();
        
        console.log('Template saved:', template);
        return template.id;
    }

    // 加载模板
    loadTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`模板不存在: ${templateId}`);
        }

        this.updateSettings(template.settings);
        return template;
    }

    // 获取所有模板
    getTemplates() {
        return Array.from(this.templates.values());
    }

    // 删除模板
    deleteTemplate(templateId) {
        const deleted = this.templates.delete(templateId);
        if (deleted) {
            this.saveTemplates();
        }
        return deleted;
    }

    // 添加到历史记录
    addToHistory(settings, result) {
        const historyItem = {
            id: `history_${Date.now()}`,
            settings: { ...settings },
            result,
            timestamp: Date.now()
        };

        this.history.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        return historyItem;
    }

    // 获取历史记录
    getHistory() {
        return [...this.history];
    }

    // 清除历史记录
    clearHistory() {
        this.history = [];
        this.saveHistory();
    }

    // 执行导出
    async exportWithCurrentSettings() {
        const settings = this.getCurrentSettings();
        const validation = this.validateSettings(settings);
        
        if (!validation.valid) {
            throw new Error(`导出设置无效: ${validation.errors.join(', ')}`);
        }

        try {
            console.log('Starting export with settings:', settings);
            
            // 使用现有的ExportManager进行导出
            const result = await ExportManager.exportChart(
                this.chartContainer,
                settings.format,
                settings.filename,
                settings.width,
                settings.height,
                settings.background === 'white' ? '#FFFFFF' : 'transparent'
            );

            // 添加到历史记录
            this.addToHistory(settings, {
                success: true,
                filename: settings.filename,
                format: settings.format,
                size: this.estimateFileSize(settings)
            });

            // 触发导出完成事件
            this.emit('exportComplete', settings, result);
            
            console.log('Export completed successfully');
            return result;
            
        } catch (error) {
            console.error('Export failed:', error);
            
            // 添加失败记录到历史
            this.addToHistory(settings, {
                success: false,
                error: error.message
            });

            throw error;
        }
    }

    // 批量导出
    async batchExport(exportConfigs) {
        const results = [];
        
        for (const config of exportConfigs) {
            try {
                // 临时更新设置
                const originalSettings = this.getCurrentSettings();
                this.updateSettings(config);
                
                // 执行导出
                const result = await this.exportWithCurrentSettings();
                results.push({ config, result, success: true });
                
                // 恢复原始设置
                this.currentSettings = originalSettings;
                
            } catch (error) {
                results.push({ config, error: error.message, success: false });
            }
        }
        
        return results;
    }

    // 事件系统
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Event listener error for ${event}:`, error);
                }
            });
        }
    }

    // 本地存储管理
    saveTemplates() {
        try {
            const templatesArray = Array.from(this.templates.entries());
            localStorage.setItem('exportTemplates', JSON.stringify(templatesArray));
        } catch (error) {
            console.error('Failed to save templates:', error);
        }
    }

    loadTemplates() {
        try {
            const stored = localStorage.getItem('exportTemplates');
            if (stored) {
                const templatesArray = JSON.parse(stored);
                return new Map(templatesArray);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
        return new Map();
    }

    saveHistory() {
        try {
            localStorage.setItem('exportHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem('exportHistory');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
        return [];
    }

    // 清理资源
    destroy() {
        this.previewCache.clear();
        this.listeners = {};
        console.log('ExportSettingsManager destroyed');
    }
}

// 导出类
window.ExportSettingsManager = ExportSettingsManager;