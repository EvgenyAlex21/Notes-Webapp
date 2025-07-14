class MobileInitializer {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        try {
            
            if (typeof MobileResponsiveManager !== 'undefined') {
                window.mobileResponsiveManager = new MobileResponsiveManager();
                console.log('Mobile Responsive Manager initialized');
            }
            
            
            if (typeof AdvancedMobileFeatures !== 'undefined' && this.isMobile()) {
                window.advancedMobileFeatures = new AdvancedMobileFeatures();
                console.log('Advanced Mobile Features initialized');
            }
            
            
            this.setupGlobalFunctions();
            
            
            this.addMobileClasses();
            
            this.initialized = true;
            console.log('Mobile adaptation fully initialized');
            
        } catch (error) {
            console.error('Error initializing mobile components:', error);
        }
    }
    
    setupGlobalFunctions() {
        
        window.toggleMobileMenu = () => {
            if (window.mobileResponsiveManager && window.mobileResponsiveManager.toggleMobileMenu) {
                window.mobileResponsiveManager.toggleMobileMenu();
            } else {
                console.warn('Mobile menu function not available');
            }
        };
        
        
        window.showMobileToast = (message, type = 'info', duration = 3000) => {
            if (window.advancedMobileFeatures && window.advancedMobileFeatures.showMobileToast) {
                window.advancedMobileFeatures.showMobileToast(message, type, duration);
            } else {
                
                alert(message);
            }
        };
        
        
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
            
            
            if (this.isIOS()) {
                document.body.classList.add('ios-device');
            }
            
            
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


new MobileInitializer();


setTimeout(() => {
    if (!window.mobileResponsiveManager && window.innerWidth <= 768) {
        console.warn('Mobile manager not initialized, retrying...');
        new MobileInitializer();
    }
}, 1000);