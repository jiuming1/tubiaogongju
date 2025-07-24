// 上传状态管理器
class UploadStateManager {
    constructor() {
        this.reset();
    }
    
    // 重置状态
    reset() {
        this.status = 'idle'; // 'idle', 'uploading', 'processing', 'completed', 'error'
        this.currentFile = null;
        this.uploadProgress = 0;
        this.error = null;
        this.startTime = null;
        this.endTime = null;
        
        console.log('UploadStateManager: State reset to idle');
    }
    
    // 检查是否可以开始上传
    canStartUpload() {
        const canStart = this.status === 'idle' || this.status === 'completed' || this.status === 'error';
        console.log(`UploadStateManager: Can start upload: ${canStart} (current status: ${this.status})`);
        return canStart;
    }
    
    // 开始上传
    startUpload(file) {
        if (!this.canStartUpload()) {
            throw new Error(`Cannot start upload. Current status: ${this.status}`);
        }
        
        this.status = 'uploading';
        this.currentFile = file;
        this.uploadProgress = 0;
        this.error = null;
        this.startTime = new Date();
        this.endTime = null;
        
        console.log(`UploadStateManager: Started upload for file: ${file.name} (${file.size} bytes)`);
    }
    
    // 设置为处理状态
    setProcessing() {
        if (this.status !== 'uploading') {
            console.warn(`UploadStateManager: Unexpected status transition to processing from ${this.status}`);
        }
        
        this.status = 'processing';
        console.log('UploadStateManager: Status changed to processing');
    }
    
    // 更新进度
    updateProgress(progress) {
        if (this.status !== 'uploading' && this.status !== 'processing') {
            console.warn(`UploadStateManager: Cannot update progress in status: ${this.status}`);
            return;
        }
        
        this.uploadProgress = Math.max(0, Math.min(100, progress));
        console.log(`UploadStateManager: Progress updated to ${this.uploadProgress}%`);
    }
    
    // 完成上传
    completeUpload() {
        if (this.status !== 'processing' && this.status !== 'uploading') {
            console.warn(`UploadStateManager: Unexpected completion from status: ${this.status}`);
        }
        
        this.status = 'completed';
        this.uploadProgress = 100;
        this.endTime = new Date();
        
        const duration = this.endTime - this.startTime;
        console.log(`UploadStateManager: Upload completed in ${duration}ms`);
    }
    
    // 设置错误状态
    setError(error) {
        this.status = 'error';
        this.error = error;
        this.endTime = new Date();
        
        const duration = this.startTime ? this.endTime - this.startTime : 0;
        console.error(`UploadStateManager: Upload failed after ${duration}ms:`, error);
    }
    
    // 获取当前状态信息
    getStatusInfo() {
        return {
            status: this.status,
            file: this.currentFile ? {
                name: this.currentFile.name,
                size: this.currentFile.size,
                type: this.currentFile.type
            } : null,
            progress: this.uploadProgress,
            error: this.error,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.startTime && this.endTime ? this.endTime - this.startTime : null
        };
    }
    
    // 检查是否正在上传
    isUploading() {
        return this.status === 'uploading' || this.status === 'processing';
    }
    
    // 检查是否有错误
    hasError() {
        return this.status === 'error';
    }
    
    // 检查是否已完成
    isCompleted() {
        return this.status === 'completed';
    }
    
    // 获取错误信息
    getError() {
        return this.error;
    }
    
    // 获取当前文件
    getCurrentFile() {
        return this.currentFile;
    }
    
    // 获取进度
    getProgress() {
        return this.uploadProgress;
    }
}