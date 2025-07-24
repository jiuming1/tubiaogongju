// 图表生成模块
class ChartGenerator {
    // 支持的图表类型
    static CHART_TYPES = {
        BAR: 'bar',
        LINE: 'line',
        PIE: 'pie',
        DOUGHNUT: 'doughnut',
        RADAR: 'radar'
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
}