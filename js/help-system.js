// 帮助系统模块
class HelpSystem {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'usage';
        this.helpModal = null;
        this.helpBtn = null;
        
        // 帮助内容配置
        this.helpContent = {
            usage: {
                title: '使用指南',
                icon: 'fa-solid fa-book',
                content: this.getUsageContent()
            },
            shortcuts: {
                title: '快捷键',
                icon: 'fa-solid fa-keyboard',
                content: this.getShortcutsContent()
            },
            faq: {
                title: '常见问题',
                icon: 'fa-solid fa-question-circle',
                content: this.getFaqContent()
            }
        };
    }

    // 初始化帮助系统
    initialize() {
        if (this.isInitialized) {
            console.warn('HelpSystem already initialized');
            return;
        }

        try {
            console.log('HelpSystem: Creating modal...');
            this.createHelpModal();
            
            console.log('HelpSystem: Binding events...');
            this.bindEvents();
            
            console.log('HelpSystem: Setting up keyboard shortcuts...');
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('HelpSystem initialized successfully');
            
            // 验证关键元素
            console.log('HelpSystem verification:');
            console.log('- helpBtn:', !!this.helpBtn);
            console.log('- helpModal:', !!this.helpModal);
            
        } catch (error) {
            console.error('Failed to initialize HelpSystem:', error);
            console.error('Error stack:', error.stack);
        }
    }

    // 创建帮助模态框
    createHelpModal() {
        // 检查是否已存在
        if (document.getElementById('help-modal')) {
            document.getElementById('help-modal').remove();
        }

        const modalHTML = `
            <div id="help-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
                <div class="bg-white rounded-lg shadow-xl max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
                    <!-- 模态框头部 -->
                    <div class="flex justify-between items-center p-6 border-b border-gray-200">
                        <div class="flex items-center">
                            <i class="fa-solid fa-question-circle text-primary text-xl mr-3"></i>
                            <h3 class="text-xl font-semibold text-gray-800">使用帮助</h3>
                        </div>
                        <button id="close-help-modal" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fa-solid fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- 标签页导航 -->
                    <div class="border-b border-gray-200">
                        <nav class="flex px-6">
                            ${this.generateTabNavigation()}
                        </nav>
                    </div>
                    
                    <!-- 内容区域 -->
                    <div class="p-6 overflow-y-auto max-h-[60vh]">
                        ${this.generateTabContent()}
                    </div>
                    
                    <!-- 模态框底部 -->
                    <div class="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                        <div class="text-sm text-gray-500">
                            <i class="fa-solid fa-lightbulb mr-1"></i>
                            提示：按 <kbd class="px-2 py-1 bg-white border rounded text-xs">F1</kbd> 随时打开帮助
                        </div>
                        <button id="close-help-modal-btn" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.helpModal = document.getElementById('help-modal');
    }

    // 生成标签页导航
    generateTabNavigation() {
        return Object.entries(this.helpContent).map(([key, content]) => `
            <button class="help-tab-btn px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                key === this.currentTab 
                    ? 'text-primary border-primary' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }" data-tab="${key}">
                <i class="${content.icon} mr-2"></i>
                ${content.title}
            </button>
        `).join('');
    }

    // 生成标签页内容
    generateTabContent() {
        return Object.entries(this.helpContent).map(([key, content]) => `
            <div id="help-${key}" class="help-tab-content ${key === this.currentTab ? '' : 'hidden'}">
                ${content.content}
            </div>
        `).join('');
    }

    // 获取使用指南内容
    getUsageContent() {
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                    <div class="flex items-center">
                        <i class="fa-solid fa-info-circle text-blue-400 mr-2"></i>
                        <h4 class="text-blue-800 font-medium">欢迎使用数据可视化工具</h4>
                    </div>
                    <p class="text-blue-700 text-sm mt-1">这是一个强大的在线数据可视化工具，支持多种图表类型和数据格式。</p>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                            <div>
                                <h4 class="font-medium text-gray-800 mb-2">📁 上传数据文件</h4>
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>• 支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式</li>
                                    <li>• 点击"浏览文件"或直接拖拽文件</li>
                                    <li>• 文件大小限制：最大 10MB</li>
                                    <li>• 确保数据格式正确，第一行为列标题</li>
                                </ul>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                            <div>
                                <h4 class="font-medium text-gray-800 mb-2">📊 选择图表类型</h4>
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>• <strong>柱状图</strong>：比较不同类别的数值</li>
                                    <li>• <strong>折线图</strong>：显示数据随时间变化</li>
                                    <li>• <strong>饼图</strong>：显示部分与整体关系</li>
                                    <li>• <strong>散点图</strong>：显示两变量关系</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                            <div>
                                <h4 class="font-medium text-gray-800 mb-2">⚙️ 配置图表参数</h4>
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>• 系统自动检测数据类型</li>
                                    <li>• 选择合适的数据列作为坐标轴</li>
                                    <li>• 自定义颜色主题和样式</li>
                                    <li>• 添加图表标题和标签</li>
                                </ul>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
                            <div>
                                <h4 class="font-medium text-gray-800 mb-2">💾 导出图表</h4>
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>• 支持 PNG、JPG、SVG、PDF 格式</li>
                                    <li>• 自定义导出尺寸和背景</li>
                                    <li>• 高质量矢量图形输出</li>
                                    <li>• 一键下载到本地</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 获取快捷键内容
    getShortcutsContent() {
        const shortcuts = [
            { action: '生成图表', key: 'Ctrl + Enter', icon: 'fa-solid fa-chart-bar' },
            { action: '导出图表', key: 'Ctrl + S', icon: 'fa-solid fa-download' },
            { action: '显示帮助', key: 'F1', icon: 'fa-solid fa-question-circle' },
            { action: '关闭模态框', key: 'Escape', icon: 'fa-solid fa-times' },
            { action: '刷新页面', key: 'F5', icon: 'fa-solid fa-refresh' },
            { action: '全屏切换', key: 'F11', icon: 'fa-solid fa-expand' }
        ];

        return `
            <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-3 flex items-center">
                        <i class="fa-solid fa-keyboard text-primary mr-2"></i>
                        键盘快捷键
                    </h4>
                    <div class="grid gap-3">
                        ${shortcuts.map(shortcut => `
                            <div class="flex items-center justify-between py-2 px-3 bg-white rounded border">
                                <div class="flex items-center">
                                    <i class="${shortcut.icon} text-gray-500 mr-3 w-4"></i>
                                    <span class="text-gray-700">${shortcut.action}</span>
                                </div>
                                <kbd class="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">${shortcut.key}</kbd>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 class="font-medium text-yellow-800 mb-2 flex items-center">
                        <i class="fa-solid fa-lightbulb text-yellow-600 mr-2"></i>
                        使用技巧
                    </h4>
                    <ul class="text-sm text-yellow-700 space-y-1">
                        <li>• 使用 Tab 键在表单元素间快速切换</li>
                        <li>• 按住 Shift 键可以反向切换焦点</li>
                        <li>• 在文件上传区域按 Enter 键可以打开文件选择器</li>
                        <li>• 使用方向键可以在图表类型选项间导航</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // 获取FAQ内容
    getFaqContent() {
        const faqs = [
            {
                question: '为什么我的文件上传失败？',
                answer: '请检查：1) 文件格式是否正确（.xlsx, .xls, .csv）；2) 文件大小是否超过10MB；3) 文件是否包含有效数据；4) 网络连接是否正常。',
                icon: 'fa-solid fa-upload'
            },
            {
                question: '图表显示不正确怎么办？',
                answer: '请确保：1) 选择了正确的数据列；2) 数据格式符合图表类型要求；3) 数据中没有过多的空值；4) 数值列包含有效的数字。',
                icon: 'fa-solid fa-chart-line'
            },
            {
                question: '如何处理中文乱码问题？',
                answer: '对于CSV文件，请确保使用UTF-8编码保存。在Excel中，可以选择"另存为"时选择"CSV UTF-8"格式。Excel文件(.xlsx)通常不会有编码问题。',
                icon: 'fa-solid fa-language'
            },
            {
                question: '支持哪些数据格式？',
                answer: '支持数值型、文本型和日期型数据。系统会自动检测数据类型并在列选择器中标注。确保数值列不包含文本，日期列使用标准日期格式。',
                icon: 'fa-solid fa-database'
            },
            {
                question: '导出的图片质量如何调整？',
                answer: '可以在导出设置中调整图片尺寸。建议：1) 使用SVG格式获得最佳质量；2) PNG格式适合网页使用；3) 增大像素尺寸可提高清晰度。',
                icon: 'fa-solid fa-image'
            },
            {
                question: '如何创建复杂的图表？',
                answer: '1) 确保数据结构清晰；2) 选择合适的图表类型；3) 合理配置数据列映射；4) 使用颜色主题增强视觉效果；5) 添加标题和标签说明。',
                icon: 'fa-solid fa-cogs'
            }
        ];

        return `
            <div class="space-y-4">
                ${faqs.map((faq, index) => `
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button class="faq-toggle w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between" data-faq="${index}">
                            <div class="flex items-center">
                                <i class="${faq.icon} text-primary mr-3"></i>
                                <span class="font-medium text-gray-800">${faq.question}</span>
                            </div>
                            <i class="fa-solid fa-chevron-down text-gray-400 transition-transform faq-chevron"></i>
                        </button>
                        <div class="faq-content px-4 py-3 bg-white text-sm text-gray-600 hidden">
                            ${faq.answer}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        this.helpBtn = document.getElementById('help-btn');
        
        // 调试信息
        console.log('HelpSystem bindEvents - helpBtn found:', !!this.helpBtn);
        
        // 打开帮助
        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', (e) => {
                console.log('Help button clicked');
                e.preventDefault();
                this.openModal();
            });
            console.log('Help button event listener added');
        } else {
            console.error('Help button not found! Element with id "help-btn" does not exist.');
        }

        // 等待模态框元素渲染完成后绑定其他事件
        setTimeout(() => {
            this.bindModalEvents();
        }, 100);
    }

    // 绑定模态框相关事件
    bindModalEvents() {
        const closeBtn = document.getElementById('close-help-modal');
        const closeModalBtn = document.getElementById('close-help-modal-btn');
        const tabBtns = document.querySelectorAll('.help-tab-btn');

        console.log('HelpSystem bindModalEvents - closeBtn found:', !!closeBtn);
        console.log('HelpSystem bindModalEvents - closeModalBtn found:', !!closeModalBtn);
        console.log('HelpSystem bindModalEvents - tabBtns found:', tabBtns.length);

        // 关闭帮助
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        // 标签页切换
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // 点击背景关闭
        if (this.helpModal) {
            this.helpModal.addEventListener('click', (e) => {
                if (e.target === this.helpModal) {
                    this.closeModal();
                }
            });
        }

        // FAQ折叠展开
        this.bindFaqEvents();
    }

    // 绑定FAQ事件
    bindFaqEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.faq-toggle')) {
                const toggle = e.target.closest('.faq-toggle');
                const content = toggle.nextElementSibling;
                const chevron = toggle.querySelector('.faq-chevron');
                
                content.classList.toggle('hidden');
                chevron.style.transform = content.classList.contains('hidden') 
                    ? 'rotate(0deg)' 
                    : 'rotate(180deg)';
            }
        });
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F1 打开帮助
            if (e.key === 'F1') {
                e.preventDefault();
                this.openModal();
            }
            
            // Escape 关闭帮助
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
    }

    // 打开模态框
    openModal() {
        console.log('openModal called');
        console.log('helpModal exists:', !!this.helpModal);
        
        if (this.helpModal) {
            console.log('Opening help modal...');
            this.helpModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // 聚焦到第一个可聚焦元素
            const firstFocusable = this.helpModal.querySelector('button, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            console.log('Help modal opened successfully');
        } else {
            console.error('Cannot open modal: helpModal is null');
        }
    }

    // 关闭模态框
    closeModal() {
        if (this.helpModal) {
            this.helpModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // 返回焦点到帮助按钮
            if (this.helpBtn) {
                this.helpBtn.focus();
            }
        }
    }

    // 检查模态框是否打开
    isModalOpen() {
        return this.helpModal && !this.helpModal.classList.contains('hidden');
    }

    // 切换标签页
    switchTab(tabName) {
        if (!this.helpContent[tabName]) return;

        this.currentTab = tabName;

        // 更新标签按钮状态
        document.querySelectorAll('.help-tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('text-primary', 'border-primary');
                btn.classList.remove('text-gray-500', 'border-transparent');
            } else {
                btn.classList.remove('text-primary', 'border-primary');
                btn.classList.add('text-gray-500', 'border-transparent');
            }
        });

        // 更新内容显示
        document.querySelectorAll('.help-tab-content').forEach(content => {
            if (content.id === `help-${tabName}`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    // 销毁帮助系统
    destroy() {
        if (this.helpModal) {
            this.helpModal.remove();
        }
        this.isInitialized = false;
        console.log('HelpSystem destroyed');
    }
}

// 全局实例
window.HelpSystem = HelpSystem;