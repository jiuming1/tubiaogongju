// 性能监控工具 - 监控图表创建和渲染性能
class PerformanceMonitor {
    
    // 性能监控实例存储
    static monitors = new Map();
    static performanceData = [];
    static isEnabled = true;
    
    // 性能阈值配置
    static THRESHOLDS = {
        CHART_CREATION: 3000,    // 图表创建时间阈值 (ms)
        DATA_PROCESSING: 1000,   // 数据处理时间阈值 (ms)
        MEMORY_USAGE: 50,        // 内存使用阈值 (MB)
        RENDER_TIME: 2000,       // 渲染时间阈值 (ms)
        LARGE_DATASET: 1000      // 大数据集阈值 (行数)
    };
    
    // 开始监控图表创建
    static startChartCreation(chartType, dataSize = 0) {
        if (!this.isEnabled) return null;
        
        const monitorId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        const monitor = {
            id: monitorId,
            type: 'chart_creation',
            chartType: chartType,
            dataSize: dataSize,
            startTime: startTime,
            startMemory: startMemory,
            phases: [],
            warnings: [],
            completed: false
        };
        
        this.monitors.set(monitorId, monitor);
        
        // 如果是大数据集，添加警告
        if (dataSize > this.THRESHOLDS.LARGE_DATASET) {
            monitor.warnings.push(`大数据集检测: ${dataSize}行数据，可能影响性能`);
        }
        
        console.log(`🚀 开始监控图表创建: ${chartType} (${dataSize}行数据)`);
        
        return {
            id: monitorId,
            addPhase: (phaseName) => this.addPhase(monitorId, phaseName),
            end: () => this.endChartCreation(monitorId),
            addWarning: (warning) => this.addWarning(monitorId, warning)
        };
    }
    
    // 添加阶段监控
    static addPhase(monitorId, phaseName) {
        const monitor = this.monitors.get(monitorId);
        if (!monitor) return;
        
        const currentTime = performance.now();
        const phaseStartTime = monitor.phases.length > 0 ? 
            monitor.phases[monitor.phases.length - 1].endTime : 
            monitor.startTime;
        
        monitor.phases.push({
            name: phaseName,
            startTime: phaseStartTime,
            endTime: currentTime,
            duration: currentTime - phaseStartTime
        });
        
        console.log(`📊 阶段完成: ${phaseName} (${(currentTime - phaseStartTime).toFixed(2)}ms)`);
    }
    
    // 结束图表创建监控
    static endChartCreation(monitorId) {
        const monitor = this.monitors.get(monitorId);
        if (!monitor || monitor.completed) return null;
        
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();
        const totalDuration = endTime - monitor.startTime;
        const memoryDelta = endMemory - monitor.startMemory;
        
        monitor.endTime = endTime;
        monitor.endMemory = endMemory;
        monitor.totalDuration = totalDuration;
        monitor.memoryDelta = memoryDelta;
        monitor.completed = true;
        
        // 性能分析
        const analysis = this.analyzePerformance(monitor);
        monitor.analysis = analysis;
        
        // 记录性能数据
        this.performanceData.push({
            timestamp: new Date(),
            chartType: monitor.chartType,
            dataSize: monitor.dataSize,
            duration: totalDuration,
            memoryDelta: memoryDelta,
            analysis: analysis
        });
        
        // 输出性能报告
        this.logPerformanceReport(monitor);
        
        // 清理监控器
        this.monitors.delete(monitorId);
        
        return analysis;
    }
    
    // 监控数据处理性能
    static monitorDataProcessing(operation, dataSize, processingFunction) {
        if (!this.isEnabled) {
            return processingFunction();
        }
        
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        console.log(`🔄 开始数据处理: ${operation} (${dataSize}行数据)`);
        
        try {
            const result = processingFunction();
            
            const endTime = performance.now();
            const endMemory = this.getMemoryUsage();
            const duration = endTime - startTime;
            const memoryDelta = endMemory - startMemory;
            
            // 记录性能数据
            const performanceRecord = {
                timestamp: new Date(),
                type: 'data_processing',
                operation: operation,
                dataSize: dataSize,
                duration: duration,
                memoryDelta: memoryDelta,
                success: true
            };
            
            this.performanceData.push(performanceRecord);
            
            // 检查性能阈值
            if (duration > this.THRESHOLDS.DATA_PROCESSING) {
                console.warn(`⚠️ 数据处理耗时过长: ${operation} (${duration.toFixed(2)}ms)`);
            }
            
            if (memoryDelta > this.THRESHOLDS.MEMORY_USAGE) {
                console.warn(`⚠️ 内存使用过多: ${operation} (+${memoryDelta.toFixed(2)}MB)`);
            }
            
            console.log(`✅ 数据处理完成: ${operation} (${duration.toFixed(2)}ms, ${memoryDelta > 0 ? '+' : ''}${memoryDelta.toFixed(2)}MB)`);
            
            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.error(`❌ 数据处理失败: ${operation} (${duration.toFixed(2)}ms)`, error);
            
            // 记录错误
            this.performanceData.push({
                timestamp: new Date(),
                type: 'data_processing',
                operation: operation,
                dataSize: dataSize,
                duration: duration,
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }
    
    // 监控内存使用
    static monitorMemoryUsage() {
        if (!this.isEnabled || !performance.memory) return null;
        
        const memory = performance.memory;
        const memoryInfo = {
            used: this.bytesToMB(memory.usedJSHeapSize),
            total: this.bytesToMB(memory.totalJSHeapSize),
            limit: this.bytesToMB(memory.jsHeapSizeLimit),
            timestamp: new Date()
        };
        
        // 检查内存使用是否过高
        const usagePercentage = (memoryInfo.used / memoryInfo.limit) * 100;
        if (usagePercentage > 80) {
            console.warn(`⚠️ 内存使用率过高: ${usagePercentage.toFixed(1)}% (${memoryInfo.used.toFixed(2)}MB/${memoryInfo.limit.toFixed(2)}MB)`);
        }
        
        return memoryInfo;
    }
    
    // 获取当前内存使用量
    static getMemoryUsage() {
        if (!performance.memory) return 0;
        return this.bytesToMB(performance.memory.usedJSHeapSize);
    }
    
    // 字节转MB
    static bytesToMB(bytes) {
        return bytes / (1024 * 1024);
    }
    
    // 添加警告
    static addWarning(monitorId, warning) {
        const monitor = this.monitors.get(monitorId);
        if (monitor) {
            monitor.warnings.push(warning);
            console.warn(`⚠️ ${warning}`);
        }
    }
    
    // 分析性能
    static analyzePerformance(monitor) {
        const analysis = {
            overall: 'good',
            issues: [],
            recommendations: [],
            score: 100
        };
        
        // 分析总时间
        if (monitor.totalDuration > this.THRESHOLDS.CHART_CREATION) {
            analysis.issues.push(`图表创建耗时过长: ${monitor.totalDuration.toFixed(2)}ms`);
            analysis.recommendations.push('考虑对大数据集进行采样');
            analysis.score -= 30;
        }
        
        // 分析内存使用
        if (monitor.memoryDelta > this.THRESHOLDS.MEMORY_USAGE) {
            analysis.issues.push(`内存使用过多: +${monitor.memoryDelta.toFixed(2)}MB`);
            analysis.recommendations.push('优化数据结构或实现内存清理');
            analysis.score -= 20;
        }
        
        // 分析数据大小
        if (monitor.dataSize > this.THRESHOLDS.LARGE_DATASET) {
            analysis.issues.push(`数据集较大: ${monitor.dataSize}行`);
            analysis.recommendations.push('启用数据采样或分页加载');
            analysis.score -= 10;
        }
        
        // 分析各阶段耗时
        monitor.phases.forEach(phase => {
            if (phase.duration > 500) {
                analysis.issues.push(`${phase.name}阶段耗时较长: ${phase.duration.toFixed(2)}ms`);
                analysis.score -= 5;
            }
        });
        
        // 确定整体评级
        if (analysis.score >= 90) {
            analysis.overall = 'excellent';
        } else if (analysis.score >= 70) {
            analysis.overall = 'good';
        } else if (analysis.score >= 50) {
            analysis.overall = 'fair';
        } else {
            analysis.overall = 'poor';
        }
        
        return analysis;
    }
    
    // 输出性能报告
    static logPerformanceReport(monitor) {
        const { analysis } = monitor;
        const emoji = {
            excellent: '🌟',
            good: '✅',
            fair: '⚠️',
            poor: '❌'
        };
        
        console.group(`${emoji[analysis.overall]} 图表性能报告: ${monitor.chartType}`);
        console.log(`总耗时: ${monitor.totalDuration.toFixed(2)}ms`);
        console.log(`内存变化: ${monitor.memoryDelta > 0 ? '+' : ''}${monitor.memoryDelta.toFixed(2)}MB`);
        console.log(`数据大小: ${monitor.dataSize}行`);
        console.log(`性能评分: ${analysis.score}/100 (${analysis.overall})`);
        
        if (monitor.phases.length > 0) {
            console.log('阶段耗时:');
            monitor.phases.forEach(phase => {
                console.log(`  ${phase.name}: ${phase.duration.toFixed(2)}ms`);
            });
        }
        
        if (analysis.issues.length > 0) {
            console.log('发现问题:');
            analysis.issues.forEach(issue => {
                console.log(`  • ${issue}`);
            });
        }
        
        if (analysis.recommendations.length > 0) {
            console.log('优化建议:');
            analysis.recommendations.forEach(rec => {
                console.log(`  💡 ${rec}`);
            });
        }
        
        if (monitor.warnings.length > 0) {
            console.log('警告信息:');
            monitor.warnings.forEach(warning => {
                console.log(`  ⚠️ ${warning}`);
            });
        }
        
        console.groupEnd();
    }
    
    // 获取性能统计
    static getPerformanceStats() {
        if (this.performanceData.length === 0) {
            return null;
        }
        
        const chartCreations = this.performanceData.filter(d => d.type !== 'data_processing');
        const dataProcessing = this.performanceData.filter(d => d.type === 'data_processing');
        
        const stats = {
            totalOperations: this.performanceData.length,
            chartCreations: {
                count: chartCreations.length,
                averageDuration: this.calculateAverage(chartCreations.map(d => d.duration)),
                averageMemoryDelta: this.calculateAverage(chartCreations.map(d => d.memoryDelta || 0))
            },
            dataProcessing: {
                count: dataProcessing.length,
                averageDuration: this.calculateAverage(dataProcessing.map(d => d.duration)),
                successRate: (dataProcessing.filter(d => d.success).length / dataProcessing.length) * 100
            },
            chartTypes: this.getChartTypeStats(chartCreations),
            recentPerformance: this.performanceData.slice(-10)
        };
        
        return stats;
    }
    
    // 计算平均值
    static calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    }
    
    // 获取图表类型统计
    static getChartTypeStats(chartData) {
        const typeStats = {};
        
        chartData.forEach(data => {
            if (!typeStats[data.chartType]) {
                typeStats[data.chartType] = {
                    count: 0,
                    totalDuration: 0,
                    averageDuration: 0
                };
            }
            
            typeStats[data.chartType].count++;
            typeStats[data.chartType].totalDuration += data.duration;
        });
        
        // 计算平均值
        Object.values(typeStats).forEach(stats => {
            stats.averageDuration = stats.totalDuration / stats.count;
        });
        
        return typeStats;
    }
    
    // 清理性能数据
    static clearPerformanceData() {
        this.performanceData = [];
        console.log('🧹 性能数据已清理');
    }
    
    // 启用/禁用性能监控
    static setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🔧 性能监控已${enabled ? '启用' : '禁用'}`);
    }
    
    // 导出性能数据
    static exportPerformanceData() {
        const data = {
            timestamp: new Date(),
            stats: this.getPerformanceStats(),
            rawData: this.performanceData,
            thresholds: this.THRESHOLDS
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    // 检查系统性能
    static checkSystemPerformance() {
        const memoryInfo = this.monitorMemoryUsage();
        const performanceInfo = {
            timestamp: new Date(),
            memory: memoryInfo,
            activeMonitors: this.monitors.size,
            totalRecords: this.performanceData.length
        };
        
        // 检查是否需要清理
        if (this.performanceData.length > 1000) {
            console.warn('⚠️ 性能数据记录过多，建议清理');
            performanceInfo.needsCleanup = true;
        }
        
        if (this.monitors.size > 10) {
            console.warn('⚠️ 活跃监控器过多，可能存在内存泄漏');
            performanceInfo.possibleMemoryLeak = true;
        }
        
        return performanceInfo;
    }
    
    // 创建性能报告HTML
    static createPerformanceReportHTML() {
        const stats = this.getPerformanceStats();
        if (!stats) {
            return '<p>暂无性能数据</p>';
        }
        
        return `
            <div class="performance-report">
                <h3>性能统计报告</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>图表创建</h4>
                        <p>总数: ${stats.chartCreations.count}</p>
                        <p>平均耗时: ${stats.chartCreations.averageDuration.toFixed(2)}ms</p>
                        <p>平均内存: ${stats.chartCreations.averageMemoryDelta.toFixed(2)}MB</p>
                    </div>
                    <div class="stat-item">
                        <h4>数据处理</h4>
                        <p>总数: ${stats.dataProcessing.count}</p>
                        <p>平均耗时: ${stats.dataProcessing.averageDuration.toFixed(2)}ms</p>
                        <p>成功率: ${stats.dataProcessing.successRate.toFixed(1)}%</p>
                    </div>
                </div>
                <div class="chart-types">
                    <h4>图表类型统计</h4>
                    ${Object.entries(stats.chartTypes).map(([type, data]) => 
                        `<p>${type}: ${data.count}次, 平均${data.averageDuration.toFixed(2)}ms</p>`
                    ).join('')}
                </div>
            </div>
        `;
    }
}