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
        
        this.createMobileMenuToggle();
        
        
        this.createSidebarOverlay();
        
        
        this.sidebar = document.querySelector('.sidebar');
        
        
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            if (this.isTouch) {
                document.body.classList.add('touch-device');
            }
        }
    }
    
    createMobileMenuToggle() {
        
        if (document.querySelector('.mobile-menu-toggle')) {
            return;
        }
        
        
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
        
        
        header.appendChild(this.mobileMenuToggle);
    }
    
    createSidebarOverlay() {
        
        if (document.querySelector('.sidebar-overlay')) {
            return;
        }
        
        this.sidebarOverlay = document.createElement('div');
        this.sidebarOverlay.className = 'sidebar-overlay';
        document.body.appendChild(this.sidebarOverlay);
    }
    
    setupEventListeners() {
        
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        
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
        
        
        document.body.style.overflow = 'hidden';
        
        
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
        
        
        document.body.style.overflow = '';
        
        
        this.mobileMenuToggle.focus();
    }
    
    handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        
        if (newIsMobile !== this.isMobile) {
            this.isMobile = newIsMobile;
            
            
            if (this.mobileMenuToggle) {
                this.mobileMenuToggle.style.display = this.isMobile ? 'block' : 'none';
            }
            
            
            if (!this.isMobile && this.isMenuOpen) {
                this.closeMobileMenu();
            }
            
            
            if (this.isMobile) {
                document.body.classList.add('mobile-device');
            } else {
                document.body.classList.remove('mobile-device');
            }
        }
        
        
        this.updateElementSizes();
    }
    
    handleOrientationChange() {
        
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        
        if (this.isMobile) {
            this.updateViewportHeight();
        }
    }
    
    updateViewportHeight() {
        
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    optimizeForTouch() {
        if (!this.isTouch) return;
        
        
        this.optimizeTouchTargets();
        
        
        this.optimizeScrolling();
        
        
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
        
        const scrollableElements = document.querySelectorAll('.sidebar, .modal-body, .search-results');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
    }
    
    optimizeForms() {
        
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.style.fontSize === '' || parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
        
        
        this.optimizeQuillEditor();
    }
    
    optimizeQuillEditor() {
        const quillContainers = document.querySelectorAll('.ql-container');
        quillContainers.forEach(container => {
            const editor = container.querySelector('.ql-editor');
            if (editor) {
                editor.style.fontSize = '16px';
                editor.style.lineHeight = '1.4';
                
                
                const toolbar = container.previousElementSibling;
                if (toolbar && toolbar.classList.contains('ql-toolbar')) {
                    toolbar.style.flexWrap = 'wrap';
                    toolbar.style.gap = '5px';
                }
            }
        });
    }
    
    updateElementSizes() {
        
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


function initMobileResponsive() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.mobileResponsiveManager = new MobileResponsiveManager();
        });
    } else {
        window.mobileResponsiveManager = new MobileResponsiveManager();
    }
}


initMobileResponsive();


window.toggleMobileMenu = function() {
    if (window.mobileResponsiveManager) {
        window.mobileResponsiveManager.toggleMobileMenu();
    } else {
        console.warn('Mobile responsive manager not initialized');
    }
};


const MobileUtils = {
    
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    
    isDesktop() {
        return window.innerWidth > 1024;
    },
    
    
    isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    
    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    
    
    optimizePerformance() {
        if (this.isMobile()) {
            
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
            
            
            document.body.classList.add('no-hover');
        }
    },
    
    
    handleVirtualKeyboard() {
        if (this.isMobile()) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                
                let viewportContent = viewport.getAttribute('content');
                if (!viewportContent.includes('user-scalable=no')) {
                    viewport.setAttribute('content', viewportContent + ', user-scalable=no');
                }
            }
        }
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MobileResponsiveManager, MobileUtils };
}


window.MobileResponsiveManager = MobileResponsiveManager;
window.MobileUtils = MobileUtils;
