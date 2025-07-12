/**
 * Мобильная адаптация JavaScript
 * Обеспечивает корректную работу интерфейса на мобильных устройствах
 * Senior-level implementation
 */

class MobileResponsiveManager {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.mobileMenuToggle = null;
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.createMobileElements();
        this.setupEventListeners();
        this.handleOrientationChange();
        this.optimizeForTouch();
        this.handleResize();
    }
    
    createMobileElements() {
        // Создаем кнопку мобильного меню
        this.createMobileMenuToggle();
        
        // Создаем оверлей для мобильного меню
        this.createSidebarOverlay();
        
        // Находим существующую боковую панель
        this.sidebar = document.querySelector('.sidebar');
        
        // Добавляем специальные классы для мобильных устройств
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            if (this.isTouch) {
                document.body.classList.add('touch-device');
            }
        }
    }
    
    createMobileMenuToggle() {
        // Проверяем, не существует ли уже кнопка
        if (document.querySelector('.mobile-menu-toggle')) {
            return;
        }
        
        // Ищем хедер для размещения кнопки
        const header = document.querySelector('.header .d-flex');
        if (!header) {
            console.warn('Хедер не найден для размещения кнопки меню');
            return;
        }
        
        this.mobileMenuToggle = document.createElement('button');
        this.mobileMenuToggle.className = 'mobile-menu-toggle';
        this.mobileMenuToggle.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        this.mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
        this.mobileMenuToggle.style.display = this.isMobile ? 'block' : 'none';
        this.mobileMenuToggle.title = 'Меню';
        
        // Добавляем кнопку в хедер
        header.appendChild(this.mobileMenuToggle);
    }
    
    createSidebarOverlay() {
        // Проверяем, не существует ли уже оверлей
        if (document.querySelector('.sidebar-overlay')) {
            return;
        }
        
        this.sidebarOverlay = document.createElement('div');
        this.sidebarOverlay.className = 'sidebar-overlay';
        document.body.appendChild(this.sidebarOverlay);
    }
    
    setupEventListeners() {
        // Обработчик для кнопки мобильного меню
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        // Обработчик для оверлея
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Обработчик изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Обработчик клавиши ESC для закрытия меню
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Обработчик для предотвращения скролла при открытом меню
        document.addEventListener('touchmove', (e) => {
            if (this.isMenuOpen && !this.sidebar.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (!this.sidebar || !this.sidebarOverlay) return;
        
        this.sidebar.classList.add('show');
        this.sidebarOverlay.classList.add('show');
        this.mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
        this.mobileMenuToggle.setAttribute('aria-label', 'Закрыть меню');
        this.isMenuOpen = true;
        
        // Предотвращаем скролл страницы
        document.body.style.overflow = 'hidden';
        
        // Фокус на первый элемент меню
        const firstLink = this.sidebar.querySelector('a, button');
        if (firstLink) {
            firstLink.focus();
        }
    }
    
    closeMobileMenu() {
        if (!this.sidebar || !this.sidebarOverlay) return;
        
        this.sidebar.classList.remove('show');
        this.sidebarOverlay.classList.remove('show');
        this.mobileMenuToggle.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        this.mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
        this.isMenuOpen = false;
        
        // Восстанавливаем скролл страницы
        document.body.style.overflow = '';
        
        // Возвращаем фокус на кнопку меню
        this.mobileMenuToggle.focus();
    }
    
    handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        
        if (newIsMobile !== this.isMobile) {
            this.isMobile = newIsMobile;
            
            // Обновляем видимость кнопки меню
            if (this.mobileMenuToggle) {
                this.mobileMenuToggle.style.display = this.isMobile ? 'block' : 'none';
            }
            
            // Закрываем меню при переходе на десктоп
            if (!this.isMobile && this.isMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Обновляем классы body
            if (this.isMobile) {
                document.body.classList.add('mobile-device');
            } else {
                document.body.classList.remove('mobile-device');
            }
        }
        
        // Обновляем размеры элементов
        this.updateElementSizes();
    }
    
    handleOrientationChange() {
        // Закрываем меню при изменении ориентации
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Обновляем viewport height для мобильных браузеров
        if (this.isMobile) {
            this.updateViewportHeight();
        }
    }
    
    updateViewportHeight() {
        // Фиксируем проблему с высотой viewport в мобильных браузерах
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    optimizeForTouch() {
        if (!this.isTouch) return;
        
        // Улучшаем области касания для мелких элементов
        this.optimizeTouchTargets();
        
        // Оптимизируем скролл для мобильных устройств
        this.optimizeScrolling();
        
        // Улучшаем взаимодействие с формами
        this.optimizeForms();
    }
    
    optimizeTouchTargets() {
        const smallButtons = document.querySelectorAll('.btn-sm, .btn-xs');
        smallButtons.forEach(btn => {
            if (btn.offsetWidth < 44 || btn.offsetHeight < 44) {
                btn.style.minWidth = '44px';
                btn.style.minHeight = '44px';
                btn.style.display = 'inline-flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
            }
        });
        
        // Улучшаем checkbox'ы для выбора заметок
        const checkboxes = document.querySelectorAll('.note-selection-checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const wrapper = checkbox.closest('.note-selection-checkbox');
            if (wrapper) {
                wrapper.style.minWidth = '44px';
                wrapper.style.minHeight = '44px';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.justifyContent = 'center';
            }
        });
    }
    
    optimizeScrolling() {
        // Улучшаем производительность скролла
        const scrollableElements = document.querySelectorAll('.sidebar, .modal-body, .search-results');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
    }
    
    optimizeForms() {
        // Предотвращаем зум при фокусе на input
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.style.fontSize === '' || parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
        
        // Улучшаем работу с Quill редактором на мобильных
        this.optimizeQuillEditor();
    }
    
    optimizeQuillEditor() {
        const quillContainers = document.querySelectorAll('.ql-container');
        quillContainers.forEach(container => {
            const editor = container.querySelector('.ql-editor');
            if (editor) {
                editor.style.fontSize = '16px';
                editor.style.lineHeight = '1.4';
                
                // Улучшаем toolbar для мобильных
                const toolbar = container.previousElementSibling;
                if (toolbar && toolbar.classList.contains('ql-toolbar')) {
                    toolbar.style.flexWrap = 'wrap';
                    toolbar.style.gap = '5px';
                }
            }
        });
    }
    
    updateElementSizes() {
        // Обновляем размеры модальных окон
        const modals = document.querySelectorAll('.modal-dialog');
        modals.forEach(modal => {
            if (this.isMobile) {
                modal.style.margin = '10px';
                modal.style.maxWidth = 'calc(100% - 20px)';
            } else {
                modal.style.margin = '';
                modal.style.maxWidth = '';
            }
        });
    }
    
    // Утилиты для других скриптов
    static isMobileDevice() {
        return window.innerWidth <= 768;
    }
    
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    static addTouchClass(element) {
        if (MobileResponsiveManager.isTouchDevice()) {
            element.classList.add('touch-device');
        }
    }
    
    static optimizeImageLoading() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (MobileResponsiveManager.isMobileDevice()) {
                img.loading = 'lazy';
            }
        });
    }
}

// Инициализация при загрузке DOM
function initMobileResponsive() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.mobileResponsiveManager = new MobileResponsiveManager();
        });
    } else {
        window.mobileResponsiveManager = new MobileResponsiveManager();
    }
}

// Автоматическая инициализация
initMobileResponsive();

// Глобальная функция для кнопки меню
window.toggleMobileMenu = function() {
    if (window.mobileResponsiveManager) {
        window.mobileResponsiveManager.toggleMobileMenu();
    } else {
        console.warn('Mobile responsive manager not initialized');
    }
};

// Дополнительные утилиты для работы с мобильными устройствами
const MobileUtils = {
    // Проверка мобильного устройства
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    // Проверка планшета
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    // Проверка десктопа
    isDesktop() {
        return window.innerWidth > 1024;
    },
    
    // Проверка сенсорного устройства
    isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Получение размера экрана
    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    
    // Оптимизация производительности для мобильных
    optimizePerformance() {
        if (this.isMobile()) {
            // Уменьшаем частоту обновления анимаций
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
            
            // Отключаем hover эффекты на мобильных
            document.body.classList.add('no-hover');
        }
    },
    
    // Обработка виртуальной клавиатуры
    handleVirtualKeyboard() {
        if (this.isMobile()) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                // Предотвращаем изменение масштаба при появлении клавиатуры
                let viewportContent = viewport.getAttribute('content');
                if (!viewportContent.includes('user-scalable=no')) {
                    viewport.setAttribute('content', viewportContent + ', user-scalable=no');
                }
            }
        }
    }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MobileResponsiveManager, MobileUtils };
}

// Глобальная доступность
window.MobileResponsiveManager = MobileResponsiveManager;
window.MobileUtils = MobileUtils;
