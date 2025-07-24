// 高级数据处理器 - 提供数据处理和统计计算功能
class AdvancedDataProcessor {
    
    // 计算箱线图统计数据
    static calculateBoxPlotStats(data, valueColumn, groupColumn = null) {
        if (!data || data.length < 2) {
            throw new Error('数据不足，无法计算箱线图统计信息');
        }
        
        // 如果有分组列，按组计算统计信息
        if (groupColumn !== null) {
            return this.calculateGroupedBoxPlotStats(data, valueColumn, groupColumn);
        }
        
        // 提取数值数据
        const values = [];
        for (let i = 1; i < data.length; i++) {
            const value = parseFloat(data[i][valueColumn]);
            if (!isNaN(value)) {
                values.push(value);
            }
        }
        
        if (values.length === 0) {
            throw new Error('没有有效的数值数据');
        }
        
        return this.calculateSingleBoxPlotStats(values);
    }
    
    // 计算单组箱线图统计信息
    static calculateSingleBoxPlotStats(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;
        
        const q1Index = Math.floor(n * 0.25);
        const medianIndex = Math.floor(n * 0.5);
        const q3Index = Math.floor(n * 0.75);
        
        const q1 = sorted[q1Index];
        const median = n % 2 === 0 ? 
            (sorted[medianIndex - 1] + sorted[medianIndex]) / 2 : 
            sorted[medianIndex];
        const q3 = sorted[q3Index];
        
        const iqr = q3 - q1;
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;
        
        // 找到实际的最小值和最大值（在围栏内）
        const min = sorted.find(v => v >= lowerFence) || sorted[0];
        const max = sorted.reverse().find(v => v <= upperFence) || sorted[0];
        
        // 找出异常值
        const outliers = values.filter(v => v < lowerFence || v > upperFence);
        
        return {
            min,
            q1,
            median,
            q3,
            max,
            outliers,
            count: values.length,
            mean: values.reduce((sum, v) => sum + v, 0) / values.length
        };
    }
    
    // 计算分组箱线图统计信息
    static calculateGroupedBoxPlotStats(data, valueColumn, groupColumn) {
        const groups = {};
        
        // 按组分类数据
        for (let i = 1; i < data.length; i++) {
            const group = data[i][groupColumn];
            const value = parseFloat(data[i][valueColumn]);
            
            if (group && !isNaN(value)) {
                if (!groups[group]) {
                    groups[group] = [];
                }
                groups[group].push(value);
            }
        }
        
        // 为每组计算统计信息
        const result = {};
        for (const [groupName, values] of Object.entries(groups)) {
            if (values.length > 0) {
                result[groupName] = this.calculateSingleBoxPlotStats(values);
            }
        }
        
        return result;
    }
    
    // 极坐标转换
    static convertToPolarCoordinates(data, angleColumn, radiusColumn, options = {}) {
        const {
            angleUnit = 'degrees', // 'degrees' 或 'radians'
            startAngle = 0,
            maxRadius = null
        } = options;
        
        const result = [];
        let maxR = 0;
        
        // 第一遍：找到最大半径值
        for (let i = 1; i < data.length; i++) {
            const radius = parseFloat(data[i][radiusColumn]);
            if (!isNaN(radius)) {
                maxR = Math.max(maxR, Math.abs(radius));
            }
        }
        
        const normalizeRadius = maxRadius || maxR;
        
        // 第二遍：转换坐标
        for (let i = 1; i < data.length; i++) {
            let angle = parseFloat(data[i][angleColumn]);
            let radius = parseFloat(data[i][radiusColumn]);
            
            if (isNaN(angle) || isNaN(radius)) continue;
            
            // 角度转换
            if (angleUnit === 'degrees') {
                angle = (angle + startAngle) * Math.PI / 180;
            } else {
                angle = angle + startAngle;
            }
            
            // 半径归一化
            radius = Math.abs(radius) / normalizeRadius;
            
            // 转换为笛卡尔坐标
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            result.push({
                angle: angle,
                radius: radius,
                x: x,
                y: y,
                originalAngle: data[i][angleColumn],
                originalRadius: data[i][radiusColumn]
            });
        }
        
        return result;
    }
    
    // 热力图数据聚合
    static aggregateHeatmapData(data, xColumn, yColumn, valueColumn, options = {}) {
        const {
            gridSize = 10,
            aggregationMethod = 'sum' // 'sum', 'average', 'count', 'max', 'min'
        } = options;
        
        // 收集所有数据点
        const points = [];
        for (let i = 1; i < data.length; i++) {
            const x = parseFloat(data[i][xColumn]);
            const y = parseFloat(data[i][yColumn]);
            const value = parseFloat(data[i][valueColumn]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(value)) {
                points.push({ x, y, value });
            }
        }
        
        if (points.length === 0) {
            throw new Error('没有有效的数据点用于热力图');
        }
        
        // 计算数据范围
        const xMin = Math.min(...points.map(p => p.x));
        const xMax = Math.max(...points.map(p => p.x));
        const yMin = Math.min(...points.map(p => p.y));
        const yMax = Math.max(...points.map(p => p.y));
        
        // 创建网格
        const xStep = (xMax - xMin) / gridSize;
        const yStep = (yMax - yMin) / gridSize;
        
        const grid = {};
        
        // 将数据点分配到网格
        points.forEach(point => {
            const gridX = Math.floor((point.x - xMin) / xStep);
            const gridY = Math.floor((point.y - yMin) / yStep);
            const key = `${gridX},${gridY}`;
            
            if (!grid[key]) {
                grid[key] = {
                    x: gridX,
                    y: gridY,
                    values: [],
                    centerX: xMin + (gridX + 0.5) * xStep,
                    centerY: yMin + (gridY + 0.5) * yStep
                };
            }
            
            grid[key].values.push(point.value);
        });
        
        // 聚合网格数据
        const result = [];
        for (const cell of Object.values(grid)) {
            let aggregatedValue;
            
            switch (aggregationMethod) {
                case 'sum':
                    aggregatedValue = cell.values.reduce((sum, v) => sum + v, 0);
                    break;
                case 'average':
                    aggregatedValue = cell.values.reduce((sum, v) => sum + v, 0) / cell.values.length;
                    break;
                case 'count':
                    aggregatedValue = cell.values.length;
                    break;
                case 'max':
                    aggregatedValue = Math.max(...cell.values);
                    break;
                case 'min':
                    aggregatedValue = Math.min(...cell.values);
                    break;
                default:
                    aggregatedValue = cell.values.reduce((sum, v) => sum + v, 0);
            }
            
            result.push({
                x: cell.centerX,
                y: cell.centerY,
                value: aggregatedValue,
                count: cell.values.length,
                gridX: cell.x,
                gridY: cell.y
            });
        }
        
        return result;
    }
    
    // 瀑布图累积计算
    static calculateWaterfallCumulative(data, valueColumn, options = {}) {
        const {
            startValue = 0,
            includeTotal = true,
            totalLabel = '总计'
        } = options;
        
        const result = [];
        let cumulative = startValue;
        
        // 添加起始值
        result.push({
            label: '起始值',
            value: startValue,
            cumulative: cumulative,
            type: 'start',
            isPositive: startValue >= 0
        });
        
        // 处理每个数据点
        for (let i = 1; i < data.length; i++) {
            const label = data[i][0] || `项目 ${i}`;
            const value = parseFloat(data[i][valueColumn]);
            
            if (isNaN(value)) continue;
            
            const previousCumulative = cumulative;
            cumulative += value;
            
            result.push({
                label: label,
                value: value,
                cumulative: cumulative,
                previousCumulative: previousCumulative,
                type: 'change',
                isPositive: value >= 0
            });
        }
        
        // 添加总计
        if (includeTotal) {
            result.push({
                label: totalLabel,
                value: cumulative - startValue,
                cumulative: cumulative,
                type: 'total',
                isPositive: cumulative >= startValue
            });
        }
        
        return result;
    }
    
    // 数据采样 - 用于性能优化
    static sampleLargeDataset(data, maxPoints = 1000, method = 'uniform') {
        if (!data || data.length <= maxPoints + 1) { // +1 for header
            return data;
        }
        
        const header = data[0];
        const dataRows = data.slice(1);
        
        let sampledRows;
        
        switch (method) {
            case 'uniform':
                sampledRows = this.uniformSampling(dataRows, maxPoints);
                break;
            case 'random':
                sampledRows = this.randomSampling(dataRows, maxPoints);
                break;
            case 'systematic':
                sampledRows = this.systematicSampling(dataRows, maxPoints);
                break;
            default:
                sampledRows = this.uniformSampling(dataRows, maxPoints);
        }
        
        return [header, ...sampledRows];
    }
    
    // 均匀采样
    static uniformSampling(data, maxPoints) {
        const step = Math.ceil(data.length / maxPoints);
        return data.filter((_, index) => index % step === 0);
    }
    
    // 随机采样
    static randomSampling(data, maxPoints) {
        const indices = new Set();
        while (indices.size < Math.min(maxPoints, data.length)) {
            indices.add(Math.floor(Math.random() * data.length));
        }
        return Array.from(indices).sort((a, b) => a - b).map(i => data[i]);
    }
    
    // 系统采样
    static systematicSampling(data, maxPoints) {
        const interval = data.length / maxPoints;
        const result = [];
        
        for (let i = 0; i < maxPoints && i * interval < data.length; i++) {
            const index = Math.floor(i * interval);
            result.push(data[index]);
        }
        
        return result;
    }
    
    // 数据类型检测增强
    static detectAdvancedColumnTypes(data) {
        if (!data || data.length < 2) return [];
        
        const types = [];
        const sampleSize = Math.min(100, data.length - 1);
        
        for (let col = 0; col < data[0].length; col++) {
            const samples = [];
            
            // 收集样本
            for (let row = 1; row <= sampleSize; row++) {
                if (data[row] && data[row][col] !== null && data[row][col] !== undefined && data[row][col] !== '') {
                    samples.push(data[row][col]);
                }
            }
            
            types.push(this.analyzeColumnType(samples));
        }
        
        return types;
    }
    
    // 分析列类型
    static analyzeColumnType(samples) {
        if (samples.length === 0) return { type: 'unknown', confidence: 0 };
        
        let numberCount = 0;
        let dateCount = 0;
        let booleanCount = 0;
        let textCount = 0;
        
        samples.forEach(sample => {
            const str = String(sample).trim();
            
            // 检查数字
            if (!isNaN(parseFloat(str)) && isFinite(str)) {
                numberCount++;
            }
            // 检查日期
            else if (this.isDateString(str)) {
                dateCount++;
            }
            // 检查布尔值
            else if (/^(true|false|yes|no|是|否)$/i.test(str)) {
                booleanCount++;
            }
            // 其他为文本
            else {
                textCount++;
            }
        });
        
        const total = samples.length;
        const threshold = 0.8; // 80%的数据符合类型才认为是该类型
        
        if (numberCount / total >= threshold) {
            return { type: 'number', confidence: numberCount / total };
        } else if (dateCount / total >= threshold) {
            return { type: 'date', confidence: dateCount / total };
        } else if (booleanCount / total >= threshold) {
            return { type: 'boolean', confidence: booleanCount / total };
        } else {
            return { type: 'text', confidence: textCount / total };
        }
    }
    
    // 检查是否为日期字符串
    static isDateString(str) {
        const date = new Date(str);
        return !isNaN(date.getTime()) && str.length > 4;
    }
}