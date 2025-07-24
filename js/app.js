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
        // 根据当前选择的图表类型更新列选择器
        this.updateColumnSelectors();
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
        
        columnSelectorsContainer.innerHTML = html;
        
        // 使用setTimeout确保DOM元素已经渲染
        setTimeout(() => {
            this.updateElementReferences();
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
        
        // 获取选中的列配置
        const selectedColumns = this.getSelectedColumns();
        
        // 验证选中的列
        const validation = ChartDataValidator.validateData(this.data, this.selectedChartType, selectedColumns);
        if (!validation.valid) {
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
                selectedColumns = this.getBasicColumns();
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
        
        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        
        console.log(`getBasicColumns [${this.selectedChartType}] - X轴选择器:`, xAxisSelect, '值:', xColumn, '类型:', typeof xColumn);
        console.log(`getBasicColumns [${this.selectedChartType}] - Y轴选择器:`, yAxisSelect, '值:', yColumn, '类型:', typeof yColumn);
        
        // 修复验证逻辑：检查是否为空字符串，而不是falsy值
        if (xColumn === '' || yColumn === '') {
            console.error(`getBasicColumns [${this.selectedChartType}] - 缺少必要的列选择, X轴: "${xColumn}", Y轴: "${yColumn}"`);
            throw new Error('请选择X轴和Y轴数据列');
        }
        
        return {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn)
        };
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
            yAxis: parseInt(yColumn)
        };
        
        if (groupColumn) {
            columns.group = parseInt(groupColumn);
        }
        
        return columns;
    }
    
    // 获取热力图的列选择
    getHeatmapColumns() {
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');
        const valueSelect = document.getElementById('value-select');
        
        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        const valueColumn = valueSelect ? valueSelect.value : '';
        
        console.log('getHeatmapColumns - X轴选择器:', xAxisSelect, '值:', xColumn);
        console.log('getHeatmapColumns - Y轴选择器:', yAxisSelect, '值:', yColumn);
        console.log('getHeatmapColumns - 强度值选择器:', valueSelect, '值:', valueColumn);
        
        if (xColumn === '' || yColumn === '' || valueColumn === '') {
            console.error('getHeatmapColumns - 缺少必要的列选择');
            throw new Error('热力图需要选择X轴、Y轴和强度值数据列');
        }
        
        return {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn),
            value: parseInt(valueColumn)
        };
    }
    
    // 获取瀑布图的列选择
    getWaterfallColumns() {
        const xAxisSelect = document.getElementById('x-axis-select');
        const yAxisSelect = document.getElementById('y-axis-select');
        
        const xColumn = xAxisSelect ? xAxisSelect.value : '';
        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        
        console.log('getWaterfallColumns - X轴选择器:', xAxisSelect, '值:', xColumn);
        console.log('getWaterfallColumns - Y轴选择器:', yAxisSelect, '值:', yColumn);
        
        if (xColumn === '' || yColumn === '') {
            console.error('getWaterfallColumns - 缺少必要的列选择');
            throw new Error('瀑布图需要选择项目类别和变化值数据列');
        }
        
        return {
            xAxis: parseInt(xColumn),
            yAxis: parseInt(yColumn),
            // ChartDataValidator期望的字段名
            category: parseInt(xColumn),
            value: parseInt(yColumn)
        };
    }
    
    // 获取仪表盘图的列选择
    getGaugeColumns() {
        const yAxisSelect = document.getElementById('y-axis-select');
        
        const yColumn = yAxisSelect ? yAxisSelect.value : '';
        
        console.log('getGaugeColumns - Y轴选择器:', yAxisSelect, '值:', yColumn);
        
        if (yColumn === '') {
            console.error('getGaugeColumns - 缺少必要的列选择');
            throw new Error('仪表盘图需要选择指标数值数据列');
        }
        
        return {
            yAxis: parseInt(yColumn)
        };
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