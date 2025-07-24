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
    static async exportChart(container, format, filename, width, height, background) {
        try {
            if (format === 'pdf') {
                await this.exportAsPDF(container, filename, width, height, background);
            } else {
                await this.exportAsImage(container, format, filename, width, height, background);
            }
        } catch (error) {
            throw new Error(`导出失败: ${error.message}`);
        }
    }
    
    // 导出为图片
    static async exportAsImage(container, format, filename, width, height, background) {
        const canvas = await html2canvas(container, {
            width: width,
            height: height,
            backgroundColor: background,
            scale: 2, // 提高清晰度
            useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.9);
        link.click();
    }
    
    // 导出为PDF
    static async exportAsPDF(container, filename, width, height, background) {
        const canvas = await html2canvas(container, {
            width: width,
            height: height,
            backgroundColor: background,
            scale: 2
        });
        
        const imgData = canvas.toDataURL('image/png');
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
    
    // 检查浏览器支持
    static checkBrowserSupport() {
        const support = {
            canvas: !!document.createElement('canvas').getContext,
            download: 'download' in document.createElement('a'),
            blob: typeof Blob !== 'undefined'
        };
        
        return support;
    }
}