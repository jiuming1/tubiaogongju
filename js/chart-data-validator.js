// 图表数据验证器 - 提供数据验证功能
class ChartDataValidator {
    
    // 验证散点图数据
    static validateScatterData(data, xColumn, yColumn) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validPointCount: 0,
            totalPointCount: 0
        };
        
        // 基础验证
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，散点图需要至少包含表头和一行数据');
            return validation;
        }
        
        if (xColumn === yColumn) {
            validation.valid = false;
            validation.errors.push('X轴和Y轴不能选择相同的列');
            return validation;
        }
        
        // 检查列索引有效性
        if (xColumn >= data[0].length || yColumn >= data[0].length) {
            validation.valid = false;
            validation.errors.push('选择的列索引超出数据范围');
            return validation;
        }
        
        // 验证数据点
        for (let i = 1; i < data.length; i++) {
            validation.totalPointCount++;
            
            const xValue = data[i][xColumn];
            const yValue = data[i][yColumn];
            
            const x = parseFloat(xValue);
            const y = parseFloat(yValue);
            
            if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
                validation.validPointCount++;
            } else {
                if (isNaN(x)) {
                    validation.warnings.push(`第${i}行X轴数据无效: "${xValue}"`);
                }
                if (isNaN(y)) {
                    validation.warnings.push(`第${i}行Y轴数据无效: "${yValue}"`);
                }
            }
        }
        
        // 检查有效数据点数量
        if (validation.validPointCount < 2) {
            validation.valid = false;
            validation.errors.push(`散点图需要至少2个有效数据点，当前只有${validation.validPointCount}个`);
        } else if (validation.validPointCount < validation.totalPointCount * 0.5) {
            validation.warnings.push(`有效数据点比例较低: ${validation.validPointCount}/${validation.totalPointCount}`);
        }
        
        return validation;
    }
    
    // 验证气泡图数据
    static validateBubbleData(data, xColumn, yColumn, sizeColumn) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validPointCount: 0,
            totalPointCount: 0,
            sizeRange: { min: Infinity, max: -Infinity }
        };
        
        // 基础验证
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，气泡图需要至少包含表头和一行数据');
            return validation;
        }
        
        // 检查列不能相同
        const columns = [xColumn, yColumn, sizeColumn];
        const uniqueColumns = new Set(columns);
        if (uniqueColumns.size !== columns.length) {
            validation.valid = false;
            validation.errors.push('X轴、Y轴和气泡大小不能选择相同的列');
            return validation;
        }
        
        // 检查列索引有效性
        const maxColumn = Math.max(xColumn, yColumn, sizeColumn);
        if (maxColumn >= data[0].length) {
            validation.valid = false;
            validation.errors.push('选择的列索引超出数据范围');
            return validation;
        }
        
        // 验证数据点
        for (let i = 1; i < data.length; i++) {
            validation.totalPointCount++;
            
            const xValue = data[i][xColumn];
            const yValue = data[i][yColumn];
            const sizeValue = data[i][sizeColumn];
            
            const x = parseFloat(xValue);
            const y = parseFloat(yValue);
            const size = parseFloat(sizeValue);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(size) && 
                isFinite(x) && isFinite(y) && isFinite(size) && size > 0) {
                validation.validPointCount++;
                validation.sizeRange.min = Math.min(validation.sizeRange.min, size);
                validation.sizeRange.max = Math.max(validation.sizeRange.max, size);
            } else {
                if (isNaN(x)) {
                    validation.warnings.push(`第${i}行X轴数据无效: "${xValue}"`);
                }
                if (isNaN(y)) {
                    validation.warnings.push(`第${i}行Y轴数据无效: "${yValue}"`);
                }
                if (isNaN(size) || size <= 0) {
                    validation.warnings.push(`第${i}行气泡大小数据无效: "${sizeValue}"`);
                }
            }
        }
        
        // 检查有效数据点数量
        if (validation.validPointCount < 2) {
            validation.valid = false;
            validation.errors.push(`气泡图需要至少2个有效数据点，当前只有${validation.validPointCount}个`);
        }
        
        // 检查气泡大小范围
        if (validation.sizeRange.min === validation.sizeRange.max && validation.validPointCount > 1) {
            validation.warnings.push('所有气泡大小相同，可能影响可视化效果');
        }
        
        return validation;
    }
    
    // 验证面积图数据
    static validateAreaData(data, xColumn, yColumn) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validPointCount: 0,
            totalPointCount: 0,
            hasNegativeValues: false
        };
        
        // 基础验证（复用散点图验证逻辑）
        const scatterValidation = this.validateScatterData(data, xColumn, yColumn);
        validation.valid = scatterValidation.valid;
        validation.errors = [...scatterValidation.errors];
        validation.warnings = [...scatterValidation.warnings];
        validation.validPointCount = scatterValidation.validPointCount;
        validation.totalPointCount = scatterValidation.totalPointCount;
        
        if (!validation.valid) {
            return validation;
        }
        
        // 面积图特有验证
        for (let i = 1; i < data.length; i++) {
            const yValue = parseFloat(data[i][yColumn]);
            if (!isNaN(yValue) && yValue < 0) {
                validation.hasNegativeValues = true;
            }
        }
        
        if (validation.hasNegativeValues) {
            validation.warnings.push('数据包含负值，面积图可能显示异常');
        }
        
        return validation;
    }
    
    // 验证箱线图数据
    static validateBoxPlotData(data, valueColumn, groupColumn = null) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validValueCount: 0,
            totalValueCount: 0,
            groups: {},
            outlierCount: 0
        };
        
        // 基础验证
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，箱线图需要至少包含表头和一行数据');
            return validation;
        }
        
        if (valueColumn >= data[0].length) {
            validation.valid = false;
            validation.errors.push('选择的数值列索引超出数据范围');
            return validation;
        }
        
        if (groupColumn !== null && groupColumn >= data[0].length) {
            validation.valid = false;
            validation.errors.push('选择的分组列索引超出数据范围');
            return validation;
        }
        
        // 收集数据
        for (let i = 1; i < data.length; i++) {
            validation.totalValueCount++;
            
            const value = parseFloat(data[i][valueColumn]);
            const group = groupColumn !== null ? data[i][groupColumn] : 'default';
            
            if (!isNaN(value) && isFinite(value)) {
                validation.validValueCount++;
                
                if (!validation.groups[group]) {
                    validation.groups[group] = [];
                }
                validation.groups[group].push(value);
            } else {
                validation.warnings.push(`第${i}行数值无效: "${data[i][valueColumn]}"`);
            }
        }
        
        // 检查每组数据量
        for (const [groupName, values] of Object.entries(validation.groups)) {
            if (values.length < 5) {
                if (Object.keys(validation.groups).length === 1) {
                    validation.valid = false;
                    validation.errors.push(`箱线图需要至少5个有效数值，当前只有${values.length}个`);
                } else {
                    validation.warnings.push(`分组"${groupName}"数据不足(${values.length}个)，可能无法正确显示`);
                }
            }
        }
        
        // 计算异常值
        for (const values of Object.values(validation.groups)) {
            if (values.length >= 5) {
                const stats = AdvancedDataProcessor.calculateSingleBoxPlotStats(values);
                validation.outlierCount += stats.outliers.length;
            }
        }
        
        if (validation.outlierCount > validation.validValueCount * 0.2) {
            validation.warnings.push(`异常值较多(${validation.outlierCount}个)，请检查数据质量`);
        }
        
        return validation;
    }
    
    // 验证热力图数据
    static validateHeatmapData(data, xColumn, yColumn, valueColumn) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validPointCount: 0,
            totalPointCount: 0,
            uniqueXValues: new Set(),
            uniqueYValues: new Set(),
            valueRange: { min: Infinity, max: -Infinity }
        };
        
        // 基础验证
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，热力图需要至少包含表头和一行数据');
            return validation;
        }
        
        // 检查列不能相同
        const columns = [xColumn, yColumn, valueColumn];
        const uniqueColumns = new Set(columns);
        if (uniqueColumns.size !== columns.length) {
            validation.valid = false;
            validation.errors.push('X轴、Y轴和数值列不能选择相同的列');
            return validation;
        }
        
        // 验证数据点
        for (let i = 1; i < data.length; i++) {
            validation.totalPointCount++;
            
            const xValue = parseFloat(data[i][xColumn]);
            const yValue = parseFloat(data[i][yColumn]);
            const value = parseFloat(data[i][valueColumn]);
            
            if (!isNaN(xValue) && !isNaN(yValue) && !isNaN(value) && 
                isFinite(xValue) && isFinite(yValue) && isFinite(value)) {
                validation.validPointCount++;
                validation.uniqueXValues.add(xValue);
                validation.uniqueYValues.add(yValue);
                validation.valueRange.min = Math.min(validation.valueRange.min, value);
                validation.valueRange.max = Math.max(validation.valueRange.max, value);
            }
        }
        
        // 检查数据点数量
        if (validation.validPointCount < 4) {
            validation.valid = false;
            validation.errors.push(`热力图需要至少4个有效数据点，当前只有${validation.validPointCount}个`);
        }
        
        // 检查数据分布
        const xCount = validation.uniqueXValues.size;
        const yCount = validation.uniqueYValues.size;
        
        if (xCount < 2 || yCount < 2) {
            validation.valid = false;
            validation.errors.push('热力图需要X轴和Y轴都有至少2个不同的值');
        }
        
        if (validation.validPointCount < xCount * yCount * 0.3) {
            validation.warnings.push('数据点稀疏，热力图效果可能不佳');
        }
        
        return validation;
    }
    
    // 验证瀑布图数据
    static validateWaterfallData(data, categoryColumn, valueColumn) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validPointCount: 0,
            totalPointCount: 0,
            positiveCount: 0,
            negativeCount: 0,
            zeroCount: 0
        };
        
        // 基础验证
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，瀑布图需要至少包含表头和一行数据');
            return validation;
        }
        
        if (categoryColumn === valueColumn) {
            validation.valid = false;
            validation.errors.push('类别列和数值列不能相同');
            return validation;
        }
        
        // 验证数据
        for (let i = 1; i < data.length; i++) {
            validation.totalPointCount++;
            
            const category = data[i][categoryColumn];
            const value = parseFloat(data[i][valueColumn]);
            
            if (category && !isNaN(value) && isFinite(value)) {
                validation.validPointCount++;
                
                if (value > 0) {
                    validation.positiveCount++;
                } else if (value < 0) {
                    validation.negativeCount++;
                } else {
                    validation.zeroCount++;
                }
            } else {
                if (!category) {
                    validation.warnings.push(`第${i}行类别为空`);
                }
                if (isNaN(value)) {
                    validation.warnings.push(`第${i}行数值无效: "${data[i][valueColumn]}"`);
                }
            }
        }
        
        if (validation.validPointCount < 2) {
            validation.valid = false;
            validation.errors.push(`瀑布图需要至少2个有效数据点，当前只有${validation.validPointCount}个`);
        }
        
        if (validation.positiveCount === 0 && validation.negativeCount === 0) {
            validation.warnings.push('所有数值都为0，瀑布图将没有变化');
        }
        
        return validation;
    }
    
    // 验证仪表盘数据
    static validateGaugeData(data, valueColumn, options = {}) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validValueCount: 0,
            totalValueCount: 0,
            valueRange: { min: Infinity, max: -Infinity },
            averageValue: 0
        };
        
        const { min = 0, max = 100 } = options;
        
        // 基础验证
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，仪表盘图需要至少包含表头和一行数据');
            return validation;
        }
        
        let sum = 0;
        
        // 验证数据
        for (let i = 1; i < data.length; i++) {
            validation.totalValueCount++;
            
            const value = parseFloat(data[i][valueColumn]);
            
            if (!isNaN(value) && isFinite(value)) {
                validation.validValueCount++;
                validation.valueRange.min = Math.min(validation.valueRange.min, value);
                validation.valueRange.max = Math.max(validation.valueRange.max, value);
                sum += value;
            } else {
                validation.warnings.push(`第${i}行数值无效: "${data[i][valueColumn]}"`);
            }
        }
        
        if (validation.validValueCount === 0) {
            validation.valid = false;
            validation.errors.push('没有有效的数值数据');
            return validation;
        }
        
        validation.averageValue = sum / validation.validValueCount;
        
        // 检查数值范围
        if (validation.valueRange.max < min || validation.valueRange.min > max) {
            validation.warnings.push(`数据值(${validation.valueRange.min}-${validation.valueRange.max})超出仪表盘范围(${min}-${max})`);
        }
        
        // 如果只有一个值，建议使用该值
        if (validation.validValueCount === 1) {
            validation.warnings.push('只有一个有效数值，将使用该值显示仪表盘');
        } else if (validation.validValueCount > 1) {
            validation.warnings.push(`有${validation.validValueCount}个数值，将使用平均值(${validation.averageValue.toFixed(2)})显示仪表盘`);
        }
        
        return validation;
    }
    
    // 通用数据验证
    static validateData(data, chartType, selectedColumns, options = {}) {
        if (!data || !chartType || !selectedColumns) {
            return {
                valid: false,
                errors: ['缺少必要的验证参数'],
                warnings: []
            };
        }
        
        // 根据图表类型调用相应的验证方法
        switch (chartType) {
            case 'scatter':
                return this.validateScatterData(data, selectedColumns.xAxis, selectedColumns.yAxis);
            
            case 'bubble':
                return this.validateBubbleData(data, selectedColumns.xAxis, selectedColumns.yAxis, selectedColumns.size);
            
            case 'area':
                return this.validateAreaData(data, selectedColumns.xAxis, selectedColumns.yAxis);
            
            case 'boxplot':
                return this.validateBoxPlotData(data, selectedColumns.values, selectedColumns.groups);
            
            case 'heatmap':
                return this.validateHeatmapData(data, selectedColumns.xAxis, selectedColumns.yAxis, selectedColumns.value);
            
            case 'waterfall':
                return this.validateWaterfallData(data, selectedColumns.category, selectedColumns.value);
            
            case 'gauge':
                return this.validateGaugeData(data, selectedColumns.value, options);
            
            default:
                // 对于基础图表类型，使用简单验证
                return this.validateBasicChartData(data, selectedColumns);
        }
    }
    
    // 基础图表数据验证
    static validateBasicChartData(data, selectedColumns) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            validPointCount: 0,
            totalPointCount: 0
        };
        
        if (!data || data.length < 2) {
            validation.valid = false;
            validation.errors.push('数据不足，需要至少包含表头和一行数据');
            return validation;
        }
        
        const xColumn = selectedColumns.xAxis;
        const yColumn = selectedColumns.yAxis;
        
        if (xColumn === yColumn) {
            validation.valid = false;
            validation.errors.push('X轴和Y轴不能选择相同的列');
            return validation;
        }
        
        // 验证数据点
        for (let i = 1; i < data.length; i++) {
            validation.totalPointCount++;
            
            const xValue = data[i][xColumn];
            const yValue = parseFloat(data[i][yColumn]);
            
            if (xValue && !isNaN(yValue) && isFinite(yValue)) {
                validation.validPointCount++;
            }
        }
        
        if (validation.validPointCount < 1) {
            validation.valid = false;
            validation.errors.push('没有有效的数据点');
        }
        
        return validation;
    }
    
    // 创建验证报告
    static createValidationReport(validation) {
        let report = '';
        
        if (!validation.valid) {
            report += '❌ 数据验证失败\n\n';
            report += '错误:\n';
            validation.errors.forEach(error => {
                report += `• ${error}\n`;
            });
        } else {
            report += '✅ 数据验证通过\n\n';
            if (validation.validPointCount !== undefined) {
                report += `有效数据点: ${validation.validPointCount}/${validation.totalPointCount}\n`;
            }
        }
        
        if (validation.warnings && validation.warnings.length > 0) {
            report += '\n警告:\n';
            validation.warnings.forEach(warning => {
                report += `⚠️ ${warning}\n`;
            });
        }
        
        return report;
    }
}