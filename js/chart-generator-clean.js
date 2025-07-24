// 图表生成模块
class ChartGenerator {
    // 支持的图表类型
    static CHART_TYPES = {
        // 现有类型
        BAR: 'bar',
        LINE: 'line',
        PIE: 'pie',
        DOUGHNUT: 'doughnut',
        RADAR: 'radar',
        
        // 新增类型
        SCATTER: 'scatter',
        BUBBLE: 'bubble',
        AREA: 'area',
        POLAR_AREA: 'polarArea',
        BOX_PLOT: 'boxplot',
        HEATMAP: 'heatmap',
        WATERFALL: 'waterfall',
        GAUGE: 'gauge'
    };
    
    // 准备图表数据
    static prepareData(data, xColumn, yColumn) {
        const labels = [];
        const values = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][xColumn] && data[i][yColumn]) {
                labels.push(data[i][xColumn]);
                const value = parseFloat(data[i][yColumn]);
                values.push(isNaN(value) ? 0 : value);
            }
        }
        
        return {
            labels,
            values,
            xLabel: data[0][xColumn],
            yLabel: data[0][yColumn]
        };
    }
    
    // 获取主题颜色
    static getThemeColors(theme) {
        const themes = {
            blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF'],
            green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
            purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
            red: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
            yellow: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
            gray: ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6']
        };
        return themes[theme] || themes.blue;
    }
    
    // 创建图表配置
    static createConfig(type, chartData, colors, options = {}) {
        const config = {
            type: type,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.yLabel,
                    data: chartData.values,
                    backgroundColor: type === 'pie' || type === 'doughnut' ? colors : colors[0],
                    borderColor: type === 'pie' || type === 'doughnut' ? colors : colors[0],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                }
            }
        };
        
        // 为非饼图添加坐标轴配置
        if (type !== 'pie' && type !== 'doughnut' && type !== 'radar') {
            config.options.scales = {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: options.showGrid !== false
                    }
                },
                x: {
                    grid: {
                        display: options.showGrid !== false
                    }
                }
            };
        }
        
        return config;
    }
    
    // 更新图表
    static updateChart(chart, newData) {
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }
    
    // 销毁图表
    static destroyChart(chart) {
        if (chart) {
            try {
                chart.destroy();
            } catch (error) {
                console.warn('销毁图表时出错:', error);
            }
        }
    }
    
    // 安全销毁图表（处理Canvas重用问题）
    static safeDestroyChart(chart, canvas) {
        if (chart) {
            try {
                chart.destroy();
            } catch (error) {
                console.warn('销毁图表时出错:', error);
            }
        }
        
        // 清理Canvas
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        // 清理Chart.js内部注册表
        if (window.Chart && window.Chart.getChart && canvas) {
            const existingChart = window.Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        }
    }
    
    // 获取图表选项
    static getChartOptions(type, customOptions = {}) {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false
        };
        
        return { ...baseOptions, ...customOptions };
    }
    
    // ========== 扩展的数据准备方法 ==========
    
    // 准备多列数据（支持新图表类型）
    static prepareMultiColumnData(data, selectedColumns, chartType) {
        try {
            // 根据图表类型准备数据
            let result;
            switch (chartType) {
                case this.CHART_TYPES.SCATTER:
                    result = this.prepareScatterData(data, selectedColumns.xAxis, selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.BUBBLE:
                    result = this.prepareBubbleData(data, selectedColumns.xAxis, selectedColumns.yAxis, selectedColumns.size);
                    break;
                case this.CHART_TYPES.AREA:
                    result = this.prepareAreaData(data, selectedColumns.xAxis, selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.POLAR_AREA:
                    result = this.preparePolarAreaData(data, selectedColumns.angle, selectedColumns.radius);
                    break;
                case this.CHART_TYPES.BOX_PLOT:
                    result = this.prepareBoxPlotData(data, selectedColumns.values, selectedColumns.groups);
                    break;
                case this.CHART_TYPES.HEATMAP:
                    result = this.prepareHeatmapData(data, selectedColumns.xAxis, selectedColumns.yAxis, selectedColumns.value);
                    break;
                case this.CHART_TYPES.WATERFALL:
                    result = this.prepareWaterfallData(data, selectedColumns.category, selectedColumns.value);
                    break;
                case this.CHART_TYPES.GAUGE:
                    result = this.prepareGaugeData(data, selectedColumns.value);
                    break;
                default:
                    // 使用原有的数据准备方法
                    result = this.prepareData(data, selectedColumns.xAxis, selectedColumns.yAxis);
            }
            
            return result;
            
        } catch (error) {
            console.error('数据准备失败:', error);
            throw error;
        }
    }
    
    // 散点图数据准备
    static prepareScatterData(data, xColumn, yColumn) {
        const points = [];
        let xLabel = data[0][xColumn];
        let yLabel = data[0][yColumn];
        
        for (let i = 1; i < data.length; i++) {
            const x = parseFloat(data[i][xColumn]);
            const y = parseFloat(data[i][yColumn]);
            
            if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
                points.push({ x, y });
            }
        }
        
        return {
            points,
            xLabel,
            yLabel,
            type: 'scatter'
        };
    }
    
    // 气泡图数据准备
    static prepareBubbleData(data, xColumn, yColumn, sizeColumn) {
        const points = [];
        let xLabel = data[0][xColumn];
        let yLabel = data[0][yColumn];
        let sizeLabel = data[0][sizeColumn];
        
        // 找到大小的最大值和最小值用于归一化
        let minSize = Infinity;
        let maxSize = -Infinity;
        
        const rawPoints = [];
        for (let i = 1; i < data.length; i++) {
            const x = parseFloat(data[i][xColumn]);
            const y = parseFloat(data[i][yColumn]);
            const size = parseFloat(data[i][sizeColumn]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(size) && isFinite(x) && isFinite(y) && isFinite(size) && size > 0) {
                rawPoints.push({ x, y, size });
                minSize = Math.min(minSize, size);
                maxSize = Math.max(maxSize, size);
            }
        }
        
        // 归一化气泡大小（范围：5-30）
        const sizeRange = maxSize - minSize;
        rawPoints.forEach(point => {
            const normalizedSize = sizeRange > 0 ? 
                5 + (point.size - minSize) / sizeRange * 25 : 
                15; // 如果所有大小相同，使用中等大小
            
            points.push({
                x: point.x,
                y: point.y,
                r: normalizedSize
            });
        });
        
        return {
            points,
            xLabel,
            yLabel,
            sizeLabel,
            type: 'bubble',
            sizeRange: { min: minSize, max: maxSize }
        };
    }
    
    // 面积图数据准备
    static prepareAreaData(data, xColumn, yColumn) {
        const labels = [];
        const values = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][xColumn] && data[i][yColumn]) {
                labels.push(data[i][xColumn]);
                const value = parseFloat(data[i][yColumn]);
                values.push(isNaN(value) ? 0 : value);
            }
        }
        
        return {
            labels,
            values,
            xLabel: data[0][xColumn],
            yLabel: data[0][yColumn],
            type: 'area'
        };
    }
    
    // 极坐标图数据准备
    static preparePolarAreaData(data, angleColumn, radiusColumn) {
        const labels = [];
        const values = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][angleColumn] && data[i][radiusColumn]) {
                labels.push(data[i][angleColumn]);
                const value = parseFloat(data[i][radiusColumn]);
                values.push(isNaN(value) ? 0 : value);
            }
        }
        
        return {
            labels,
            values,
            xLabel: data[0][angleColumn],
            yLabel: data[0][radiusColumn],
            type: 'polarArea'
        };
    }
    
    // 箱线图数据准备
    static prepareBoxPlotData(data, valueColumn, groupColumn = null) {
        const values = [];
        
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueColumn]);
            if (!isNaN(value) && isFinite(value)) {
                values.push(value);
            }
        }
        
        // 简化的箱线图统计
        values.sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const median = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const min = values[0];
        const max = values[values.length - 1];
        
        return {
            stats: { min, q1, median, q3, max, outliers: [] },
            valueLabel: data[0][valueColumn],
            type: 'boxplot'
        };
    }
    
    // 热力图数据准备
    static prepareHeatmapData(data, xColumn, yColumn, valueColumn) {
        const points = [];
        
        for (let i = 1; i < data.length; i++) {
            const x = parseFloat(data[i][xColumn]);
            const y = parseFloat(data[i][yColumn]);
            const value = parseFloat(data[i][valueColumn]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(value)) {
                points.push({ x, y, v: value });
            }
        }
        
        return {
            heatmapData: points,
            xLabel: data[0][xColumn],
            yLabel: data[0][yColumn],
            valueLabel: data[0][valueColumn],
            type: 'heatmap'
        };
    }
    
    // 瀑布图数据准备
    static prepareWaterfallData(data, categoryColumn, valueColumn) {
        const labels = [];
        const values = [];
        let cumulative = 0;
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][categoryColumn] && data[i][valueColumn]) {
                labels.push(data[i][categoryColumn]);
                const value = parseFloat(data[i][valueColumn]);
                cumulative += isNaN(value) ? 0 : value;
                values.push(cumulative);
            }
        }
        
        return {
            waterfallData: labels.map((label, index) => ({
                label,
                value: parseFloat(data[index + 1][valueColumn]) || 0,
                cumulative: values[index]
            })),
            categoryLabel: data[0][categoryColumn],
            valueLabel: data[0][valueColumn],
            type: 'waterfall'
        };
    }
    
    // 仪表盘图数据准备
    static prepareGaugeData(data, valueColumn) {
        let totalValue = 0;
        let validCount = 0;
        
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueColumn]);
            if (!isNaN(value) && isFinite(value)) {
                totalValue += value;
                validCount++;
            }
        }
        
        const averageValue = validCount > 0 ? totalValue / validCount : 0;
        
        return {
            value: validCount === 1 ? totalValue : averageValue,
            valueLabel: data[0][valueColumn],
            type: 'gauge',
            dataCount: validCount
        };
    }
    
    // ========== 扩展的图表配置生成方法 ==========
    
    // 创建扩展的图表配置
    static createExtendedConfig(type, chartData, colors, options = {}) {
        try {
            let config;
            switch (type) {
                case this.CHART_TYPES.SCATTER:
                    config = this.createScatterConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.BUBBLE:
                    config = this.createBubbleConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.AREA:
                    config = this.createAreaConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.POLAR_AREA:
                    config = this.createPolarAreaConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.BOX_PLOT:
                    config = this.createBoxPlotConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.HEATMAP:
                    config = this.createHeatmapConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.WATERFALL:
                    config = this.createWaterfallConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.GAUGE:
                    config = this.createGaugeConfig(chartData, colors, options);
                    break;
                default:
                    // 使用原有的配置生成方法
                    config = this.createConfig(type, chartData, colors, options);
            }
            
            return config;
            
        } catch (error) {
            console.error('配置生成失败:', error);
            throw error;
        }
    }
    
    // 散点图配置
    static createScatterConfig(chartData, colors, options = {}) {
        return {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `${chartData.xLabel} vs ${chartData.yLabel}`,
                    data: chartData.points,
                    backgroundColor: colors[0] + '80',
                    borderColor: colors[0],
                    borderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: chartData.xLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartData.yLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    }
                }
            }
        };
    }
    
    // 气泡图配置
    static createBubbleConfig(chartData, colors, options = {}) {
        return {
            type: 'bubble',
            data: {
                datasets: [{
                    label: `${chartData.xLabel} vs ${chartData.yLabel}`,
                    data: chartData.points,
                    backgroundColor: colors[0] + '60',
                    borderColor: colors[0],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: chartData.xLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartData.yLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    }
                }
            }
        };
    }
    
    // 面积图配置
    static createAreaConfig(chartData, colors, options = {}) {
        return {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.yLabel,
                    data: chartData.values,
                    backgroundColor: colors[0] + '40',
                    borderColor: colors[0],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: chartData.xLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartData.yLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        },
                        beginAtZero: true
                    }
                }
            }
        };
    }
    
    // 极坐标图配置
    static createPolarAreaConfig(chartData, colors, options = {}) {
        return {
            type: 'polarArea',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.yLabel,
                    data: chartData.values,
                    backgroundColor: colors.map(color => color + '80'),
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                }
            }
        };
    }
    
    // 箱线图配置（简化版，使用柱状图模拟）
    static createBoxPlotConfig(chartData, colors, options = {}) {
        const stats = chartData.stats;
        return {
            type: 'bar',
            data: {
                labels: ['最小值', 'Q1', '中位数', 'Q3', '最大值'],
                datasets: [{
                    label: chartData.valueLabel,
                    data: [stats.min, stats.q1, stats.median, stats.q3, stats.max],
                    backgroundColor: colors[0] + '60',
                    borderColor: colors[0],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: options.showGrid !== false
                        }
                    }
                }
            }
        };
    }
    
    // 热力图配置（使用散点图模拟）
    static createHeatmapConfig(chartData, colors, options = {}) {
        const points = chartData.heatmapData;
        const values = points.map(p => p.v);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        return {
            type: 'scatter',
            data: {
                datasets: [{
                    label: chartData.valueLabel,
                    data: points,
                    backgroundColor: function(context) {
                        const value = context.raw.v;
                        const intensity = (value - minValue) / (maxValue - minValue);
                        const alpha = Math.max(0.3, intensity);
                        return colors[0] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                    },
                    borderColor: colors[0],
                    borderWidth: 1,
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: chartData.xLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: chartData.yLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    }
                }
            }
        };
    }
    
    // 瀑布图配置
    static createWaterfallConfig(chartData, colors, options = {}) {
        const labels = chartData.waterfallData.map(item => item.label);
        const data = chartData.waterfallData.map(item => item.cumulative);
        const changes = chartData.waterfallData.map(item => item.value);
        
        return {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '累积值',
                    data: data,
                    backgroundColor: changes.map(change => 
                        change >= 0 ? colors[1] + '80' : colors[3] + '80'
                    ),
                    borderColor: changes.map(change => 
                        change >= 0 ? colors[1] : colors[3]
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: chartData.categoryLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartData.valueLabel
                        },
                        grid: {
                            display: options.showGrid !== false
                        }
                    }
                }
            }
        };
    }
    
    // 仪表盘图配置
    static createGaugeConfig(chartData, colors, options = {}) {
        const { min = 0, max = 100 } = options;
        const value = Math.max(min, Math.min(max, chartData.value));
        const percentage = ((value - min) / (max - min)) * 100;
        
        return {
            type: 'doughnut',
            data: {
                labels: ['当前值', '剩余'],
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        percentage >= 80 ? colors[1] : percentage >= 60 ? colors[4] : colors[3],
                        '#E5E7EB'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title
                    },
                    legend: {
                        display: false
                    }
                }
            }
        };
    }
    
    // 安全创建图表
    static safeCreateChart(canvas, config) {
        try {
            // 清理现有图表
            this.safeDestroyChart(null, canvas);
            
            // 创建新图表
            const chart = new Chart(canvas, config);
            return chart;
            
        } catch (error) {
            console.error('图表创建失败:', error);
            return null;
        }
    }
}