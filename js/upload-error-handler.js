// 上传错误处理器
class UploadErrorHandler {
    // 错误类型常量
    static ERROR_TYPES = {
        FILE_VALIDATION: 'file-validation',
        FILE_READ: 'file-read',
        PARSING: 'parsing',
        DOM_ACCESS: 'dom-access',
        MEMORY: 'memory',
        NETWORK: 'network',
        UNKNOWN: 'unknown'
    };
    
    // 处理错误的主要方法
    static handleError(error, context = {}) {
        const errorContext = this.createErrorContext(error, context);
        this.logError(errorContext);
        
        return {
            type: errorContext.operation || this.ERROR_TYPES.UNKNOWN,
            message: error.message,
            context: errorContext,
            timestamp: new Date().toISOString(),
            recoverable: this.isRecoverable(error, context)
        };
    }
    
    // 创建错误上下文
    static createErrorContext(error, context) {
        return {
            operation: context.operation || this.ERROR_TYPES.UNKNOWN,
            file: context.file ? {
                name: context.file.name,
                size: context.file.size,
                type: context.file.type,
                lastModified: context.file.lastModified
            } : null,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            stackTrace: error.stack,
            message: error.message,
            additionalInfo: context.additionalInfo || {}
        };
    }
    
    // 记录错误
    static logError(errorContext) {
        console.group(`🚨 Upload Error: ${errorContext.operation}`);
        console.error('Error Message:', errorContext.message);
        console.error('Stack Trace:', errorContext.stackTrace);
        
        if (errorContext.file) {
            console.info('File Info:', errorContext.file);
        }
        
        console.info('Context:', {
            timestamp: errorContext.timestamp,
            userAgent: errorContext.userAgent,
            url: errorContext.url,
            additionalInfo: errorContext.additionalInfo
        });
        
        console.groupEnd();
        
        // 在开发环境中，也可以发送到监控服务
        if (this.shouldReportError(errorContext)) {
            this.reportError(errorContext);
        }
    }
    
    // 判断错误是否可恢复
    static isRecoverable(error, context) {
        const operation = context.operation;
        
        switch (operation) {
            case this.ERROR_TYPES.FILE_VALIDATION:
                return true; // 用户可以选择其他文件
            case this.ERROR_TYPES.FILE_READ:
                return true; // 可以重试读取
            case this.ERROR_TYPES.PARSING:
                return true; // 可以尝试其他解析方法
            case this.ERROR_TYPES.DOM_ACCESS:
                return true; // DOM可能稍后可用
            case this.ERROR_TYPES.MEMORY:
                return false; // 内存问题通常需要刷新页面
            case this.ERROR_TYPES.NETWORK:
                return true; // 网络问题可以重试
            default:
                return false;
        }
    }
    
    // 创建用户友好的错误消息
    static createUserMessage(errorResult) {
        const { type, message, context } = errorResult;
        
        switch (type) {
            case this.ERROR_TYPES.FILE_VALIDATION:
                return this.getFileValidationMessage(message, context);
            case this.ERROR_TYPES.FILE_READ:
                return this.getFileReadMessage(message, context);
            case this.ERROR_TYPES.PARSING:
                return this.getParsingMessage(message, context);
            case this.ERROR_TYPES.DOM_ACCESS:
                return this.getDOMAccessMessage(message, context);
            case this.ERROR_TYPES.MEMORY:
                return this.getMemoryMessage(message, context);
            case this.ERROR_TYPES.NETWORK:
                return this.getNetworkMessage(message, context);
            default:
                return this.getGenericMessage(message, context);
        }
    }
    
    // 文件验证错误消息
    static getFileValidationMessage(message, context) {
        if (message.includes('文件大小')) {
            return '文件太大，请选择小于10MB的文件';
        }
        if (message.includes('文件类型') || message.includes('格式')) {
            return '不支持的文件格式，请上传Excel (.xlsx, .xls) 或CSV (.csv) 文件';
        }
        return '文件验证失败，请检查文件是否完整且格式正确';
    }
    
    // 文件读取错误消息
    static getFileReadMessage(message, context) {
        if (message.includes('网络') || message.includes('network')) {
            return '文件读取失败，请检查网络连接后重试';
        }
        if (message.includes('权限') || message.includes('permission')) {
            return '无法访问文件，请检查文件权限';
        }
        return '文件读取失败，请重新选择文件或稍后重试';
    }
    
    // 解析错误消息
    static getParsingMessage(message, context) {
        const fileName = context.file?.name || '文件';
        
        if (message.includes('Excel') || fileName.includes('.xlsx') || fileName.includes('.xls')) {
            return 'Excel文件解析失败，请确保文件未损坏且包含有效数据';
        }
        if (message.includes('CSV') || fileName.includes('.csv')) {
            return 'CSV文件解析失败，请检查文件格式是否正确';
        }
        if (message.includes('数据')) {
            return '文件中没有找到有效数据，请确保文件包含至少一行标题和一行数据';
        }
        return '文件解析失败，请检查文件内容是否正确';
    }
    
    // DOM访问错误消息
    static getDOMAccessMessage(message, context) {
        return '页面元素未准备就绪，请稍后重试或刷新页面';
    }
    
    // 内存错误消息
    static getMemoryMessage(message, context) {
        return '内存不足，请关闭其他标签页或刷新页面后重试';
    }
    
    // 网络错误消息
    static getNetworkMessage(message, context) {
        return '网络连接问题，请检查网络后重试';
    }
    
    // 通用错误消息
    static getGenericMessage(message, context) {
        return '处理文件时出现问题，请重试或联系技术支持';
    }
    
    // 判断是否应该报告错误
    static shouldReportError(errorContext) {
        // 在生产环境中，可以根据错误类型决定是否报告
        const criticalErrors = [
            this.ERROR_TYPES.MEMORY,
            this.ERROR_TYPES.UNKNOWN
        ];
        
        return criticalErrors.includes(errorContext.operation);
    }
    
    // 报告错误到监控服务
    static reportError(errorContext) {
        // 这里可以集成错误监控服务，如Sentry、LogRocket等
        console.info('Error reported to monitoring service:', errorContext);
        
        // 示例：发送到监控服务
        // if (window.Sentry) {
        //     window.Sentry.captureException(new Error(errorContext.message), {
        //         tags: {
        //             operation: errorContext.operation
        //         },
        //         extra: errorContext
        //     });
        // }
    }
    
    // 处理特定类型的错误
    static handleFileValidationError(error, file) {
        return this.handleError(error, {
            operation: this.ERROR_TYPES.FILE_VALIDATION,
            file: file
        });
    }
    
    static handleFileReadError(error, file) {
        return this.handleError(error, {
            operation: this.ERROR_TYPES.FILE_READ,
            file: file
        });
    }
    
    static handleParsingError(error, file) {
        return this.handleError(error, {
            operation: this.ERROR_TYPES.PARSING,
            file: file
        });
    }
    
    static handleDOMError(error, additionalInfo = {}) {
        return this.handleError(error, {
            operation: this.ERROR_TYPES.DOM_ACCESS,
            additionalInfo: additionalInfo
        });
    }
    
    static handleMemoryError(error, additionalInfo = {}) {
        return this.handleError(error, {
            operation: this.ERROR_TYPES.MEMORY,
            additionalInfo: additionalInfo
        });
    }
    
    // 错误恢复建议
    static getRecoveryActions(errorResult) {
        const { type } = errorResult;
        
        switch (type) {
            case this.ERROR_TYPES.FILE_VALIDATION:
                return [
                    '选择其他文件',
                    '检查文件格式是否正确',
                    '确保文件大小小于10MB'
                ];
            case this.ERROR_TYPES.FILE_READ:
                return [
                    '重新选择文件',
                    '检查文件是否损坏',
                    '稍后重试'
                ];
            case this.ERROR_TYPES.PARSING:
                return [
                    '检查文件内容格式',
                    '确保文件包含有效数据',
                    '尝试其他文件格式'
                ];
            case this.ERROR_TYPES.DOM_ACCESS:
                return [
                    '刷新页面',
                    '稍后重试',
                    '检查浏览器兼容性'
                ];
            case this.ERROR_TYPES.MEMORY:
                return [
                    '关闭其他标签页',
                    '刷新页面',
                    '使用较小的文件'
                ];
            default:
                return [
                    '刷新页面重试',
                    '联系技术支持'
                ];
        }
    }
}