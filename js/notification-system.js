// 通知系统模块
class NotificationSystem {
    // 通知类型
    static TYPES = {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    };
    
    // 显示通知
    static show(title, message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationIcon = document.getElementById('notification-icon');
        const notificationMessage = document.getElementById('notification-message');
        
        if (!notification || !notificationIcon || !notificationMessage) {
            console.error('Notification elements not found');
            return;
        }
        
        // 设置图标和样式
        const config = this.getTypeConfig(type);
        
        // 设置内容
        notificationIcon.className = `fa-solid ${config.icon} mr-2`;
        notificationMessage.textContent = message;
        
        // 设置样式
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 z-50 flex items-center ${config.bgColor} ${config.textColor}`;
        
        // 显示通知
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
        
        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hide();
            }, duration);
        }
    }
    
    // 隐藏通知
    static hide() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
        }
    }
    
    // 获取类型配置
    static getTypeConfig(type) {
        const configs = {
            success: {
                icon: 'fa-check-circle',
                bgColor: 'bg-green-500',
                textColor: 'text-white'
            },
            error: {
                icon: 'fa-times-circle',
                bgColor: 'bg-red-500',
                textColor: 'text-white'
            },
            warning: {
                icon: 'fa-exclamation-triangle',
                bgColor: 'bg-yellow-500',
                textColor: 'text-white'
            },
            info: {
                icon: 'fa-info-circle',
                bgColor: 'bg-blue-500',
                textColor: 'text-white'
            }
        };
        
        return configs[type] || configs.info;
    }
    
    // 显示成功通知
    static success(message, duration = 3000) {
        this.show('成功', message, 'success', duration);
    }
    
    // 显示错误通知
    static error(message, duration = 5000) {
        this.show('错误', message, 'error', duration);
    }
    
    // 显示警告通知
    static warning(message, duration = 4000) {
        this.show('警告', message, 'warning', duration);
    }
    
    // 显示信息通知
    static info(message, duration = 3000) {
        this.show('信息', message, 'info', duration);
    }
    
    // 队列通知 (用于批量显示)
    static queue(notifications) {
        notifications.forEach((notification, index) => {
            setTimeout(() => {
                this.show(notification.title, notification.message, notification.type, notification.duration);
            }, index * 500); // 每个通知间隔500ms
        });
    }
}