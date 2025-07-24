// 数据可视化工具 - 主应用程序
class DataVisualizationApp {
    constructor() {
        // 全局变量
        this.data = null;
        this.chart = null;
        this.selectedTheme = 'blue';
        this.selectedChartType = 'bar';
        this.selectedExportFormat = 'png';
        
        // 上传状态管理器
        this.uploadStateManager = new UploadStateManager();
        
        // DOM 元素
        this.initializeElements();
        
        // 初始化应用
        this.initialize();
    }
    
    // 初始化DOM元素引用
    initializeElements() {
        this.dropArea = document.getElementById('drop-area');
        this.fileInput = document.getElementById('file-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.uploadProgress = document.getElementById('upload-progress');
        this.progressBar = document.getElementById('progress-bar');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.removeFile = document.getElementById('remove-file');
        this.dataPreview = document.getElementById('data-preview');
        this.tableHeader = document.getElementById('table-header');
        this.tableBody = document.getElementById('table-body');
        this.xAxisSelect = document.getElementById('x-axis-select');
        this.yAxisSelect = document.getElementById('y-axis-select');
        this.chartTitle = document.getElementById('chart-title');
        this.showLegend = document.getElementById('show-legend');
        this.showGrid = document.getElementById('show-grid');
        this.generateChart = document.getElementById('generate-chart');
        this.chartContainer = document.getElementById('chart-container');
        this.chartCanvas = document.getElementById('chart-canvas');
        this.noChartMessage = document.getElementById('no-chart-message');
        this.exportChart = document.getElementById('export-chart');
        this.navExportBtn = document.getElementById('nav-export-btn');
        this.exportFilename = document.getElementById('export-filename');
        this.exportWidth = document.getElementById('export-width');
        this.exportHeight = document.getElementById('export-height');
        this.bgTransparent = document.getElementById('bg-transparent');
        this.bgWhite = document.getElementById('bg-white');
        this.navbar = document.getElementById('navbar');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.mobileExportBtn = document.getElementById('mobile-export-btn');
    }
    
    // 初始化应用
    initialize() {
        this.initializeEventListeners();
        this.initializeDefaults();
    }
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 导航栏滚动效果
        window.addEventListener('scroll', () => this.handleNavbarScroll());
        
        // 文件上传
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖放功能
        this.setupDragAndDrop();
        
        // 文件管理
        this.removeFile.addEventListener('click', () => this.handleFileRemove());
        
        // 图表类型选择
        this.setupChartTypeSelection();
        
        // 颜色主题选择
        this.setupThemeSelection();
        
        // 导出格式选择
        this.setupExportFormatSelection();
        
        // 图表生成
        this.generateChart.addEventListener('click', () => this.handleChartGeneration());
        
        // 图表导出
        this.exportChart.addEventListener('click', () => this.handleChartExport());
        this.navExportBtn.addEventListener('click', () => this.handleChartExport());
        
        // 移动端菜单
        this.setupMobileMenu();
        
        // 平滑滚动
        this.setupSmoothScrolling();
        
        // 键盘导航
        this.setupKeyboardNavigation();
    }
    
    // 初始化默认值
    initializeDefaults() {
        // 默认选择柱状图
        document.querySelector('.chart-type-option[data-type="bar"]').classList.add('bg-primary/10', 'text-primary');
        
        // 默认选择蓝色主题
        document.querySelector('.theme-btn[data-theme="blue"]').classList.add('ring-2', 'ring-offset-2', 'ring-primary');
        
        // 默认选择PNG导出格式
        document.querySelector('.export-option[data-format="png"]').classList.add('bg-primary/10', 'text-primary');
    }
    
    // 导航栏滚动效果
    handleNavbarScroll() {
        if (window.scrollY > 10) {
            this.navbar.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
        } else {
            this.navbar.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
        }
    }
    
    // 处理文件选择
    handleFileSelect(e) {
        if (e.target.files.length > 0) {
            this.handleFile(e.target.files[0]);
        }
    }
    
    // 设置拖放功能
    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropArea.addEventListener(eventName, () => this.highlight(), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropArea.addEventListener(eventName, () => this.unhighlight(), false);
        });
        
        this.dropArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlight() {
        this.dropArea.classList.add('border-primary', 'bg-primary/5');
    }
    
    unhighlight() {
        this.dropArea.classList.remove('border-primary', 'bg-primary/5');
    }
    
    handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    // 处理文件上传
    async handleFile(file) {
        // 检查是否可以开始上传
        if (!this.uploadStateManager.canStartUpload()) {
            const statusInfo = this.uploadStateManager.getStatusInfo();
            console.log('Upload blocked - current status:', statusInfo.status);
            NotificationSystem.show('警告', '文件上传正在进行中，请等待完成', 'warning');
            return;
        }

        try {
            // 开始上传状态管理
            this.uploadStateManager.startUpload(file);
            
            // 显示上传进度
            this.uploadProgress.classList.remove('hidden');
            this.simulateProgress();
            
            // 验证文件
            if (!this.validateFile(file)) {
                const validationError = new Error('File validation failed');
                const errorResult = UploadErrorHandler.handleError(validationError, {
                    operation: UploadErrorHandler.ERROR_TYPES.FILE_VALIDATION,
                    file: file
                });
                
                this.uploadStateManager.setError(validationError);
                const userMessage = UploadErrorHandler.createUserMessage(errorResult);
                NotificationSystem.show('错误', userMessage, 'error');
                this.uploadProgress.classList.add('hidden');
                return;
            }
            
            // 设置为处理状态
            this.uploadStateManager.setProcessing();
            
            // 读取和解析文件
            let data;
            try {
                data = await this.readAndParseFile(file);
            } catch (readError) {
                const errorResult = UploadErrorHandler.handleError(readError, {
                    operation: UploadErrorHandler.ERROR_TYPES.FILE_READ,
                    file: file
                });
                
                this.uploadStateManager.setError(readError);
                const userMessage = UploadErrorHandler.createUserMessage(errorResult);
                NotificationSystem.show('错误', userMessage, 'error');
                this.uploadProgress.classList.add('hidden');
                return;
            }
            
            // 验证解析后的数据
            if (!this.validateData(data)) {
                const dataError = new Error('文件中没有足够的数据');
                const errorResult = UploadErrorHandler.handleError(dataError, {
                    operation: UploadErrorHandler.ERROR_TYPES.PARSING,
                    file: file
                });
                
                this.uploadStateManager.setError(dataError);
                const userMessage = UploadErrorHandler.createUserMessage(errorResult);
                NotificationSystem.show('错误', userMessage, 'error');
                this.uploadProgress.classList.add('hidden');
                return;
            }
            
            // 更新应用状态
            try {
                this.data = data;
                this.updateFileInfo(file);
                this.populateTablePreview();
                this.populateColumnSelectors();
            } catch (domError) {
                const errorResult = UploadErrorHandler.handleError(domError, {
                    operation: UploadErrorHandler.ERROR_TYPES.DOM_ACCESS
                });
                
                this.uploadStateManager.setError(domError);
                const userMessage = UploadErrorHandler.createUserMessage(errorResult);
                NotificationSystem.show('错误', userMessage, 'error');
                this.uploadProgress.classList.add('hidden');
                return;
            }
            
            // 完成上传
            this.uploadStateManager.completeUpload();
            
            // 隐藏进度条
            this.uploadProgress.classList.add('hidden');
            
            NotificationSystem.show('成功', '文件上传成功', 'success');
        } catch (error) {
            // 处理未捕获的错误
            const errorResult = UploadErrorHandler.handleError(error, {
                operation: 'file-upload',
                file: file
            });
            
            this.uploadStateManager.setError(error);
            const userMessage = UploadErrorHandler.createUserMessage(errorResult);
            NotificationSystem.show('错误', userMessage, 'error');
            this.uploadProgress.classList.add('hidden');
        }
    }
    
    // 验证文件
    validateFile(file) {
        // 验证文件大小 (最大10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`文件大小超过限制：${FileHandler.formatFileSize(file.size)} > ${FileHandler.formatFileSize(maxSize)}`);
        }
        
        // 验证文件类型
        if (!FileHandler.validateFileType(file)) {
            throw new Error(`不支持的文件类型：${file.type || '未知'}。请上传Excel (.xlsx, .xls) 或CSV (.csv) 文件`);
        }
        
        return true;
    }
    
    // 读取和解析文件
    readAndParseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    let data;
                    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                        data = DataParser.parseExcel(e.target.result);
                    } else if (file.name.toLowerCase().endsWith('.csv')) {
                        data = DataParser.parseCSV(e.target.result);
                    }
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('读取文件时出错'));
            
            // 根据文件类型选择读取方式
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                reader.readAsBinaryString(file);
            } else {
                reader.readAsText(file);
            }
        });
    }
    
    // 验证数据
    validateData(data) {
        return data && data.length > 1 && data[0].length > 0;
    }
    
    // 更新文件信息
    updateFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = FileHandler.formatFileSize(file.size);
        this.fileInfo.classList.remove('hidden');
        this.dataPreview.classList.remove('hidden');
    }
    
    // 模拟上传进度
    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            this.progressBar.style.width = `${progress}%`;
            this.progressPercentage.textContent = `${Math.round(progress)}%`;
        }, 200);
    }
    
    // 填充表格预览
    populateTablePreview() {
        // 清空表格
        this.tableHeader.innerHTML = '';
        this.tableBody.innerHTML = '';
        
        // 添加表头
        const headerRow = document.createElement('tr');
        this.data[0].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            headerRow.appendChild(th);
        });
        this.tableHeader.appendChild(headerRow);
        
        // 添加数据行（最多显示10行）
        const rowsToDisplay = Math.min(this.data.length - 1, 10);
        for (let i = 1; i <= rowsToDisplay; i++) {
            const row = document.createElement('tr');
            row.className = i % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            
            this.data[i].forEach((cell, index) => {
                const td = document.createElement('td');
                td.textContent = cell || '';
                td.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500';
                row.appendChild(td);
            });
            
            this.tableBody.appendChild(row);
        }
        
        // 如果有更多数据，显示省略行
        if (this.data.length > 11) {
            const moreRow = document.createElement('tr');
            const moreTd = document.createElement('td');
            moreTd.colSpan = this.data[0].length;
            moreTd.className = 'px-4 py-3 text-center text-sm text-gray-400';
            moreTd.textContent = `... 和 ${this.data.length - 11} 更多行`;
            moreRow.appendChild(moreTd);
            this.tableBody.appendChild(moreRow);
        }
    }
    
    // 填充列选择器
    populateColumnSelectors() {
        // 清空选择器
        this.xAxisSelect.innerHTML = '<option value="">请选择...</option>';
        this.yAxisSelect.innerHTML = '<option value="">请选择...</option>';
        
        // 检测列数据类型
        const columnTypes = DataParser.detectColumnTypes(this.data);
        
        // 添加列选项
        this.data[0].forEach((column, index) => {
            const type = columnTypes[index];
            const typeLabel = type === 'number' ? ' (数值)' : type === 'date' ? ' (日期)' : ' (文本)';
            
            const xOption = document.createElement('option');
            xOption.value = index;
            xOption.textContent = column + typeLabel;
            this.xAxisSelect.appendChild(xOption);
            
            const yOption = document.createElement('option');
            yOption.value = index;
            yOption.textContent = column + typeLabel;
            this.yAxisSelect.appendChild(yOption);
        });
    }
    
    // 处理文件移除
    handleFileRemove() {
        this.fileInput.value = '';
        this.data = null;
        this.fileInfo.classList.add('hidden');
        this.dataPreview.classList.add('hidden');
        this.xAxisSelect.innerHTML = '<option value="">请选择...</option>';
        this.yAxisSelect.innerHTML = '<option value="">请选择...</option>';
        
        // 重置上传状态管理器
        this.uploadStateManager.reset();
        
        // 销毁现有图表
        this.destroyExistingChart();
        this.chartContainer.classList.add('hidden');
        this.noChartMessage.classList.remove('hidden');
        
        NotificationSystem.show('信息', '文件已移除', 'info');
    }
    
    // 设置图表类型选择
    setupChartTypeSelection() {
        document.querySelectorAll('.chart-type-option').forEach(option => {
            option.addEventListener('click', () => {
                // 移除所有选中状态
                document.querySelectorAll('.chart-type-option').forEach(opt => {
                    opt.classList.remove('bg-primary/10', 'text-primary');
                });
                
                // 添加选中状态
                option.classList.add('bg-primary/10', 'text-primary');
                this.selectedChartType = option.dataset.type;
            });
        });
    }
    
    // 设置主题选择
    setupThemeSelection() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有选中状态
                document.querySelectorAll('.theme-btn').forEach(b => {
                    b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary');
                });
                
                // 添加选中状态
                btn.classList.add('ring-2', 'ring-offset-2', 'ring-primary');
                this.selectedTheme = btn.dataset.theme;
            });
        });
    }
    
    // 设置导出格式选择
    setupExportFormatSelection() {
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', () => {
                // 移除所有选中状态
                document.querySelectorAll('.export-option').forEach(opt => {
                    opt.classList.remove('bg-primary/10', 'text-primary');
                });
                
                // 添加选中状态
                option.classList.add('bg-primary/10', 'text-primary');
                this.selectedExportFormat = option.dataset.format;
            });
        });
    }
    
    // 处理图表生成
    handleChartGeneration() {
        if (!this.data) {
            NotificationSystem.show('错误', '请先上传数据文件', 'error');
            return;
        }
        
        const xColumn = this.xAxisSelect.value;
        const yColumn = this.yAxisSelect.value;
        
        if (!xColumn || !yColumn) {
            NotificationSystem.show('错误', '请选择X轴和Y轴数据列', 'error');
            return;
        }
        
        if (xColumn === yColumn) {
            NotificationSystem.show('错误', 'X轴和Y轴不能选择相同的列', 'error');
            return;
        }
        
        // 显示加载状态
        this.setGenerateButtonLoading(true);
        
        try {
            // 使用setTimeout来让UI有时间更新
            setTimeout(() => {
                try {
                    this.createChart(this.selectedChartType, xColumn, yColumn);
                    NotificationSystem.show('成功', '图表生成成功', 'success');
                } catch (error) {
                    console.error('Chart generation error:', error);
                    NotificationSystem.show('错误', '生成图表时出错: ' + error.message, 'error');
                } finally {
                    this.setGenerateButtonLoading(false);
                }
            }, 100);
        } catch (error) {
            this.setGenerateButtonLoading(false);
            console.error('Chart generation error:', error);
            NotificationSystem.show('错误', '生成图表时出错: ' + error.message, 'error');
        }
    }
    
    // 设置生成按钮加载状态
    setGenerateButtonLoading(loading) {
        const button = this.generateChart;
        const icon = document.getElementById('generate-chart-icon');
        const text = document.getElementById('generate-chart-text');
        
        if (loading) {
            button.disabled = true;
            icon.className = 'fa-solid fa-spinner loading-spinner mr-2';
            text.textContent = '生成中...';
        } else {
            button.disabled = false;
            icon.className = 'fa-solid fa-refresh mr-2';
            text.textContent = '生成图表';
        }
    }
    
    // 创建图表
    createChart(type, xColumn, yColumn) {
        // 销毁现有图表
        this.destroyExistingChart();
        
        // 准备数据
        const chartData = ChartGenerator.prepareData(this.data, xColumn, yColumn);
        
        // 获取颜色主题
        const colors = ChartGenerator.getThemeColors(this.selectedTheme);
        
        // 创建图表配置
        const config = ChartGenerator.createConfig(type, chartData, colors, {
            title: this.chartTitle.value,
            showLegend: this.showLegend.checked,
            showGrid: this.showGrid.checked
        });
        
        // 创建图表
        try {
            this.chart = new Chart(this.chartCanvas, config);
            
            // 显示图表容器
            this.chartContainer.classList.remove('hidden');
            this.noChartMessage.classList.add('hidden');
        } catch (error) {
            // 如果创建失败，再次尝试销毁并重新创建
            console.warn('图表创建失败，尝试重新创建:', error);
            this.destroyExistingChart();
            
            // 短暂延迟后重试
            setTimeout(() => {
                this.chart = new Chart(this.chartCanvas, config);
                this.chartContainer.classList.remove('hidden');
                this.noChartMessage.classList.add('hidden');
            }, 100);
        }
    }
    
    // 销毁现有图表
    destroyExistingChart() {
        ChartGenerator.safeDestroyChart(this.chart, this.chartCanvas);
        this.chart = null;
    }
    
    // 处理图表导出
    async handleChartExport() {
        if (!this.chart) {
            NotificationSystem.show('错误', '请先生成图表', 'error');
            return;
        }
        
        const filename = this.exportFilename.value || 'chart';
        const width = parseInt(this.exportWidth.value) || 800;
        const height = parseInt(this.exportHeight.value) || 600;
        const background = this.bgWhite.checked ? '#FFFFFF' : 'transparent';
        
        // 显示加载状态
        this.setExportButtonLoading(true);
        
        try {
            await ExportManager.exportChart(this.chartContainer, this.selectedExportFormat, filename, width, height, background);
            NotificationSystem.show('成功', '图表导出成功', 'success');
        } catch (error) {
            console.error('Export error:', error);
            NotificationSystem.show('错误', '导出图表时出错: ' + error.message, 'error');
        } finally {
            this.setExportButtonLoading(false);
        }
    }
    
    // 设置导出按钮加载状态
    setExportButtonLoading(loading) {
        const button = this.exportChart;
        const navButton = this.navExportBtn;
        const mobileButton = this.mobileExportBtn;
        const icon = document.getElementById('export-chart-icon');
        const text = document.getElementById('export-chart-text');
        
        if (loading) {
            button.disabled = true;
            navButton.disabled = true;
            mobileButton.disabled = true;
            icon.className = 'fa-solid fa-spinner loading-spinner mr-2';
            text.textContent = '导出中...';
        } else {
            button.disabled = false;
            navButton.disabled = false;
            mobileButton.disabled = false;
            icon.className = 'fa-solid fa-download mr-2';
            text.textContent = '导出图表';
        }
    }
    
    // 设置移动端菜单
    setupMobileMenu() {
        this.mobileMenuBtn.addEventListener('click', () => {
            const isHidden = this.mobileMenu.classList.contains('hidden');
            if (isHidden) {
                this.mobileMenu.classList.remove('hidden');
                this.mobileMenuBtn.querySelector('i').className = 'fa-solid fa-times';
            } else {
                this.mobileMenu.classList.add('hidden');
                this.mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            }
        });
        
        // 移动端导出按钮
        this.mobileExportBtn.addEventListener('click', () => this.handleChartExport());
        
        // 点击菜单项后关闭菜单
        this.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.mobileMenu.classList.add('hidden');
                this.mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target) && !this.mobileMenu.classList.contains('hidden')) {
                this.mobileMenu.classList.add('hidden');
                this.mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            }
        });
    }
    
    // 设置平滑滚动
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // 设置键盘导航
    setupKeyboardNavigation() {
        // 为可交互元素添加键盘支持
        document.querySelectorAll('.chart-type-option, .export-option, .theme-btn').forEach(element => {
            // 添加tabindex使元素可聚焦
            element.setAttribute('tabindex', '0');
            
            // 添加键盘事件监听
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
            
            // 添加焦点样式
            element.addEventListener('focus', () => {
                element.classList.add('focus-visible');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focus-visible');
            });
        });
        
        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter 生成图表
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.generateChart.disabled) {
                    this.handleChartGeneration();
                }
            }
            
            // Ctrl/Cmd + S 导出图表
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.chart && !this.exportChart.disabled) {
                    this.handleChartExport();
                }
            }
            
            // Escape 关闭移动端菜单和帮助
            if (e.key === 'Escape') {
                if (!this.mobileMenu.classList.contains('hidden')) {
                    this.mobileMenu.classList.add('hidden');
                    this.mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
                }
                this.hideKeyboardHelp();
            }
            
            // F1 显示键盘快捷键帮助
            if (e.key === 'F1') {
                e.preventDefault();
                this.showKeyboardHelp();
            }
        });
        
        // 设置帮助系统
        this.setupHelpSystem();
    }
    
    // 设置帮助系统
    setupHelpSystem() {
        const closeHelpBtn = document.getElementById('close-keyboard-help');
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => this.hideKeyboardHelp());
        }
        
        // 为需要帮助提示的元素添加提示
        this.addHelpTooltip(this.dropArea, '支持拖拽上传 .xlsx, .xls, .csv 文件');
        this.addHelpTooltip(this.generateChart, '快捷键: Ctrl + Enter');
        this.addHelpTooltip(this.exportChart, '快捷键: Ctrl + S');
    }
    
    // 添加帮助提示
    addHelpTooltip(element, text) {
        if (!element) return;
        
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, text);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }
    
    // 显示提示
    showTooltip(element, text) {
        const tooltip = document.getElementById('help-tooltip');
        const content = document.getElementById('help-content');
        
        if (!tooltip || !content) return;
        
        content.textContent = text;
        tooltip.classList.remove('hidden');
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    }
    
    // 隐藏提示
    hideTooltip() {
        const tooltip = document.getElementById('help-tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }
    
    // 显示键盘快捷键帮助
    showKeyboardHelp() {
        const helpModal = document.getElementById('keyboard-help');
        if (helpModal) {
            helpModal.classList.remove('hidden');
        }
    }
    
    // 隐藏键盘快捷键帮助
    hideKeyboardHelp() {
        const helpModal = document.getElementById('keyboard-help');
        if (helpModal) {
            helpModal.classList.add('hidden');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DataVisualizationApp();
});