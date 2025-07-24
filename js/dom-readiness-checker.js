// DOM就绪检查器
class DOMReadinessChecker {
    // 等待单个元素准备就绪
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                
                if (element) {
                    console.log(`Element found: ${selector}`);
                    resolve(element);
                    return;
                }
                
                const elapsed = Date.now() - startTime;
                if (elapsed >= timeout) {
                    const error = new Error(`Element not found within timeout: ${selector} (${timeout}ms)`);
                    console.error(error.message);
                    reject(error);
                    return;
                }
                
                // 继续检查
                setTimeout(checkElement, 50);
            };
            
            checkElement();
        });
    }
    
    // 等待多个元素准备就绪
    static waitForElements(selectors, timeout = 5000) {
        const promises = selectors.map(selector => this.waitForElement(selector, timeout));
        return Promise.all(promises);
    }
    
    // 确保元素列表都已准备就绪
    static async ensureElementsReady(elementIds, timeout = 5000) {
        const selectors = elementIds.map(id => `#${id}`);
        
        try {
            const elements = await this.waitForElements(selectors, timeout);
            
            // 创建元素映射
            const elementMap = {};
            elementIds.forEach((id, index) => {
                elementMap[id] = elements[index];
            });
            
            console.log('All elements ready:', elementIds);
            return elementMap;
        } catch (error) {
            console.error('Elements not ready:', error.message);
            throw new Error(`DOM elements not ready: ${error.message}`);
        }
    }
    
    // 安全地访问DOM元素
    static safeElementAccess(elementId, operation, timeout = 5000) {
        return new Promise(async (resolve, reject) => {
            try {
                const element = await this.waitForElement(`#${elementId}`, timeout);
                
                if (typeof operation === 'function') {
                    const result = operation(element);
                    resolve(result);
                } else {
                    resolve(element);
                }
            } catch (error) {
                reject(new Error(`Safe element access failed for ${elementId}: ${error.message}`));
            }
        });
    }
    
    // 检查元素是否存在且可见
    static isElementReady(selector) {
        const element = document.querySelector(selector);
        
        if (!element) {
            return { ready: false, reason: 'Element not found' };
        }
        
        // 检查元素是否在DOM中
        if (!document.contains(element)) {
            return { ready: false, reason: 'Element not in DOM' };
        }
        
        // 检查元素是否可见（不是display: none）
        const style = window.getComputedStyle(element);
        if (style.display === 'none') {
            return { ready: false, reason: 'Element is hidden (display: none)' };
        }
        
        return { ready: true, element: element };
    }
    
    // 批量检查元素状态
    static checkElementsStatus(selectors) {
        const status = {};
        
        selectors.forEach(selector => {
            status[selector] = this.isElementReady(selector);
        });
        
        return status;
    }
    
    // 等待DOM完全加载
    static waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    // 等待页面完全加载（包括图片等资源）
    static waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    // 创建元素观察器
    static createElementObserver(selector, callback, options = {}) {
        const { timeout = 10000, checkInterval = 100 } = options;
        
        let intervalId;
        let timeoutId;
        
        const cleanup = () => {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
        };
        
        return new Promise((resolve, reject) => {
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    cleanup();
                    if (callback) callback(element);
                    resolve(element);
                }
            };
            
            // 立即检查一次
            checkElement();
            
            // 定期检查
            intervalId = setInterval(checkElement, checkInterval);
            
            // 超时处理
            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`Element observer timeout: ${selector}`));
            }, timeout);
        });
    }
    
    // 验证表单元素是否可用
    static validateFormElements(formSelector) {
        return new Promise(async (resolve, reject) => {
            try {
                const form = await this.waitForElement(formSelector);
                
                // 检查表单中的关键元素
                const inputs = form.querySelectorAll('input, select, textarea, button');
                const elementStatus = [];
                
                inputs.forEach(input => {
                    const status = {
                        element: input,
                        id: input.id,
                        name: input.name,
                        type: input.type,
                        disabled: input.disabled,
                        required: input.required,
                        valid: input.checkValidity ? input.checkValidity() : true
                    };
                    elementStatus.push(status);
                });
                
                resolve({
                    form: form,
                    elements: elementStatus,
                    ready: true
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // 安全地设置元素内容
    static safeSetContent(elementId, content, contentType = 'text') {
        return this.safeElementAccess(elementId, (element) => {
            try {
                switch (contentType) {
                    case 'html':
                        element.innerHTML = content;
                        break;
                    case 'text':
                    default:
                        element.textContent = content;
                        break;
                }
                return true;
            } catch (error) {
                throw new Error(`Failed to set content for ${elementId}: ${error.message}`);
            }
        });
    }
    
    // 安全地添加事件监听器
    static safeAddEventListener(elementId, event, handler, options = {}) {
        return this.safeElementAccess(elementId, (element) => {
            try {
                element.addEventListener(event, handler, options);
                console.log(`Event listener added: ${elementId} -> ${event}`);
                return true;
            } catch (error) {
                throw new Error(`Failed to add event listener for ${elementId}: ${error.message}`);
            }
        });
    }
    
    // 安全地修改元素样式
    static safeModifyStyle(elementId, styles) {
        return this.safeElementAccess(elementId, (element) => {
            try {
                Object.keys(styles).forEach(property => {
                    element.style[property] = styles[property];
                });
                return true;
            } catch (error) {
                throw new Error(`Failed to modify styles for ${elementId}: ${error.message}`);
            }
        });
    }
    
    // 安全地添加/移除CSS类
    static safeToggleClass(elementId, className, add = true) {
        return this.safeElementAccess(elementId, (element) => {
            try {
                if (add) {
                    element.classList.add(className);
                } else {
                    element.classList.remove(className);
                }
                return true;
            } catch (error) {
                throw new Error(`Failed to toggle class for ${elementId}: ${error.message}`);
            }
        });
    }
    
    // 创建防御性DOM操作包装器
    static createSafeWrapper(elementId, timeout = 5000) {
        return {
            setContent: (content, type = 'text') => this.safeSetContent(elementId, content, type),
            addEventListener: (event, handler, options) => this.safeAddEventListener(elementId, event, handler, options),
            modifyStyle: (styles) => this.safeModifyStyle(elementId, styles),
            addClass: (className) => this.safeToggleClass(elementId, className, true),
            removeClass: (className) => this.safeToggleClass(elementId, className, false),
            access: (operation) => this.safeElementAccess(elementId, operation, timeout)
        };
    }
    
    // 调试工具：显示页面中所有元素的状态
    static debugElementStatus(selectors = []) {
        console.group('DOM Element Status Debug');
        
        // 如果没有提供选择器，检查常见的元素
        if (selectors.length === 0) {
            selectors = [
                '#drop-area', '#file-input', '#browse-btn', '#upload-progress',
                '#file-info', '#data-preview', '#chart-container', '#notification'
            ];
        }
        
        const status = this.checkElementsStatus(selectors);
        
        Object.keys(status).forEach(selector => {
            const elementStatus = status[selector];
            if (elementStatus.ready) {
                console.log(`✅ ${selector}: Ready`);
            } else {
                console.warn(`❌ ${selector}: ${elementStatus.reason}`);
            }
        });
        
        console.log('Document ready state:', document.readyState);
        console.log('Window loaded:', document.readyState === 'complete');
        
        console.groupEnd();
        
        return status;
    }
}