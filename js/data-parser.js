// 数据解析模块
class DataParser {
    // 解析Excel文件
    static parseExcel(data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }
    
    // 解析CSV文件
    static parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const result = [];
        
        for (let line of lines) {
            const row = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            
            row.push(current.trim());
            result.push(row);
        }
        
        return result;
    }
    
    // 检测列数据类型
    static detectColumnTypes(data) {
        const types = [];
        
        for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
            let numberCount = 0;
            let dateCount = 0;
            let totalCount = 0;
            
            // 检查前10行数据来判断类型
            for (let rowIndex = 1; rowIndex < Math.min(data.length, 11); rowIndex++) {
                const value = data[rowIndex][colIndex];
                if (value && value.toString().trim() !== '') {
                    totalCount++;
                    
                    // 检查是否为数字
                    if (!isNaN(parseFloat(value)) && isFinite(value)) {
                        numberCount++;
                    }
                    
                    // 检查是否为日期
                    if (this.isValidDate(value)) {
                        dateCount++;
                    }
                }
            }
            
            // 判断类型（超过70%的数据符合某种类型）
            if (numberCount / totalCount > 0.7) {
                types.push('number');
            } else if (dateCount / totalCount > 0.7) {
                types.push('date');
            } else {
                types.push('string');
            }
        }
        
        return types;
    }
    
    // 验证是否为有效日期
    static isValidDate(value) {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    }
    
    // 验证数据有效性
    static validateData(data) {
        return data && data.length > 1 && data[0].length > 0;
    }
    
    // 清理数据
    static cleanData(data) {
        return data.map(row => 
            row.map(cell => 
                cell === null || cell === undefined ? '' : cell.toString().trim()
            )
        );
    }
}