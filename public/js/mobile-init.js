/**
 * Инициализация мобильной адаптации
 * Гарантирует правильную инициализацию всех компонентов
 */

class MobileInitializer {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        // Проверяем готовность DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        try {
            // Инициализируем базовые мобильные функции
            if (typeof MobileResponsiveManager !== 'undefined') {
                window.mobileResponsiveManager = new MobileResponsiveManager();
                console.log('✅ Mobile Responsive Manager initialized');
            }
            
            // Инициализируем продвинутые мобильные функции
            if (typeof AdvancedMobileFeatures !== 'undefined' && this.isMobile()) {
                window.advancedMobileFeatures = new AdvancedMobileFeatures();
                console.log('✅ Advanced Mobile Features initialized');
            }
            
            // Настраиваем глобальные функции
            this.setupGlobalFunctions();
            
            // Добавляем мобильные классы
            this.addMobileClasses();
            
            this.initialized = true;
            console.log('✅ Mobile adaptation fully initialized');
            
        } catch (error) {
            console.error('❌ Error initializing mobile components:', error);
        }
    }
    
    setupGlobalFunctions() {
        // Глобальная функция для меню
        window.toggleMobileMenu = () => {
            if (window.mobileResponsiveManager && window.mobileResponsiveManager.toggleMobileMenu) {
                window.mobileResponsiveManager.toggleMobileMenu();
            } else {
                console.warn('Mobile menu function not available');
            }
        };
        
        // Глобальная функция для toast уведомлений
        window.showMobileToast = (message, type = 'info', duration = 3000) => {
            if (window.advancedMobileFeatures && window.advancedMobileFeatures.showMobileToast) {
                window.advancedMobileFeatures.showMobileToast(message, type, duration);
            } else {
                // Fallback
                alert(message);
            }
        };
        
        // Функция для проверки мобильного устройства
        window.isMobileDevice = () => {
            return window.innerWidth <= 768;
        };
    }
    
    addMobileClasses() {
        if (this.isMobile()) {
            document.body.classList.add('mobile-device');
            
            if (this.isTouch()) {
                document.body.classList.add('touch-device');
            }
            
            // Добавляем класс для iOS
            if (this.isIOS()) {
                document.body.classList.add('ios-device');
            }
            
            // Добавляем класс для Android
            if (this.isAndroid()) {
                document.body.classList.add('android-device');
            }
        }
    }
    
    isMobile() {
        return window.innerWidth <= 768;
    }
    
    isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
    
    isAndroid() {
        return /Android/.test(navigator.userAgent);
    }
}

// Создаем экземпляр инициализатора
new MobileInitializer();

// Дополнительная проверка через некоторое время
setTimeout(() => {
    if (!window.mobileResponsiveManager && window.innerWidth <= 768) {
        console.warn('⚠️ Mobile manager not initialized, retrying...');
        new MobileInitializer();
    }
}, 1000);
