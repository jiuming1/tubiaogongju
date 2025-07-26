// 数据可视化工具 - 主应用程序
class DataVisualizationApp {
    constructor() {
        console.log('DataVisualizationApp 构造函数被调用');
        console.trace('DataVisualizationApp 构造函数调用堆栈');

        // 检查是否已经有实例存在
        if (window.app) {
            console.warn('DataVisualizationApp 实例已存在，可能存在重复实例化');
        }

        // 全局变量
        this.data = null;
        this.chart = null;
        this.selectedTheme = 'blue';
        this.selectedChartType = 'bar';
        this.selectedExportFormat = 'png';

        // 上传状态管理器
        this.uploadStateManager = new UploadStateManager();

        // 导出事件管理器
        this.exportEventManager = new ExportEventManager();

        // 设置全局错误处理
        ExportEventManager.setupGlobalErrorHandler();

        // 开发模式下添加调试功能
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.setupDebugFeatures();
        }

        // 文件处理状态标志
        this.isProcessingFile = false;

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
        this.initializeHelpSystem();
    }

    // 初始化帮助系统
    initializeHelpSystem() {
        try {
            console.log('Initializing help system...');

            // 确保DOM元素存在
            const helpBtn = document.getElementById('help-btn');
            console.log('Help button element found:', !!helpBtn);

            if (!helpBtn) {
                console.error('Help button element not found, retrying in 100ms...');
                setTimeout(() => this.initializeHelpSystem(), 100);
                return;
            }

            // 创建帮助系统实例
            this.helpSystem = new HelpSystem();
            this.helpSystem.initialize();

            // 添加直接的事件监听器作为备用
            this.addDirectHelpButtonListener();

            console.log('Help system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize help system:', error);
            // 如果帮助系统初始化失败，至少添加基本的点击功能
            this.addDirectHelpButtonListener();
        }
    }

    // 添加直接的帮助按钮监听器
    addDirectHelpButtonListener() {
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn && !helpBtn.hasAttribute('data-direct-listener')) {
            console.log('Adding direct help button listener');
            helpBtn.addEventListener('click', (e) => {
                console.log('Direct help button clicked');
                e.preventDefault();

                if (this.helpSystem && this.helpSystem.openModal) {
                    this.helpSystem.openModal();
                } else {
                    // 如果帮助系统不可用，显示简单的alert
                    alert('帮助功能正在加载中，请稍后再试或按F1键打开帮助。');
                }
            });
            helpBtn.setAttribute('data-direct-listener', 'true');
            console.log('Direct help button listener added');
        }
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 导航栏滚动效果
        window.addEventListener('scroll', () => this.handleNavbarScroll());

        // 文件上传
        this.browseBtn.addEventListener('click', (e) => {
            console.log('browseBtn clicked - 事件来源:', e.isTrusted ? '用户点击' : '程序触发');
            console.log('browseBtn clicked - 调用栈:', new Error().stack);
            this.fileInput.click();
        });
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // 重写fileInput的click方法来追踪调用并添加防护
        const originalClick = this.fileInput.click.bind(this.fileInput);
        let lastClickTime = 0;
        const CLICK_DEBOUNCE_TIME = 1000; // 1秒内不允许重复点击

        this.fileInput.click = () => {
            const now = Date.now();
            console.log('fileInput.click() 被调用');
            console.log('调用栈:', new Error().stack);
            console.log('距离上次点击时间:', now - lastClickTime, 'ms');
            console.log('当前文件处理状态:', this.isProcessingFile);

            // 防止在文件处理期间触发
            if (this.isProcessingFile) {
                console.warn('fileInput.click() 被阻止 - 正在处理文件');
                return;
            }

            // 防止短时间内重复点击
            if (now - lastClickTime < CLICK_DEBOUNCE_TIME) {
                console.warn('fileInput.click() 被阻止 - 短时间内重复调用');
                return;
            }

            lastClickTime = now;
            return originalClick();
        };

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

        // 图表导出 - 使用导出事件管理器防止重复绑定
        this.exportEventManager.bindExportButton(this.exportChart, () => this.handleChartExport(), 'export-chart');
        this.exportEventManager.bindExportButton(this.navExportBtn, () => this.handleChartExport(), 'nav-export-btn');

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
        console.log('handleFileSelect - 触发文件选择事件');
        console.log('handleFileSelect - 事件来源:', e.isTrusted ? '用户操作' : '程序触发');
        console.log('handleFileSelect - 文件数量:', e.target.files.length);

        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log('handleFileSelect - 选择文件:', file.name);

            // 确保状态管理器处于可上传状态
            if (this.uploadStateManager.status === 'completed') {
                console.log('handleFileSelect - 重置已完成的状态');
                this.uploadStateManager.reset();
            }

            this.handleFile(file);
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
            console.log('handleDrop - 拖拽文件:', file.name);

            // 确保状态管理器处于可上传状态
            if (this.uploadStateManager.status === 'completed') {
                console.log('handleDrop - 重置已完成的状态');
                this.uploadStateManager.reset();
            }

            this.handleFile(file);
        }
    }

    // 处理文件上传
    async handleFile(file) {
        console.log('handleFile - 开始处理文件:', file.name);

        // 设置文件处理状态
        this.isProcessingFile = true;

        // 检查是否可以开始上传
        if (!this.uploadStateManager.canStartUpload()) {
            const statusInfo = this.uploadStateManager.getStatusInfo();
            console.log('Upload blocked - current status:', statusInfo.status);
            NotificationSystem.show('警告', '文件上传正在进行中，请等待完成', 'warning');
            this.isProcessingFile = false;
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
                this.isProcessingFile = false;
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
                this.isProcessingFile = false;
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
                this.isProcessingFile = false;
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
                this.isProcessingFile = false;
                return;
            }

            // 完成上传
            this.uploadStateManager.completeUpload();

            // 隐藏进度条
            this.uploadProgress.classList.add('hidden');

            NotificationSystem.show('成功', '文件上传成功', 'success');

            console.log('handleFile - 文件处理完成');
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

            console.log('handleFile - 文件处理出错');
        } finally {
            // 重置文件处理状态
            this.isProcessingFile = false;
            console.log('handleFile - 重置文件处理状态');
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
        // 根据当前选择的图表类型更新列选择器
        this.updateColumnSelectors();
    }

    // 处理文件移除
    handleFileRemove() {
        this.fileInput.value = '';
        this.data = null;
        this.fileInfo.classList.add('hidden');
        this.dataPreview.classList.add('hidden');

        // 实时获取并重置列选择器
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');
        if (xAxisSelect) xAxisSelect.innerHTML = '<option value="">请选择...</option>';
        if (yAxisSelect) yAxisSelect.innerHTML = '<option value="">请选择...</option>';

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

                // 根据图表类型更新列选择器
                this.updateColumnSelectors();
            });
        });
    }

    // 根据图表类型更新列选择器
    updateColumnSelectors() {
        if (!this.data) return;

        const chartType = this.selectedChartType;

        // 根据图表类型生成相应的列选择器
        this.generateOptimizedColumnSelectors(chartType);
    }

    // 生成优化的列选择器
    generateOptimizedColumnSelectors(chartType) {
        const columnSelectorsContainer = document.getElementById('column-selectors');

        // 检查容器是否存在
        if (!columnSelectorsContainer) {
            console.error('generateOptimizedColumnSelectors - column-selectors 容器不存在');
            throw new Error('列选择器容器未找到');
        }

        console.log('generateOptimizedColumnSelectors - 容器检查通过:', columnSelectorsContainer);

        // 检测列数据类型
        const columnTypes = AdvancedDataProcessor.detectAdvancedColumnTypes(this.data);

        // 获取图表类型配置
        const config = ChartTypeManager.getChartTypeConfig(chartType);

        let html = '';

        // 根据图表类型生成不同的列选择器
        switch (chartType) {
            case 'scatter':
                html = this.generateScatterColumnSelectors(columnTypes);
                break;
            case 'bubble':
                html = this.generateBubbleColumnSelectors(columnTypes);
                break;
            case 'area':
                html = this.generateAreaColumnSelectors(columnTypes);
                break;
            case 'boxplot':
                html = this.generateBoxPlotColumnSelectors(columnTypes);
                break;
            case 'heatmap':
                html = this.generateHeatmapColumnSelectors(columnTypes);
                break;
            case 'waterfall':
                html = this.generateWaterfallColumnSelectors(columnTypes);
                break;
            case 'gauge':
                html = this.generateGaugeColumnSelectors(columnTypes);
                break;
            case 'polarArea':
                html = this.generatePolarAreaColumnSelectors(columnTypes);
                break;
            default:
                // 基础图表类型使用默认的X/Y轴选择器
                html = this.generateBasicColumnSelectors(columnTypes, chartType);
        }

        console.log('generateOptimizedColumnSelectors - 设置HTML内容');
        columnSelectorsContainer.innerHTML = html;

        // 使用setTimeout确保DOM元素已经渲染
        setTimeout(() => {
            console.log('generateOptimizedColumnSelectors - DOM更新后检查');

            // 检查生成的DOM元素
            const elements = ['x-axis-select', 'y-axis-select', 'value-select', 'group-select'];
            elements.forEach(id => {
                const element = document.getElementById(id);
                console.log(`  ${id}:`, element ? `存在 (选项数: ${element.options.length})` : '不存在');
            });

            this.updateElementReferences();

            // 自动选择默认列
            this.autoSelectDefaultColumns(chartType);

            console.log('generateOptimizedColumnSelectors - 元素引用更新完成');
        }, 0);
    }

    // 更新DOM元素引用
    updateElementReferences() {
        this.xAxisSelect = document.getElementById('x-axis-select');
        this.yAxisSelect = document.getElementById('y-axis-select');
        this.sizeSelect = document.getElementById('size-select');
        this.valueSelect = document.getElementById('value-select');
        this.groupSelect = document.getElementById('group-select');
        this.categorySelect = document.getElementById('category-select');
        this.angleSelect = document.getElementById('angle-select');
        this.radiusSelect = document.getElementById('radius-select');
    }

    // 自动选择默认列
    autoSelectDefaultColumns(chartType) {
        console.log(`autoSelectDefaultColumns - 为 ${chartType} 自动选择默认列`);

        // 等待一小段时间确保DOM完全更新
        setTimeout(() => {
            const xAxisSelect = document.getElementById('x-axis-select');
            const yAxisSelect = document.getElementById('y-axis-select');
            const valueSelect = document.getElementById('value-select');
            const groupSelect = document.getElementById('group-select');
            const sizeSelect = document.getElementById('size-select');

            console.log('autoSelectDefaultColumns - DOM元素检查:');
            console.log('  xAxisSelect:', !!xAxisSelect, xAxisSelect ? `(${xAxisSelect.options.length} 选项)` : '');
            console.log('  yAxisSelect:', !!yAxisSelect, yAxisSelect ? `(${yAxisSelect.options.length} 选项)` : '');
            console.log('  valueSelect:', !!valueSelect, valueSelect ? `(${valueSelect.options.length} 选项)` : '');
            console.log('  groupSelect:', !!groupSelect, groupSelect ? `(${groupSelect.options.length} 选项)` : '');
            console.log('  sizeSelect:', !!sizeSelect, sizeSelect ? `(${sizeSelect.options.length} 选项)` : '');

            // 根据图表类型自动选择合适的默认列
            this.performAutoSelection(chartType, xAxisSelect, yAxisSelect, valueSelect, groupSelect, sizeSelect);

        }, 50); // 延迟50ms确保DOM稳定
    }

    // 执行自动选择逻辑
    performAutoSelection(chartType, xAxisSelect, yAxisSelect, valueSelect, groupSelect, sizeSelect) {
        console.log(`performAutoSelection - 开始为 ${chartType} 执行自动选择`);

        switch (chartType) {
            case 'area':
            case 'line':
            case 'bar':
                // 基础图表：选择前两个可用列
                if (xAxisSelect && xAxisSelect.options.length > 1) {
                    xAxisSelect.selectedIndex = 1;
                    console.log(`  X轴自动选择: ${xAxisSelect.value}`);
                }
                if (yAxisSelect && yAxisSelect.options.length > 2) {
                    yAxisSelect.selectedIndex = 2;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                } else if (yAxisSelect && yAxisSelect.options.length > 1) {
                    yAxisSelect.selectedIndex = 1;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                }
                break;

            case 'scatter':
                // 散点图：需要两个数值列
                this.selectNumericColumns(xAxisSelect, yAxisSelect, null, null, null, 'scatter');
                break;

            case 'heatmap':
                // 热力图：需要X、Y、值三个维度
                if (xAxisSelect && xAxisSelect.options.length > 1) {
                    xAxisSelect.selectedIndex = 1;
                    console.log(`  X轴自动选择: ${xAxisSelect.value}`);
                }
                if (yAxisSelect && yAxisSelect.options.length > 2) {
                    yAxisSelect.selectedIndex = 2;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                }
                if (valueSelect && valueSelect.options.length > 3) {
                    valueSelect.selectedIndex = 3;
                    console.log(`  值自动选择: ${valueSelect.value}`);
                } else if (valueSelect && valueSelect.options.length > 1) {
                    // 如果只有少量列，选择最后一个作为值
                    valueSelect.selectedIndex = valueSelect.options.length - 1;
                    console.log(`  值自动选择: ${valueSelect.value}`);
                }
                break;

            case 'waterfall':
                // 瀑布图：需要类别和数值
                if (xAxisSelect && xAxisSelect.options.length > 1) {
                    xAxisSelect.selectedIndex = 1;
                    console.log(`  X轴自动选择: ${xAxisSelect.value}`);
                }
                if (yAxisSelect && yAxisSelect.options.length > 2) {
                    yAxisSelect.selectedIndex = 2;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                } else if (yAxisSelect && yAxisSelect.options.length > 1) {
                    yAxisSelect.selectedIndex = 1;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                }
                break;

            case 'gauge':
                // 仪表盘图：只需要一个数值列
                if (yAxisSelect && yAxisSelect.options.length > 1) {
                    // 优先选择数值类型的列
                    let selectedIndex = 1;
                    for (let i = 1; i < yAxisSelect.options.length; i++) {
                        const optionText = yAxisSelect.options[i].text.toLowerCase();
                        if (optionText.includes('数值') || optionText.includes('值') ||
                            optionText.includes('rate') || optionText.includes('percent')) {
                            selectedIndex = i;
                            break;
                        }
                    }
                    yAxisSelect.selectedIndex = selectedIndex;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                }
                break;

            case 'bubble':
                // 气泡图：需要X、Y、大小三个数值列
                this.selectNumericColumns(xAxisSelect, yAxisSelect, null, null, sizeSelect, 'bubble');
                break;

            case 'boxplot':
                // 箱线图：需要数值列，分组列可选
                if (yAxisSelect && yAxisSelect.options.length > 1) {
                    yAxisSelect.selectedIndex = yAxisSelect.options.length > 2 ? 2 : 1;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                }
                if (groupSelect && groupSelect.options.length > 1) {
                    groupSelect.selectedIndex = 1;
                    console.log(`  分组自动选择: ${groupSelect.value}`);
                }
                break;

            default:
                // 默认情况：选择前两个可用列
                if (xAxisSelect && xAxisSelect.options.length > 1) {
                    xAxisSelect.selectedIndex = 1;
                    console.log(`  X轴自动选择: ${xAxisSelect.value}`);
                }
                if (yAxisSelect && yAxisSelect.options.length > 2) {
                    yAxisSelect.selectedIndex = 2;
                    console.log(`  Y轴自动选择: ${yAxisSelect.value}`);
                }
                break;
        }

        console.log('performAutoSelection - 自动选择完成');

        // 验证选择结果
        setTimeout(() => {
            console.log('performAutoSelection - 验证选择结果:');
            if (xAxisSelect) console.log(`  X轴最终值: "${xAxisSelect.value}"`);
            if (yAxisSelect) console.log(`  Y轴最终值: "${yAxisSelect.value}"`);
            if (valueSelect) console.log(`  值最终值: "${valueSelect.value}"`);
            if (groupSelect) console.log(`  分组最终值: "${groupSelect.value}"`);
            if (sizeSelect) console.log(`  大小最终值: "${sizeSelect.value}"`);
        }, 10);
    }

    // 智能选择数值列
    selectNumericColumns(xAxisSelect, yAxisSelect, valueSelect, groupSelect, sizeSelect, chartType) {
        console.log(`selectNumericColumns - 为 ${chartType} 智能选择数值列`);

        // 分析数据，找出数值列
        const numericColumns = this.findNumericColumns();
        console.log(`  发现 ${numericColumns.length} 个数值列:`, numericColumns);

        if (numericColumns.length < 2 && (chartType === 'scatter' || chartType === 'bubble')) {
            console.log(`  警告: ${chartType} 需要至少2个数值列，但只找到 ${numericColumns.length} 个`);
        }

        // 为散点图选择列
        if (chartType === 'scatter') {
            if (xAxisSelect && numericColumns.length > 0) {
                const xIndex = numericColumns[0] + 1; // +1 因为选项中第0个是空选项
                if (xIndex < xAxisSelect.options.length) {
                    xAxisSelect.selectedIndex = xIndex;
                    console.log(`  X轴选择数值列: ${xAxisSelect.value} (${xAxisSelect.options[xIndex].text})`);
                }
            }

            if (yAxisSelect && numericColumns.length > 1) {
                const yIndex = numericColumns[1] + 1;
                if (yIndex < yAxisSelect.options.length) {
                    yAxisSelect.selectedIndex = yIndex;
                    console.log(`  Y轴选择数值列: ${yAxisSelect.value} (${yAxisSelect.options[yIndex].text})`);
                }
            }
        }

        // 为气泡图选择列
        if (chartType === 'bubble') {
            if (xAxisSelect && numericColumns.length > 0) {
                const xIndex = numericColumns[0] + 1;
                if (xIndex < xAxisSelect.options.length) {
                    xAxisSelect.selectedIndex = xIndex;
                    console.log(`  X轴选择数值列: ${xAxisSelect.value} (${xAxisSelect.options[xIndex].text})`);
                }
            }

            if (yAxisSelect && numericColumns.length > 1) {
                const yIndex = numericColumns[1] + 1;
                if (yIndex < yAxisSelect.options.length) {
                    yAxisSelect.selectedIndex = yIndex;
                    console.log(`  Y轴选择数值列: ${yAxisSelect.value} (${yAxisSelect.options[yIndex].text})`);
                }
            }

            if (sizeSelect && numericColumns.length > 2) {
                const sizeIndex = numericColumns[2] + 1;
                if (sizeIndex < sizeSelect.options.length) {
                    sizeSelect.selectedIndex = sizeIndex;
                    console.log(`  大小选择数值列: ${sizeSelect.value} (${sizeSelect.options[sizeIndex].text})`);
                }
            } else if (sizeSelect && numericColumns.length > 0) {
                // 如果没有第三个数值列，重复使用第一个
                const sizeIndex = numericColumns[0] + 1;
                if (sizeIndex < sizeSelect.options.length) {
                    sizeSelect.selectedIndex = sizeIndex;
                    console.log(`  大小选择数值列(重复): ${sizeSelect.value} (${sizeSelect.options[sizeIndex].text})`);
                }
            }
        }
    }

    // 找出数据中的数值列
    findNumericColumns() {
        if (!this.data || this.data.length < 2) {
            return [];
        }

        const numericColumns = [];
        const columnCount = this.data[0].length;

        // 检查每一列
        for (let col = 0; col < columnCount; col++) {
            let numericCount = 0;
            let totalCount = 0;

            // 检查该列的数据（跳过表头）
            for (let row = 1; row < this.data.length; row++) {
                const value = this.data[row][col];
                if (value !== null && value !== undefined && value !== '') {
                    totalCount++;
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && isFinite(numValue)) {
                        numericCount++;
                    }
                }
            }

            // 如果80%以上的数据是数值，认为是数值列
            const numericRatio = totalCount > 0 ? numericCount / totalCount : 0;
            if (numericRatio >= 0.8) {
                numericColumns.push(col);
                console.log(`  列${col} (${this.data[0][col]}) 是数值列: ${numericCount}/${totalCount} (${Math.round(numericRatio * 100)}%)`);
            } else {
                console.log(`  列${col} (${this.data[0][col]}) 不是数值列: ${numericCount}/${totalCount} (${Math.round(numericRatio * 100)}%)`);
            }
        }

        return numericColumns;
    }

    // 确保列已被选择
    ensureColumnsSelected() {
        console.log('ensureColumnsSelected - 检查列选择状态');

        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');
        const valueSelect = document.getElementById('value-select');
        const groupSelect = document.getElementById('group-select');

        let needsAutoSelect = false;

        // 检查是否有空的必需选择器
        if (xAxisSelect && xAxisSelect.value === '' && xAxisSelect.options.length > 1) {
            console.log('ensureColumnsSelected - X轴选择器为空，需要自动选择');
            needsAutoSelect = true;
        }

        if (yAxisSelect && yAxisSelect.value === '' && yAxisSelect.options.length > 1) {
            console.log('ensureColumnsSelected - Y轴选择器为空，需要自动选择');
            needsAutoSelect = true;
        }

        if (valueSelect && valueSelect.value === '' && valueSelect.options.length > 1) {
            console.log('ensureColumnsSelected - 值选择器为空，需要自动选择');
            needsAutoSelect = true;
        }

        if (needsAutoSelect) {
            console.log('ensureColumnsSelected - 执行自动选择');
            this.autoSelectDefaultColumns(this.selectedChartType);

            // 再次检查选择结果
            setTimeout(() => {
                console.log('ensureColumnsSelected - 自动选择后的状态:');
                if (xAxisSelect) console.log(`  X轴: "${xAxisSelect.value}"`);
                if (yAxisSelect) console.log(`  Y轴: "${yAxisSelect.value}"`);
                if (valueSelect) console.log(`  值: "${valueSelect.value}"`);
                if (groupSelect) console.log(`  分组: "${groupSelect.value}"`);
            }, 100);
        } else {
            console.log('ensureColumnsSelected - 列选择状态正常');
        }
    }

    // 生成基础图表类型的列选择器
    generateBasicColumnSelectors(columnTypes, chartType) {
        const chartTypeNames = {
            'bar': '柱状图',
            'line': '折线图',
            'pie': '饼图',
            'doughnut': '环形图',
            'radar': '雷达图'
        };

        const chartName = chartTypeNames[chartType] || '图表';

        return `
            <div class="space-y-4">
                <div class="bg-blue-50 p-3 rounded-lg">
                    <p class="text-sm text-blue-700 mb-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        ${chartName}需要选择类别和数值数据
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-tag mr-1 text-gray-500"></i>
                        类别/标签 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择类别列...</option>
                        ${this.generateColumnOptions(columnTypes, ['text', 'date'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择用作图表标签的列</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-1 text-gray-500"></i>
                        数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择用作图表数值的列</p>
                </div>
            </div>
        `;
    }

    // 生成散点图列选择器
    generateScatterColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-purple-50 p-3 rounded-lg">
                    <p class="text-sm text-purple-700 mb-2">
                        <i class="fas fa-braille mr-1"></i>
                        散点图用于展示两个数值变量之间的关系
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-arrows-alt-h mr-1 text-gray-500"></i>
                        X轴数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择X轴数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择水平轴的数值数据</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-arrows-alt-v mr-1 text-gray-500"></i>
                        Y轴数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择Y轴数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择垂直轴的数值数据</p>
                </div>
            </div>
        `;
    }

    // 生成气泡图列选择器
    generateBubbleColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-green-50 p-3 rounded-lg">
                    <p class="text-sm text-green-700 mb-2">
                        <i class="fas fa-circle-dot mr-1"></i>
                        气泡图可以同时展示三个维度的数据关系
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-arrows-alt-h mr-1 text-gray-500"></i>
                        X轴数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择X轴数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-arrows-alt-v mr-1 text-gray-500"></i>
                        Y轴数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择Y轴数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-expand-arrows-alt mr-1 text-gray-500"></i>
                        气泡大小 <span class="text-red-500">*</span>
                    </label>
                    <select id="size-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择气泡大小列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">数值越大，气泡越大</p>
                </div>
            </div>
        `;
    }

    // 生成面积图列选择器
    generateAreaColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-indigo-50 p-3 rounded-lg">
                    <p class="text-sm text-indigo-700 mb-2">
                        <i class="fas fa-chart-area mr-1"></i>
                        面积图适合展示数据随时间的累积变化趋势
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-calendar mr-1 text-gray-500"></i>
                        时间/类别 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择时间或类别列...</option>
                        ${this.generateColumnOptions(columnTypes, ['text', 'date'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">通常选择时间序列数据</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-1 text-gray-500"></i>
                        累积数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择要累积显示的数值数据</p>
                </div>
            </div>
        `;
    }

    // 生成箱线图列选择器
    generateBoxPlotColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-yellow-50 p-3 rounded-lg">
                    <p class="text-sm text-yellow-700 mb-2">
                        <i class="fas fa-square-full mr-1"></i>
                        箱线图用于展示数据的分布特征和异常值
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-1 text-gray-500"></i>
                        数值数据 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择要分析分布的数值数据</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-layer-group mr-1 text-gray-500"></i>
                        分组 <span class="text-gray-400">(可选)</span>
                    </label>
                    <select id="group-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">不分组</option>
                        ${this.generateColumnOptions(columnTypes, ['text'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">可选择按类别分组显示</p>
                </div>
            </div>
        `;
    }

    // 生成热力图列选择器
    generateHeatmapColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-red-50 p-3 rounded-lg">
                    <p class="text-sm text-red-700 mb-2">
                        <i class="fas fa-th-large mr-1"></i>
                        热力图用于展示二维数据的密度分布
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-arrows-alt-h mr-1 text-gray-500"></i>
                        X轴坐标 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择X轴坐标列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number', 'text'])}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-arrows-alt-v mr-1 text-gray-500"></i>
                        Y轴坐标 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择Y轴坐标列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number', 'text'])}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-thermometer-half mr-1 text-gray-500"></i>
                        强度值 <span class="text-red-500">*</span>
                    </label>
                    <select id="value-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择强度值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">数值决定颜色深浅</p>
                </div>
            </div>
        `;
    }

    // 生成瀑布图列选择器
    generateWaterfallColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-teal-50 p-3 rounded-lg">
                    <p class="text-sm text-teal-700 mb-2">
                        <i class="fas fa-chart-column mr-1"></i>
                        瀑布图用于展示数值的累积变化过程
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-tag mr-1 text-gray-500"></i>
                        项目/类别 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择项目类别列...</option>
                        ${this.generateColumnOptions(columnTypes, ['text'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择变化项目的名称</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-plus-minus mr-1 text-gray-500"></i>
                        变化值 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择变化值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">正值表示增加，负值表示减少</p>
                </div>
            </div>
        `;
    }

    // 生成仪表盘图列选择器
    generateGaugeColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-orange-50 p-3 rounded-lg">
                    <p class="text-sm text-orange-700 mb-2">
                        <i class="fas fa-tachometer-alt mr-1"></i>
                        仪表盘图用于直观展示KPI指标的完成情况
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-1 text-gray-500"></i>
                        指标数值 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择指标数值列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">选择要在仪表盘中显示的数值</p>
                </div>
                
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-xs text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        如果有多个数值，将显示平均值
                    </p>
                </div>
            </div>
        `;
    }

    // 生成极坐标图列选择器
    generatePolarAreaColumnSelectors(columnTypes) {
        return `
            <div class="space-y-4">
                <div class="bg-pink-50 p-3 rounded-lg">
                    <p class="text-sm text-pink-700 mb-2">
                        <i class="fas fa-compass mr-1"></i>
                        极坐标图用于展示周期性或方向性数据
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-sync-alt mr-1 text-gray-500"></i>
                        角度数据 <span class="text-red-500">*</span>
                    </label>
                    <select id="x-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择角度数据列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">角度值（0-360度）</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-expand-arrows-alt mr-1 text-gray-500"></i>
                        半径数据 <span class="text-red-500">*</span>
                    </label>
                    <select id="y-axis-select" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200">
                        <option value="">请选择半径数据列...</option>
                        ${this.generateColumnOptions(columnTypes, ['number'])}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">距离中心的距离值</p>
                </div>
            </div>
        `;
    }

    // 生成列选项HTML
    generateColumnOptions(columnTypes, allowedTypes) {
        let options = '';

        this.data[0].forEach((column, index) => {
            const type = columnTypes[index];
            const typeLabel = type ? ` (${ChartTypeManager.getTypeDisplayName(type.type)})` : '';

            // 检查列类型是否符合要求
            const isCompatible = !type || allowedTypes.includes(type.type) || type.confidence < 0.5;
            const className = isCompatible ? '' : 'text-gray-400';
            const disabled = isCompatible ? '' : 'disabled';

            options += `<option value="${index}" class="${className}" ${disabled}>${column}${typeLabel}</option>`;
        });

        return options;
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

        console.log('handleChartGeneration - 开始处理图表生成');
        console.log('handleChartGeneration - 当前图表类型:', this.selectedChartType);

        // 在获取列配置前，确保自动选择已执行
        this.ensureColumnsSelected();

        // 获取选中的列配置
        const selectedColumns = this.getSelectedColumns();
        console.log('handleChartGeneration - 获取到的列配置:', selectedColumns);

        // 验证选中的列
        console.log('handleChartGeneration - 验证前的数据检查:');
        console.log('  数据行数:', this.data.length);
        console.log('  数据列数:', this.data[0] ? this.data[0].length : 0);
        console.log('  表头:', this.data[0]);
        console.log('  第一行数据:', this.data[1]);
        console.log('  选择的列:', selectedColumns);

        // 检查选择的列对应的实际数据
        if (selectedColumns.xAxis !== undefined && selectedColumns.yAxis !== undefined) {
            console.log('  X轴列数据示例:', this.data.slice(1, 4).map(row => row[selectedColumns.xAxis]));
            console.log('  Y轴列数据示例:', this.data.slice(1, 4).map(row => row[selectedColumns.yAxis]));
        }

        const validation = ChartDataValidator.validateData(this.data, this.selectedChartType, selectedColumns);
        console.log('handleChartGeneration - 验证结果:', validation);

        if (!validation.valid) {
            console.error('handleChartGeneration - 验证失败:', validation.errors);
            NotificationSystem.show('错误', validation.errors.join(', '), 'error');
            return;
        }

        // 显示警告（如果有）
        if (validation.warnings && validation.warnings.length > 0) {
            validation.warnings.forEach(warning => {
                NotificationSystem.show('警告', warning, 'warning');
            });
        }

        // 显示加载状态
        this.setGenerateButtonLoading(true);

        try {
            // 使用setTimeout来让UI有时间更新
            setTimeout(() => {
                try {
                    this.createChart(this.selectedChartType, selectedColumns);
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

    // 获取选中的列配置
    getSelectedColumns() {
        const chartType = this.selectedChartType;
        let selectedColumns = {};

        // 根据图表类型获取相应的列选择
        switch (chartType) {
            case 'scatter':
                selectedColumns = this.getBasicColumns();
                break;
            case 'bubble':
                selectedColumns = this.getBubbleColumns();
                break;
            case 'area':
                selectedColumns = this.getBasicColumns();
                break;
            case 'boxplot':
                selectedColumns = this.getBoxPlotColumns();
                break;
            case 'heatmap':
                selectedColumns = this.getHeatmapColumns();
                break;
            case 'waterfall':
                selectedColumns = this.getWaterfallColumns();
                break;
            case 'gauge':
                selectedColumns = this.getGaugeColumns();
                break;
            case 'polarArea':
                selectedColumns = this.getBasicColumns();
                break;
            default:
                // 基础图表类型使用X/Y轴选择器
                selectedColumns = this.getBasicColumns();
        }

        return selectedColumns;
    }

    // 获取基础图表的列选择
    getBasicColumns() {
        // 实时获取元素，而不依赖缓存的引用
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');

        console.log(`getBasicColumns [${this.selectedChartType}] - DOM检查:`);
        console.log('  X轴选择器存在:', !!xAxisSelect);
        console.log('  Y轴选择器存在:', !!yAxisSelect);

        if (xAxisSelect) {
            console.log('  X轴选择器选项数:', xAxisSelect.options.length);
            console.log('  X轴选择器当前索引:', xAxisSelect.selectedIndex);
        }

        if (yAxisSelect) {
            console.log('  Y轴选择器选项数:', yAxisSelect.options.length);
            console.log('  Y轴选择器当前索引:', yAxisSelect.selectedIndex);
        }

        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';

        console.log(`getBasicColumns [${this.selectedChartType}] - 值检查:`);
        console.log('  X轴值:', `"${xColumn}"`, '类型:', typeof xColumn);
        console.log('  Y轴值:', `"${yColumn}"`, '类型:', typeof yColumn);

        // 修复验证逻辑：检查是否为空字符串，而不是falsy值
        if (xColumn === '' || yColumn === '') {
            console.error(`getBasicColumns [${this.selectedChartType}] - 缺少必要的列选择`);
            console.error('  X轴值:', `"${xColumn}"`);
            console.error('  Y轴值:', `"${yColumn}"`);

            // 检查是否是DOM元素不存在的问题
            if (!xAxisSelect) {
                console.error('  X轴选择器DOM元素不存在');
            }
            if (!yAxisSelect) {
                console.error('  Y轴选择器DOM元素不存在');
            }

            throw new Error('请选择X轴和Y轴数据列');
        }

        const result = {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn)
        };

        console.log(`getBasicColumns [${this.selectedChartType}] - 返回结果:`, result);
        return result;
    }

    // 获取气泡图的列选择
    getBubbleColumns() {
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');
        const sizeSelect = document.getElementById('size-select');

        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        const sizeColumn = sizeSelect ? sizeSelect.value : '';

        if (xColumn === '' || yColumn === '' || sizeColumn === '') {
            throw new Error('气泡图需要选择X轴、Y轴和气泡大小数据列');
        }

        return {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn),
            size: parseInt(sizeColumn)
        };
    }

    // 获取箱线图的列选择
    getBoxPlotColumns() {
        const yAxisSelect = document.getElementById('y-axis-select');
        const groupSelect = document.getElementById('group-select');

        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        const groupColumn = groupSelect ? groupSelect.value : '';

        if (yColumn === '') {
            throw new Error('箱线图需要选择数值数据列');
        }

        const columns = {
            yAxis: parseInt(yColumn),
            // ChartDataValidator期望的字段名
            values: parseInt(yColumn)
        };

        if (groupColumn && groupColumn !== '') {
            columns.group = parseInt(groupColumn);
            columns.groups = parseInt(groupColumn); // ChartDataValidator期望的字段名
        }

        return columns;
    }

    // 获取热力图的列选择
    getHeatmapColumns() {
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');
        const valueSelect = document.getElementById('value-select');

        console.log('getHeatmapColumns - DOM检查:');
        console.log('  X轴选择器存在:', !!xAxisSelect);
        console.log('  Y轴选择器存在:', !!yAxisSelect);
        console.log('  强度值选择器存在:', !!valueSelect);

        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        const valueColumn = valueSelect ? valueSelect.value : '';

        console.log('getHeatmapColumns - 值检查:');
        console.log('  X轴值:', `"${xColumn}"`);
        console.log('  Y轴值:', `"${yColumn}"`);
        console.log('  强度值:', `"${valueColumn}"`);

        if (xColumn === '' || yColumn === '' || valueColumn === '') {
            console.error('getHeatmapColumns - 缺少必要的列选择');
            console.error('  缺失的选择器:', [
                !xAxisSelect && 'X轴选择器DOM不存在',
                !yAxisSelect && 'Y轴选择器DOM不存在',
                !valueSelect && '强度值选择器DOM不存在',
                xColumn === '' && 'X轴未选择',
                yColumn === '' && 'Y轴未选择',
                valueColumn === '' && '强度值未选择'
            ].filter(Boolean));
            throw new Error('热力图需要选择X轴、Y轴和强度值数据列');
        }

        const result = {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn),
            value: parseInt(valueColumn)
        };

        console.log('getHeatmapColumns - 返回结果:', result);
        return result;
    }

    // 获取瀑布图的列选择
    getWaterfallColumns() {
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');

        console.log('getWaterfallColumns - DOM检查:');
        console.log('  X轴选择器存在:', !!xAxisSelect);
        console.log('  Y轴选择器存在:', !!yAxisSelect);

        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';

        console.log('getWaterfallColumns - 值检查:');
        console.log('  X轴值:', `"${xColumn}"`);
        console.log('  Y轴值:', `"${yColumn}"`);

        if (xColumn === '' || yColumn === '') {
            console.error('getWaterfallColumns - 缺少必要的列选择');
            console.error('  问题分析:', [
                !xAxisSelect && 'X轴选择器DOM不存在',
                !yAxisSelect && 'Y轴选择器DOM不存在',
                xColumn === '' && 'X轴未选择',
                yColumn === '' && 'Y轴未选择'
            ].filter(Boolean));
            throw new Error('瀑布图需要选择项目类别和变化值数据列');
        }

        const result = {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn),
            // ChartDataValidator期望的字段名
            category: parseInt(xColumn),
            value: parseInt(yColumn)
        };

        console.log('getWaterfallColumns - 返回结果:', result);
        return result;
    }

    // 获取仪表盘图的列选择
    getGaugeColumns() {
        const yAxisSelect = document.getElementById('y-axis-select');

        console.log('getGaugeColumns - DOM检查:');
        console.log('  Y轴选择器存在:', !!yAxisSelect);

        if (yAxisSelect) {
            console.log('  Y轴选择器选项数:', yAxisSelect.options.length);
            console.log('  Y轴选择器当前索引:', yAxisSelect.selectedIndex);
        }

        const yColumn = yAxisSelect ? yAxisSelect.value : '';

        console.log('getGaugeColumns - 值检查:');
        console.log('  Y轴值:', `"${yColumn}"`, '类型:', typeof yColumn);

        if (yColumn === '') {
            console.error('getGaugeColumns - 缺少必要的列选择');
            console.error('  问题分析:', [
                !yAxisSelect && 'Y轴选择器DOM不存在',
                yColumn === '' && 'Y轴未选择'
            ].filter(Boolean));
            throw new Error('仪表盘图需要选择指标数值数据列');
        }

        const result = {
            yAxis: parseInt(yColumn),
            // ChartDataValidator期望的字段名
            value: parseInt(yColumn)
        };

        console.log('getGaugeColumns - 返回结果:', result);
        return result;
    }

    // 获取极坐标图的列选择
    getPolarAreaColumns() {
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');

        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';

        if (xColumn === '' || yColumn === '') {
            throw new Error('极坐标图需要选择角度和半径数据列');
        }

        return {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn),
            angle: parseInt(xColumn),
            radius: parseInt(yColumn)
        };
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
    createChart(type, selectedColumns) {
        // 销毁现有图表
        this.destroyExistingChart();

        // 确保canvas完全清理和重置
        this.resetCanvas();

        // 获取颜色主题
        const colors = ChartGenerator.getThemeColors(this.selectedTheme);

        // 创建图表配置
        let config;

        try {
            // 检查是否为新的图表类型
            const newChartTypes = ['scatter', 'bubble', 'area', 'polarArea', 'boxplot', 'heatmap', 'waterfall', 'gauge'];

            console.log('创建图表:', { type, selectedColumns, dataLength: this.data.length });

            if (newChartTypes.includes(type)) {
                // 使用新的扩展方法
                console.log('使用扩展方法创建新图表类型:', type);
                const chartData = ChartGenerator.prepareMultiColumnData(this.data, selectedColumns, type);
                console.log('准备的图表数据:', chartData);

                config = ChartGenerator.createExtendedConfig(type, chartData, colors, {
                    title: this.chartTitle ? this.chartTitle.value : '',
                    showLegend: this.showLegend ? this.showLegend.checked : true,
                    showGrid: this.showGrid ? this.showGrid.checked : true
                });
                console.log('生成的图表配置:', config);
            } else {
                // 使用原有的方法处理基础图表类型
                console.log('使用基础方法创建传统图表类型:', type);
                const chartData = ChartGenerator.prepareData(this.data, selectedColumns.xAxis, selectedColumns.yAxis);
                config = ChartGenerator.createConfig(type, chartData, colors, {
                    title: this.chartTitle ? this.chartTitle.value : '',
                    showLegend: this.showLegend ? this.showLegend.checked : true,
                    showGrid: this.showGrid ? this.showGrid.checked : true
                });
            }
        } catch (error) {
            console.error('图表配置创建失败:', error);
            NotificationSystem.show('错误', '创建图表配置时出错: ' + error.message, 'error');
            return;
        }

        // 创建图表
        try {
            this.chart = ChartGenerator.safeCreateChart(this.chartCanvas, config);

            if (this.chart) {
                // 显示图表容器
                this.chartContainer.classList.remove('hidden');
                this.noChartMessage.classList.add('hidden');
                console.log('图表创建成功');
            } else {
                throw new Error('图表创建失败');
            }
        } catch (error) {
            // 如果创建失败，强制清理并重新创建
            console.warn('图表创建失败，尝试强制清理后重新创建:', error);

            // 强制清理所有可能的Chart实例
            this.forceCleanupChart();

            // 短暂延迟后重试
            setTimeout(() => {
                try {
                    console.log('尝试重新创建图表...');
                    this.chart = ChartGenerator.safeCreateChart(this.chartCanvas, config);

                    if (this.chart) {
                        this.chartContainer.classList.remove('hidden');
                        this.noChartMessage.classList.add('hidden');
                        console.log('图表重试创建成功');
                    } else {
                        throw new Error('重试创建失败');
                    }
                } catch (retryError) {
                    console.error('图表重试创建也失败:', retryError);
                    NotificationSystem.show('错误', '图表创建失败，请刷新页面后重试', 'error');
                }
            }, 100);
        }
    }

    // 销毁现有图表
    destroyExistingChart() {
        if (this.chart) {
            try {
                this.chart.destroy();
                console.log('现有图表已销毁');
            } catch (error) {
                console.warn('销毁图表时出现错误:', error);
            }
            this.chart = null;
        }

        // 额外的清理：检查canvas上是否还有Chart.js实例
        if (this.chartCanvas) {
            try {
                // 获取canvas上可能存在的Chart实例
                const existingChart = Chart.getChart(this.chartCanvas);
                if (existingChart) {
                    existingChart.destroy();
                    console.log('清理了canvas上的残留图表实例');
                }
            } catch (error) {
                console.warn('清理canvas时出现错误:', error);
            }
        }
    }

    // 重置Canvas元素
    resetCanvas() {
        if (this.chartCanvas) {
            try {
                // 清除canvas内容
                const ctx = this.chartCanvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
                }

                // 重置canvas属性
                this.chartCanvas.width = this.chartCanvas.width; // 这会清除canvas

                console.log('Canvas已重置');
            } catch (error) {
                console.warn('重置Canvas时出现错误:', error);
            }
        }
    }

    // 强制清理图表
    forceCleanupChart() {
        try {
            // 1. 销毁当前图表实例
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }

            // 2. 清理canvas上的所有Chart实例
            if (this.chartCanvas) {
                // 获取所有可能的Chart实例
                const existingChart = Chart.getChart(this.chartCanvas);
                if (existingChart) {
                    existingChart.destroy();
                }

                // 从Chart.js的全局注册表中移除
                const canvasId = this.chartCanvas.id;
                if (canvasId && Chart.instances) {
                    Object.keys(Chart.instances).forEach(id => {
                        const instance = Chart.instances[id];
                        if (instance && instance.canvas && instance.canvas.id === canvasId) {
                            instance.destroy();
                            delete Chart.instances[id];
                        }
                    });
                }
            }

            // 3. 重置canvas
            this.resetCanvas();

            console.log('强制清理完成');
        } catch (error) {
            console.error('强制清理时出现错误:', error);
        }
    }

    // 处理图表导出 - 状态管理已移至ExportEventManager
    async handleChartExport() {
        console.log('handleChartExport: 开始导出流程');
        console.trace('handleChartExport 调用堆栈');

        if (!this.chart) {
            console.warn('handleChartExport: 图表不存在');
            NotificationSystem.show('错误', '请先生成图表', 'error');
            return;
        }

        const filename = this.exportFilename.value || 'chart';
        const width = parseInt(this.exportWidth.value) || 800;
        const height = parseInt(this.exportHeight.value) || 600;
        const background = this.bgWhite.checked ? '#FFFFFF' : 'transparent';

        // 统一使用高质量设置
        const quality = 'high'; // 固定使用高质量，确保最佳导出效果

        console.log('handleChartExport: 导出参数:', {
            filename, width, height, background, quality,
            format: this.selectedExportFormat,
            exportManagerStatus: this.exportEventManager.getExportStatus()
        });

        try {
            // 执行导出 - 状态管理由ExportEventManager处理
            await ExportManager.exportChart(
                this.chartContainer,
                this.selectedExportFormat,
                filename,
                width,
                height,
                background,
                quality
            );

            console.log('handleChartExport: 导出成功');
            NotificationSystem.show('成功', '图表导出成功 (高清晰度)', 'success');

        } catch (error) {
            console.error('handleChartExport: 导出失败:', error);
            NotificationSystem.show('错误', '导出图表时出错: ' + error.message, 'error');
            throw error; // 重新抛出错误让ExportEventManager处理
        }
    }

    // 设置导出按钮加载状态 - 已移至ExportEventManager，保留用于向后兼容
    setExportButtonLoading(loading) {
        console.warn('setExportButtonLoading: 此方法已废弃，状态管理已移至ExportEventManager');
        // 委托给ExportEventManager处理
        if (this.exportEventManager) {
            this.exportEventManager.updateButtonStates(loading);
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

        // 移动端导出按钮 - 使用导出事件管理器
        this.exportEventManager.bindExportButton(this.mobileExportBtn, () => this.handleChartExport(), 'mobile-export-btn');

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

    // 设置调试功能（仅在开发环境）
    setupDebugFeatures() {
        console.log('设置导出调试功能...');

        // 添加全局调试对象
        window.exportDebug = {
            manager: this.exportEventManager,
            openDebugPanel: () => {
                const debugWindow = window.open(
                    'export-debug-panel.html',
                    'exportDebug',
                    'width=800,height=600,scrollbars=yes,resizable=yes'
                );
                if (debugWindow) {
                    console.log('导出调试面板已打开');
                } else {
                    console.error('无法打开调试面板，可能被弹窗阻止');
                }
            },
            getStatus: () => this.exportEventManager.getExportStatus(),
            getDebugInfo: () => this.exportEventManager.getDebugInfo(),
            reset: () => this.exportEventManager.manualReset(),
            healthCheck: () => this.exportEventManager.checkHealth()
        };

        // 添加键盘快捷键 Ctrl+Shift+D 打开调试面板
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                window.exportDebug.openDebugPanel();
            }
        });

        console.log('导出调试功能已设置，使用 Ctrl+Shift+D 打开调试面板');
        console.log('或在控制台使用 window.exportDebug 访问调试功能');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');

    // 检查关键元素是否存在
    const helpBtn = document.getElementById('help-btn');
    console.log('Help button found on DOM load:', !!helpBtn);

    window.app = new DataVisualizationApp();

    // 添加临时的直接事件监听器作为备用
    setTimeout(() => {
        const helpBtnBackup = document.getElementById('help-btn');
        if (helpBtnBackup && !helpBtnBackup.hasAttribute('data-backup-listener')) {
            console.log('Adding backup event listener to help button');
            helpBtnBackup.addEventListener('click', function (e) {
                console.log('Backup help button clicked');
                if (window.app && window.app.helpSystem) {
                    window.app.helpSystem.openModal();
                } else {
                    console.error('Help system not available');
                }
            });
            helpBtnBackup.setAttribute('data-backup-listener', 'true');
        }
    }, 500);
});