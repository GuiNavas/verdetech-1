// Sistema de Notificações Toast
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Criar container de notificações se não existir
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 350px;
            word-wrap: break-word;
            position: relative;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid ${this.getBorderColor(type)};
        `;

        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}" style="font-size: 18px;"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; margin-left: auto; font-size: 18px;">
                    ×
                </button>
            </div>
        `;

        this.container.appendChild(notification);

        // Auto remove após duração especificada
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);

        return notification;
    }

    getBackgroundColor(type) {
        const colors = {
            'success': '#4CAF50',
            'error': '#F44336',
            'warning': '#FF9800',
            'info': '#2196F3'
        };
        return colors[type] || colors['info'];
    }

    getBorderColor(type) {
        const colors = {
            'success': '#2E7D32',
            'error': '#D32F2F',
            'warning': '#F57C00',
            'info': '#1976D2'
        };
        return colors[type] || colors['info'];
    }

    getIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons['info'];
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Adicionar estilos CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Instância global
window.notifications = new NotificationSystem();

