// 图表类型管理器 - 管理图表类型配置和验证
class ChartTypeManager {
    
    // 扩展的图表类型配置
    static CHART_TYPE_CONFIGS = {
        // 现有图表类型
        bar: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '柱状图',
            icon: 'fa-chart-column',
            category: 'basic'
        },
        line: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number', 'date'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '折线图',
            icon: 'fa-chart-line',
            category: 'basic'
        },
        pie: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '饼图',
            icon: 'fa-chart-pie',
            category: 'basic'
        },
        doughnut: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '环形图',
            icon: 'fa-circle-notch',
            category: 'basic'
        },
        radar: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '雷达图',
            icon: 'fa-crosshairs',
            category: 'basic'
        },
        
        // 新增图表类型
        scatter: {
            requiredColumns: 2,
            supportedDataTypes: ['number', 'number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '散点图',
            icon: 'fa-braille',
            category: 'advanced',
            dataRequirements: {
                xAxis: 'number',
                yAxis: 'number'
            }
        },
        bubble: {
            requiredColumns: 3,
            supportedDataTypes: ['number', 'number', 'number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '气泡图',
            icon: 'fa-circle-dot',
            category: 'advanced',
            dataRequirements: {
                xAxis: 'number',
                yAxis: 'number',
                size: 'number'
            }
        },
        area: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number', 'date'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '面积图',
            icon: 'fa-chart-area',
            category: 'advanced',
            options: {
                stacked: false,
                fill: true
            }
        },
        polarArea: {
            requiredColumns: 2,
            supportedDataTypes: ['number', 'number'],
            hasSpecialUI: false,
            requiresProcessing: true,
            description: '极坐标图',
            icon: 'fa-compass',
            category: 'specialized',
            dataRequirements: {
                angle: 'number',
                radius: 'number'
            }
        },
        boxplot: {
            requiredColumns: 1,
            supportedDataTypes: ['number'],
            hasSpecialUI: false,
            requiresProcessing: true,
            description: '箱线图',
            icon: 'fa-square-full',
            category: 'statistical',
            dataRequirements: {
                values: 'number',
                groups: 'text' // optional
            }
        },
        heatmap: {
            requiredColumns: 3,
            supportedDataTypes: ['number', 'number', 'number'],
            hasSpecialUI: false,
            requiresProcessing: true,
            description: '热力图',
            icon: 'fa-th-large',
            category: 'specialized',
            dataRequirements: {
                xAxis: 'number',
                yAxis: 'number',
                value: 'number'
            }
        },
        waterfall: {
            requiredColumns: 2,
            supportedDataTypes: ['text', 'number'],
            hasSpecialUI: false,
            requiresProcessing: true,
            description: '瀑布图',
            icon: 'fa-chart-column',
            category: 'financial',
            dataRequirements: {
                category: 'text',
                value: 'number'
            }
        },
        gauge: {
            requiredColumns: 1,
            supportedDataTypes: ['number'],
            hasSpecialUI: false,
            requiresProcessing: false,
            description: '仪表盘图',
            icon: 'fa-tachometer-alt',
            category: 'kpi',
            dataRequirements: {
                value: 'number'
            },
            options: {
                min: 0,
                max: 100,
                target: null
            }
        }
    };
    
    // 获取图表类型配置
    static getChartTypeConfig(type) {
        return this.CHART_TYPE_CONFIGS[type] || null;
    }
    
    // 获取所有图表类型
    static getAllChartTypes() {
        return Object.keys(this.CHART_TYPE_CONFIGS);
    }
    
    // 按类别获取图表类型
    static getChartTypesByCategory(category) {
        return Object.entries(this.CHART_TYPE_CONFIGS)
            .filter(([_, config]) => config.category === category)
            .map(([type, _]) => type);
    }
    
    // 获取所有类别
    static getCategories() {
        const categories = new Set();
        Object.values(this.CHART_TYPE_CONFIGS).forEach(config => {
            categories.add(config.category);
        });
        return Array.from(categories);
    }
    
    // 验证数据是否适合指定图表类型
    static validateDataForChart(type, data, selectedColumns = {}) {
        const config = this.getChartTypeConfig(type);
        if (!config) {
            return {
                valid: false,
                error: `未知的图表类型: ${type}`
            };
        }
        
        // 检查数据是否存在
        if (!data || data.length < 2) {
            return {
                valid: false,
                error: '数据不足，至少需要包含表头和一行数据'
            };
        }
        
        // 检查列数要求
        const availableColumns = data[0].length;
        if (availableColumns < config.requiredColumns) {
            return {
                valid: false,
                error: `${config.description}需要至少${config.requiredColumns}列数据，当前只有${availableColumns}列`
            };
        }
        
        // 检查选中的列
        const selectedColumnCount = Object.keys(selectedColumns).length;
        if (selectedColumnCount < config.requiredColumns) {
            return {
                valid: false,
                error: `请选择${config.requiredColumns}个数据列`
            };
        }
        
        // 检查数据类型要求
        if (config.dataRequirements) {
            const typeValidation = this.validateDataTypes(data, selectedColumns, config.dataRequirements);
            if (!typeValidation.valid) {
                return typeValidation;
            }
        }
        
        // 检查特殊要求
        const specialValidation = this.validateSpecialRequirements(type, data, selectedColumns);
        if (!specialValidation.valid) {
            return specialValidation;
        }
        
        return { valid: true };
    }
    
    // 验证数据类型
    static validateDataTypes(data, selectedColumns, requirements) {
        const columnTypes = AdvancedDataProcessor.detectAdvancedColumnTypes(data);
        
        for (const [requirement, expectedType] of Object.entries(requirements)) {
            const columnIndex = selectedColumns[requirement];
            if (columnIndex === undefined) continue;
            
            const actualType = columnTypes[columnIndex];
            if (actualType && actualType.type !== expectedType && actualType.confidence > 0.5) {
                return {
                    valid: false,
                    error: `${requirement}列需要${expectedType}类型数据，但检测到${actualType.type}类型`
                };
            }
        }
        
        return { valid: true };
    }
    
    // 验证特殊要求
    static validateSpecialRequirements(type, data, selectedColumns) {
        switch (type) {
            case 'scatter':
            case 'bubble':
                return this.validateScatterBubbleData(data, selectedColumns, type);
            
            case 'boxplot':
                return this.validateBoxPlotData(data, selectedColumns);
            
            case 'heatmap':
                return this.validateHeatmapData(data, selectedColumns);
            
            case 'gauge':
                return this.validateGaugeData(data, selectedColumns);
            
            default:
                return { valid: true };
        }
    }
    
    // 验证散点图和气泡图数据
    static validateScatterBubbleData(data, selectedColumns, type) {
        const xCol = selectedColumns.xAxis;
        const yCol = selectedColumns.yAxis;
        const sizeCol = selectedColumns.size;
        
        if (xCol === yCol) {
            return {
                valid: false,
                error: 'X轴和Y轴不能选择相同的列'
            };
        }
        
        if (type === 'bubble' && (xCol === sizeCol || yCol === sizeCol)) {
            return {
                valid: false,
                error: '气泡大小列不能与X轴或Y轴相同'
            };
        }
        
        // 检查是否有足够的数值数据
        let validPointCount = 0;
        for (let i = 1; i < data.length; i++) {
            const x = parseFloat(data[i][xCol]);
            const y = parseFloat(data[i][yCol]);
            const size = type === 'bubble' ? parseFloat(data[i][sizeCol]) : 1;
            
            if (!isNaN(x) && !isNaN(y) && (type !== 'bubble' || !isNaN(size))) {
                validPointCount++;
            }
        }
        
        if (validPointCount < 2) {
            return {
                valid: false,
                error: `${type === 'bubble' ? '气泡图' : '散点图'}需要至少2个有效数据点`
            };
        }
        
        return { valid: true };
    }
    
    // 验证箱线图数据
    static validateBoxPlotData(data, selectedColumns) {
        const valueCol = selectedColumns.values;
        
        let validValueCount = 0;
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueCol]);
            if (!isNaN(value)) {
                validValueCount++;
            }
        }
        
        if (validValueCount < 5) {
            return {
                valid: false,
                error: '箱线图需要至少5个有效数值才能计算统计信息'
            };
        }
        
        return { valid: true };
    }
    
    // 验证热力图数据
    static validateHeatmapData(data, selectedColumns) {
        const xCol = selectedColumns.xAxis;
        const yCol = selectedColumns.yAxis;
        const valueCol = selectedColumns.value;
        
        if (xCol === yCol || xCol === valueCol || yCol === valueCol) {
            return {
                valid: false,
                error: '热力图的X轴、Y轴和数值列必须是不同的列'
            };
        }
        
        let validPointCount = 0;
        for (let i = 1; i < data.length; i++) {
            const x = parseFloat(data[i][xCol]);
            const y = parseFloat(data[i][yCol]);
            const value = parseFloat(data[i][valueCol]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(value)) {
                validPointCount++;
            }
        }
        
        if (validPointCount < 4) {
            return {
                valid: false,
                error: '热力图需要至少4个有效数据点'
            };
        }
        
        return { valid: true };
    }
    
    // 验证仪表盘数据
    static validateGaugeData(data, selectedColumns) {
        const valueCol = selectedColumns.value;
        
        let validValueCount = 0;
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueCol]);
            if (!isNaN(value)) {
                validValueCount++;
            }
        }
        
        if (validValueCount === 0) {
            return {
                valid: false,
                error: '仪表盘图需要至少一个有效数值'
            };
        }
        
        return { valid: true };
    }
    
    // 生成图表类型选择器UI
    static generateChartTypeUI(containerSelector, onSelectionChange = null) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`找不到容器: ${containerSelector}`);
        }
        
        const categories = this.getCategories();
        let html = '';
        
        categories.forEach(category => {
            const categoryTypes = this.getChartTypesByCategory(category);
            const categoryName = this.getCategoryDisplayName(category);
            
            html += `
                <div class="chart-category mb-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-3">${categoryName}</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            `;
            
            categoryTypes.forEach(type => {
                const config = this.getChartTypeConfig(type);
                html += `
                    <div class="chart-type-option cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-all duration-200" 
                         data-type="${type}" 
                         title="${config.description}">
                        <div class="text-center">
                            <i class="fas ${config.icon} text-2xl text-gray-600 mb-2"></i>
                            <div class="text-sm font-medium text-gray-700">${config.description}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // 添加事件监听器
        if (onSelectionChange) {
            container.querySelectorAll('.chart-type-option').forEach(option => {
                option.addEventListener('click', () => {
                    // 移除所有选中状态
                    container.querySelectorAll('.chart-type-option').forEach(opt => {
                        opt.classList.remove('bg-primary/10', 'text-primary', 'border-primary');
                    });
                    
                    // 添加选中状态
                    option.classList.add('bg-primary/10', 'text-primary', 'border-primary');
                    
                    // 调用回调函数
                    onSelectionChange(option.dataset.type);
                });
            });
        }
    }
    
    // 获取类别显示名称
    static getCategoryDisplayName(category) {
        const categoryNames = {
            basic: '基础图表',
            advanced: '高级图表',
            statistical: '统计图表',
            specialized: '专业图表',
            financial: '财务图表',
            kpi: 'KPI图表'
        };
        
        return categoryNames[category] || category;
    }
    
    // 生成数据列选择器UI
    static generateColumnSelectorUI(chartType, data, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`找不到容器: ${containerSelector}`);
        }
        
        const config = this.getChartTypeConfig(chartType);
        if (!config) {
            container.innerHTML = '<p class="text-red-500">未知的图表类型</p>';
            return;
        }
        
        const columnTypes = AdvancedDataProcessor.detectAdvancedColumnTypes(data);
        let html = '';
        
        // 根据图表类型生成不同的选择器
        if (config.dataRequirements) {
            Object.entries(config.dataRequirements).forEach(([requirement, expectedType]) => {
                const displayName = this.getRequirementDisplayName(requirement);
                const isRequired = config.requiredColumns > Object.keys(config.dataRequirements).indexOf(requirement);
                
                html += `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ${displayName} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                        </label>
                        <select class="column-selector w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
                                data-requirement="${requirement}">
                            <option value="">请选择...</option>
                `;
                
                data[0].forEach((column, index) => {
                    const type = columnTypes[index];
                    const typeLabel = type ? ` (${this.getTypeDisplayName(type.type)})` : '';
                    const isCompatible = !type || type.type === expectedType || type.confidence < 0.5;
                    const className = isCompatible ? '' : 'text-gray-400';
                    
                    html += `<option value="${index}" class="${className}">${column}${typeLabel}</option>`;
                });
                
                html += `
                        </select>
                    </div>
                `;
            });
        } else {
            // 默认的X轴和Y轴选择器
            html += `
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        X轴数据 <span class="text-red-500">*</span>
                    </label>
                    <select class="column-selector w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
                            data-requirement="xAxis">
                        <option value="">请选择...</option>
            `;
            
            data[0].forEach((column, index) => {
                const type = columnTypes[index];
                const typeLabel = type ? ` (${this.getTypeDisplayName(type.type)})` : '';
                html += `<option value="${index}">${column}${typeLabel}</option>`;
            });
            
            html += `
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Y轴数据 <span class="text-red-500">*</span>
                    </label>
                    <select class="column-selector w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
                            data-requirement="yAxis">
                        <option value="">请选择...</option>
            `;
            
            data[0].forEach((column, index) => {
                const type = columnTypes[index];
                const typeLabel = type ? ` (${this.getTypeDisplayName(type.type)})` : '';
                html += `<option value="${index}">${column}${typeLabel}</option>`;
            });
            
            html += `
                    </select>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    // 获取需求显示名称
    static getRequirementDisplayName(requirement) {
        const names = {
            xAxis: 'X轴数据',
            yAxis: 'Y轴数据',
            size: '气泡大小',
            angle: '角度',
            radius: '半径',
            values: '数值',
            groups: '分组',
            value: '数值',
            category: '类别'
        };
        
        return names[requirement] || requirement;
    }
    
    // 获取类型显示名称
    static getTypeDisplayName(type) {
        const names = {
            number: '数值',
            text: '文本',
            date: '日期',
            boolean: '布尔值',
            unknown: '未知'
        };
        
        return names[type] || type;
    }
    
    // 获取选中的列配置
    static getSelectedColumns(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return {};
        
        const result = {};
        container.querySelectorAll('.column-selector').forEach(select => {
            const requirement = select.dataset.requirement;
            const value = select.value;
            if (requirement && value) {
                result[requirement] = parseInt(value);
            }
        });
        
        return result;
    }
}