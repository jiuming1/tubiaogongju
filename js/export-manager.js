// 导出管理模块
class ExportManager {
    // 支持的导出格式
    static EXPORT_FORMATS = {
        PNG: 'png',
        JPG: 'jpg',
        SVG: 'svg',
        PDF: 'pdf'
    };
    
    // 导出图表
    static async exportChart(container, format, filename, width, height, background, quality = 'high') {
        console.log('ExportManager.exportChart 被调用:', { format, filename, width, height, background, quality });
        console.trace('ExportManager.exportChart 调用堆栈');
        
        try {
            if (format === 'pdf') {
                await this.exportAsPDF(container, filename, width, height, background, quality);
            } else {
                await this.exportAsImage(container, format, filename, width, height, background, quality);
            }
            console.log('ExportManager.exportChart 执行完成');
        } catch (error) {
            console.error('ExportManager.exportChart 执行失败:', error);
            throw new Error(`导出失败: ${error.message}`);
        }
    }
    
    // 导出为图片
    static async exportAsImage(container, format, filename, width, height, background, quality = 'high') {
        // 根据质量设置确定参数
        const qualitySettings = this.getQualitySettings(quality);
        
        // 强制白色背景避免黑色背景问题
        let finalBackground = background;
        if (background === 'transparent' || !background) {
            finalBackground = '#FFFFFF';
        }
        
        // 高清晰度导出设置
        const actualWidth = width * qualitySettings.scale;
        const actualHeight = height * qualitySettings.scale;
        
        console.log('ExportManager.exportAsImage: 高清晰度导出设置', { 
            scale: qualitySettings.scale, 
            compression: qualitySettings.compression,
            originalSize: { width, height },
            highResSize: { width: actualWidth, height: actualHeight },
            description: qualitySettings.description
        });
        
        const canvas = await html2canvas(container, {
            width: width,
            height: height,
            backgroundColor: finalBackground,
            scale: qualitySettings.scale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            removeContainer: false,
            imageTimeout: 15000,
            // 添加Canvas优化选项
            willReadFrequently: true
        });
        
        // 不需要调整Canvas尺寸，保持html2canvas生成的高分辨率
        let finalCanvas = canvas;
        
        // 如果用户选择透明背景，处理透明度
        if (background === 'transparent') {
            finalCanvas = this.makeBackgroundTransparent(finalCanvas);
        }
        
        console.log('ExportManager.exportAsImage: 准备下载文件', { filename, format });
        
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = finalCanvas.toDataURL(`image/${format}`, qualitySettings.compression);
        
        console.log('ExportManager.exportAsImage: 触发下载');
        link.click();
        
        console.log('ExportManager.exportAsImage: 下载已触发');
    }
    
    // 导出为PDF
    static async exportAsPDF(container, filename, width, height, background, quality = 'high') {
        const qualitySettings = this.getQualitySettings(quality);
        
        // 强制白色背景
        let finalBackground = background;
        if (background === 'transparent' || !background) {
            finalBackground = '#FFFFFF';
        }
        
        const canvas = await html2canvas(container, {
            width: width,
            height: height,
            backgroundColor: finalBackground,
            scale: qualitySettings.scale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            willReadFrequently: true
        });
        
        const finalCanvas = this.resizeCanvas(canvas, width, height);
        const imgData = finalCanvas.toDataURL('image/png', qualitySettings.compression);
        
        const pdf = new jspdf.jsPDF({
            orientation: width > height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${filename}.pdf`);
    }
    
    // 导出为SVG (简化版本)
    static exportAsSVG(chartData, filename) {
        // 这是一个简化的SVG导出实现
        // 实际项目中可能需要更复杂的SVG生成逻辑
        const svg = this.generateSVG(chartData);
        this.downloadFile(svg, `${filename}.svg`, 'image/svg+xml');
    }
    
    // 生成SVG (简化版本)
    static generateSVG(chartData) {
        // 简化的SVG生成逻辑
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
            <text x="400" y="30" text-anchor="middle" font-size="20">Chart Export</text>
            <!-- 这里应该包含实际的图表SVG代码 -->
        </svg>`;
    }
    
    // 下载文件
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    // 获取质量设置 - 统一使用高质量设置确保最佳效果
    static getQualitySettings(quality) {
        // 统一使用优化的高质量设置
        const optimizedQuality = {
            scale: 2,           // 2倍缩放确保清晰度
            compression: 0.95,  // 高压缩质量减少失真
            description: '高质量导出 - 最佳清晰度'
        };
        
        console.log('ExportManager: 使用统一高质量设置', optimizedQuality);
        return optimizedQuality;
    }
    
    // 调整Canvas尺寸
    static resizeCanvas(sourceCanvas, targetWidth, targetHeight) {
        const targetCanvas = document.createElement('canvas');
        const targetCtx = targetCanvas.getContext('2d');
        
        targetCanvas.width = targetWidth;
        targetCanvas.height = targetHeight;
        
        // 使用高质量缩放
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';
        
        // 绘制调整后的图像
        targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
        
        return targetCanvas;
    }
    
    // 使背景透明
    static makeBackgroundTransparent(canvas) {
        const newCanvas = document.createElement('canvas');
        const ctx = newCanvas.getContext('2d');
        
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        
        // 获取原始图像数据
        const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 将白色背景转换为透明
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 检测白色或接近白色的像素
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // 设置为透明
            }
        }
        
        // 将处理后的数据绘制到新Canvas
        ctx.putImageData(imageData, 0, 0);
        
        return newCanvas;
    }
    
    // 检查浏览器支持
    static checkBrowserSupport() {
        const support = {
            canvas: !!document.createElement('canvas').getContext,
            download: 'download' in document.createElement('a'),
            blob: typeof Blob !== 'undefined',
            html2canvas: typeof html2canvas !== 'undefined',
            jspdf: typeof jspdf !== 'undefined'
        };
        
        return support;
    }
}