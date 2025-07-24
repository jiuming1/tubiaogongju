// 文件处理模块
class FileHandler {
    // 支持的文件类型
    static SUPPORTED_TYPES = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    
    // 最大文件大小 (10MB)
    static MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    // 验证文件类型
    static validateFileType(file) {
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const hasValidType = this.SUPPORTED_TYPES.includes(file.type);
        const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        return hasValidType || hasValidExtension;
    }
    
    // 格式化文件大小
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 读取文件
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('读取文件时出错'));
            
            // 根据文件类型选择读取方式
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                reader.readAsBinaryString(file);
            } else {
                reader.readAsText(file);
            }
        });
    }
}