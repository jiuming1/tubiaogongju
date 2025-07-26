// 导出事件管理器
class ExportEventManager {
    constructor() {
        this.isExporting = false;
        this.boundButtons = new Set();
        this.exportStartTime = null;
        this.exportTimeout = 30000; // 30秒超时
        this.timeoutId = null;
        
        console.log('ExportEventManager initialized');
    }
    
    // 安全绑定导出事件，防止重复绑定
    bindExportButton(button, handler, buttonName = 'unknown') {
        if (!button) {
            console.warn(`ExportEventManager: 按钮 ${buttonName} 不存在`);
            return false;
        }
        
        const buttonKey = `${buttonName}_${button.id || 'no-id'}`;
        
        console.log(`ExportEventManager: 尝试绑定按钮 ${buttonName} (key: ${buttonKey})`);
        console.log(`ExportEventManager: 当前已绑定按钮:`, Array.from(this.boundButtons));
        
        if (this.boundButtons.has(buttonKey)) {
            console.warn(`ExportEventManager: 按钮 ${buttonName} 已经绑定过事件，跳过重复绑定`);
            return false;
        }
        
        // 创建包装的处理器，添加防重复执行逻辑
        const wrappedHandler = this.createSafeHandler(handler, buttonName);
        
        button.addEventListener('click', wrappedHandler);
        this.boundButtons.add(buttonKey);
        
        console.log(`ExportEventManager: 成功绑定 ${buttonName} 按钮事件`);
        console.log(`ExportEventManager: 绑定后的按钮列表:`, Array.from(this.boundButtons));
        return true;
    }
    
    // 创建安全的事件处理器
    createSafeHandler(originalHandler, buttonName) {
        return async (event) => {
            console.log(`ExportEventManager: ${buttonName} 按钮被点击`);
            
            // 检查是否正在导出
            if (this.isExporting) {
                console.warn(`ExportEventManager: 导出正在进行中，忽略 ${buttonName} 的点击`);
                this.showDuplicateWarning();
                return;
            }
            
            // 设置导出状态
            this.setExportingState(true);
            
            try {
                // 执行原始处理器 - 保持原始上下文
                await originalHandler(event);
                console.log(`ExportEventManager: ${buttonName} 导出操作完成`);
            } catch (error) {
                console.error(`ExportEventManager: ${buttonName} 导出操作失败:`, error);
                throw error;
            } finally {
                // 重置导出状态
                this.setExportingState(false);
            }
        };
    }
    
    // 设置导出状态
    setExportingState(isExporting) {
        this.isExporting = isExporting;
        
        if (isExporting) {
            this.exportStartTime = Date.now();
            console.log('ExportEventManager: 开始导出操作');
            
            // 设置超时保护
            this.timeoutId = setTimeout(() => {
                console.warn('ExportEventManager: 导出操作超时，自动重置状态');
                this.forceResetState();
            }, this.exportTimeout);
            
        } else {
            this.exportStartTime = null;
            console.log('ExportEventManager: 导出操作结束');
            
            // 清除超时定时器
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        }
        
        // 触发状态变化事件
        this.onExportStateChange(isExporting);
    }
    
    // 强制重置状态（用于异常情况）
    forceResetState() {
        console.warn('ExportEventManager: 强制重置导出状态');
        this.isExporting = false;
        this.exportStartTime = null;
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        this.onExportStateChange(false);
    }
    
    // 导出状态变化回调（可被重写）
    onExportStateChange(isExporting) {
        // 更新按钮状态
        this.updateButtonStates(isExporting);
        
        console.log(`ExportEventManager: 导出状态变化 -> ${isExporting ? '导出中' : '空闲'}`);
    }
    
    // 更新所有导出按钮的状态
    updateButtonStates(isExporting) {
        const buttons = [
            { id: 'export-chart', name: '主导出按钮' },
            { id: 'nav-export-btn', name: '导航导出按钮' },
            { id: 'mobile-export-btn', name: '移动端导出按钮' }
        ];
        
        buttons.forEach(({ id, name }) => {
            const button = document.getElementById(id);
            if (button) {
                this.setButtonLoadingState(button, isExporting, name);
            }
        });
        
        // 更新图标和文本
        this.updateExportButtonContent(isExporting);
    }
    
    // 设置单个按钮的加载状态
    setButtonLoadingState(button, loading, buttonName) {
        if (loading) {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
            console.log(`ExportEventManager: ${buttonName} 已禁用`);
        } else {
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
            console.log(`ExportEventManager: ${buttonName} 已启用`);
        }
    }
    
    // 更新导出按钮的图标和文本
    updateExportButtonContent(isExporting) {
        const icon = document.getElementById('export-chart-icon');
        const text = document.getElementById('export-chart-text');
        
        if (icon) {
            if (isExporting) {
                icon.className = 'fa-solid fa-spinner fa-spin mr-2';
            } else {
                icon.className = 'fa-solid fa-download mr-2';
            }
        }
        
        if (text) {
            if (isExporting) {
                text.textContent = '导出中...';
            } else {
                text.textContent = '导出图表';
            }
        }
    }
    
    // 显示重复操作警告
    showDuplicateWarning() {
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.show('提示', '导出正在进行中，请稍候...', 'warning');
        } else {
            console.warn('导出正在进行中，请稍候...');
        }
    }
    
    // 获取当前导出状态
    getExportStatus() {
        return {
            isExporting: this.isExporting,
            startTime: this.exportStartTime,
            duration: this.exportStartTime ? Date.now() - this.exportStartTime : 0,
            boundButtonsCount: this.boundButtons.size
        };
    }
    
    // 获取绑定的按钮列表
    getBoundButtons() {
        return Array.from(this.boundButtons);
    }
    
    // 清理资源
    destroy() {
        // 强制重置状态
        this.forceResetState();
        
        // 清空绑定记录
        this.boundButtons.clear();
        
        console.log('ExportEventManager: 资源已清理');
    }
    
    // 手动重置状态（用于紧急情况）
    manualReset() {
        console.warn('ExportEventManager: 执行手动重置');
        this.forceResetState();
        
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.show('信息', '导出状态已重置', 'info');
        }
        
        return this.getExportStatus();
    }
    
    // 检查导出状态健康度
    checkHealth() {
        const status = this.getExportStatus();
        const issues = [];
        
        // 检查是否有长时间运行的导出
        if (status.isExporting && status.duration > this.exportTimeout) {
            issues.push('导出操作超时');
        }
        
        // 检查按钮绑定状态
        if (status.boundButtonsCount === 0) {
            issues.push('没有绑定的导出按钮');
        }
        
        const isHealthy = issues.length === 0;
        
        console.log(`ExportEventManager健康检查: ${isHealthy ? '正常' : '异常'}`, {
            status,
            issues
        });
        
        return {
            isHealthy,
            issues,
            status
        };
    }
    
    // 调试信息
    getDebugInfo() {
        return {
            isExporting: this.isExporting,
            exportStartTime: this.exportStartTime,
            boundButtons: this.getBoundButtons(),
            status: this.getExportStatus(),
            health: this.checkHealth()
        };
    }
    
    // 全局错误处理器
    static setupGlobalErrorHandler() {
        // 监听未捕获的Promise错误
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && event.reason.message.includes('导出')) {
                console.error('ExportEventManager: 捕获到未处理的导出错误:', event.reason);
                
                // 尝试重置导出状态
                if (window.app && window.app.exportEventManager) {
                    window.app.exportEventManager.forceResetState();
                }
            }
        });
        
        console.log('ExportEventManager: 全局错误处理器已设置');
    }
}

// 导出类
window.ExportEventManager = ExportEventManager;