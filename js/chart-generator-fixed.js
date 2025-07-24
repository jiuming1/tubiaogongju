// 修复后的图表生成模块
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
    
    // 准备基础图表数据
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
            orange: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'],
            pink: ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', '#FDF2F8'],
            indigo: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'],
            yellow: ['#EAB308', '#FACC15', '#FDE047', '#FEF08A', '#FEFCE8']
        };
        
        return themes[theme] || themes.blue;
    }
    
    // 创建基础图表配置
    static createConfig(type, chartData, colors, options = {}) {
        const baseConfig = {
            type: type,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.yLabel,
                    data: chartData.values,
                    backgroundColor: colors,
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

        // 特殊配置调整
        if (type === 'pie' || type === 'doughnut') {
            delete baseConfig.options.scales;
        }

        return baseConfig;
    }

    // ========== 新增图表类型的数据准备方法 ==========
    
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

    // 箱线图数据准备
    static prepareBoxPlotData(data, valueColumn, groupColumn = null) {
        const values = [];
        const groups = {};
        
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueColumn]);
            if (!isNaN(value) && isFinite(value)) {
                if (groupColumn !== null && data[i][groupColumn]) {
                    const group = data[i][groupColumn];
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(value);
                } else {
                    values.push(value);
                }
            }
        }
        
        // 计算统计信息
        const calculateStats = (arr) => {
            arr.sort((a, b) => a - b);
            const q1 = arr[Math.floor(arr.length * 0.25)];
            const median = arr[Math.floor(arr.length * 0.5)];
            const q3 = arr[Math.floor(arr.length * 0.75)];
            const min = arr[0];
            const max = arr[arr.length - 1];
            return { min, q1, median, q3, max };
        };
        
        if (groupColumn !== null) {
            const groupStats = {};
            Object.keys(groups).forEach(group => {
                groupStats[group] = calculateStats(groups[group]);
            });
            return {
                type: 'boxplot',
                groupStats,
                valueLabel: data[0][valueColumn],
                groupLabel: data[0][groupColumn]
            };
        } else {
            return {
                type: 'boxplot',
                stats: calculateStats(values),
                valueLabel: data[0][valueColumn]
            };
        }
    }

    // 热力图数据准备
    static prepareHeatmapData(data, xColumn, yColumn, valueColumn) {
        const heatmapData = [];
        
        for (let i = 1; i < data.length; i++) {
            const x = data[i][xColumn];
            const y = data[i][yColumn];
            const value = parseFloat(data[i][valueColumn]);
            
            if (x && y && !isNaN(value) && isFinite(value)) {
                heatmapData.push({ x, y, v: value });
            }
        }
        
        return {
            heatmapData,
            xLabel: data[0][xColumn],
            yLabel: data[0][yColumn],
            valueLabel: data[0][valueColumn],
            type: 'heatmap'
        };
    }

    // 瀑布图数据准备
    static prepareWaterfallData(data, categoryColumn, valueColumn) {
        const waterfallData = [];
        let cumulative = 0;
        
        for (let i = 1; i < data.length; i++) {
            const category = data[i][categoryColumn];
            const value = parseFloat(data[i][valueColumn]);
            
            if (category && !isNaN(value) && isFinite(value)) {
                cumulative += value;
                waterfallData.push({
                    label: category,
                    value: value,
                    cumulative: cumulative
                });
            }
        }
        
        return {
            waterfallData,
            categoryLabel: data[0][categoryColumn],
            valueLabel: data[0][valueColumn],
            type: 'waterfall'
        };
    }

    // 仪表盘图数据准备
    static prepareGaugeData(data, valueColumn) {
        let totalValue = 0;
        let count = 0;
        
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueColumn]);
            if (!isNaN(value) && isFinite(value)) {
                totalValue += value;
                count++;
            }
        }
        
        const averageValue = count > 0 ? totalValue / count : 0;
        
        return {
            value: averageValue,
            valueLabel: data[0][valueColumn],
            type: 'gauge'
        };
    }

    // ========== 新增图表类型的配置生成方法 ==========
    
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

    // 箱线图配置（简化版，使用柱状图模拟）
    static createBoxPlotConfig(chartData, colors, options = {}) {
        if (chartData.groupStats) {
            // 多组数据
            const labels = Object.keys(chartData.groupStats);
            const medianData = labels.map(label => chartData.groupStats[label].median);
            
            return {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '中位数',
                        data: medianData,
                        backgroundColor: colors[0] + '80',
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
                            text: options.title || '箱线图（简化版）'
                        },
                        legend: {
                            display: options.showLegend !== false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: chartData.groupLabel
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: chartData.valueLabel
                            }
                        }
                    }
                }
            };
        } else {
            // 单组数据
            return {
                type: 'bar',
                data: {
                    labels: ['最小值', '第一四分位数', '中位数', '第三四分位数', '最大值'],
                    datasets: [{
                        label: chartData.valueLabel,
                        data: [
                            chartData.stats.min,
                            chartData.stats.q1,
                            chartData.stats.median,
                            chartData.stats.q3,
                            chartData.stats.max
                        ],
                        backgroundColor: colors,
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
                            text: options.title || '箱线图统计'
                        },
                        legend: {
                            display: options.showLegend !== false
                        }
                    }
                }
            };
        }
    }

    // 热力图配置（使用散点图模拟）
    static createHeatmapConfig(chartData, colors, options = {}) {
        const points = chartData.heatmapData.map(point => ({
            x: point.x,
            y: point.y,
            r: Math.abs(point.v) * 5 + 3 // 根据值调整点的大小
        }));
        
        return {
            type: 'scatter',
            data: {
                datasets: [{
                    label: chartData.valueLabel,
                    data: points,
                    backgroundColor: colors[0] + '70',
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
                        text: options.title || '热力图（散点图模拟）'
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
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartData.yLabel
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
        
        return {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '累积值',
                    data: data,
                    backgroundColor: colors[0] + '80',
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
                        text: options.title || '瀑布图'
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
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartData.valueLabel
                        }
                    }
                }
            }
        };
    }

    // 仪表盘图配置（使用环形图模拟）
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
                    backgroundColor: [colors[0], colors[4]],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                circumference: 180,
                rotation: 270,
                cutout: '75%',
                plugins: {
                    title: {
                        display: options.title && options.title.trim() !== '',
                        text: options.title || `${chartData.valueLabel}: ${value.toFixed(1)}`
                    },
                    legend: {
                        display: options.showLegend !== false,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataIndex === 0) {
                                    return `${chartData.valueLabel}: ${value.toFixed(1)}`;
                                }
                                return '';
                            }
                        }
                    }
                }
            }
        };
    }

    // 准备多列数据（支持新图表类型）
    static prepareMultiColumnData(data, selectedColumns, chartType) {
        try {
            let result;
            
            switch (chartType) {
                case this.CHART_TYPES.SCATTER:
                case 'scatter':
                    result = this.prepareScatterData(data, selectedColumns.xAxis, selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.BUBBLE:
                case 'bubble':
                    result = this.prepareBubbleData(data, selectedColumns.xAxis, selectedColumns.yAxis, selectedColumns.size || selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.AREA:
                case 'area':
                    result = this.prepareAreaData(data, selectedColumns.xAxis, selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.BOX_PLOT:
                case 'boxplot':
                    result = this.prepareBoxPlotData(data, selectedColumns.yAxis, selectedColumns.group);
                    break;
                case this.CHART_TYPES.HEATMAP:
                case 'heatmap':
                    result = this.prepareHeatmapData(data, selectedColumns.xAxis, selectedColumns.yAxis, selectedColumns.value || selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.WATERFALL:
                case 'waterfall':
                    result = this.prepareWaterfallData(data, selectedColumns.xAxis, selectedColumns.yAxis);
                    break;
                case this.CHART_TYPES.GAUGE:
                case 'gauge':
                    result = this.prepareGaugeData(data, selectedColumns.yAxis);
                    break;
                default:
                    // 使用原有的数据准备方法
                    result = this.prepareData(data, selectedColumns.xAxis, selectedColumns.yAxis);
            }
            
            return result;
        } catch (error) {
            console.error('数据准备失败:', error);
            throw new Error(`数据准备失败: ${error.message}`);
        }
    }

    // 创建扩展的图表配置
    static createExtendedConfig(type, chartData, colors, options = {}) {
        try {
            let config;
            
            switch (type) {
                case this.CHART_TYPES.SCATTER:
                case 'scatter':
                    config = this.createScatterConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.BUBBLE:
                case 'bubble':
                    config = this.createBubbleConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.AREA:
                case 'area':
                    config = this.createAreaConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.BOX_PLOT:
                case 'boxplot':
                    config = this.createBoxPlotConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.HEATMAP:
                case 'heatmap':
                    config = this.createHeatmapConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.WATERFALL:
                case 'waterfall':
                    config = this.createWaterfallConfig(chartData, colors, options);
                    break;
                case this.CHART_TYPES.GAUGE:
                case 'gauge':
                    config = this.createGaugeConfig(chartData, colors, options);
                    break;
                default:
                    // 使用原有的配置生成方法
                    config = this.createConfig(type, chartData, colors, options);
            }
            
            return config;
        } catch (error) {
            console.error('配置生成失败:', error);
            throw new Error(`配置生成失败: ${error.message}`);
        }
    }

    // 安全创建图表
    static safeCreateChart(canvas, config) {
        try {
            return new Chart(canvas, config);
        } catch (error) {
            console.error('图表创建失败:', error);
            throw new Error(`图表创建失败: ${error.message}`);
        }
    }
}