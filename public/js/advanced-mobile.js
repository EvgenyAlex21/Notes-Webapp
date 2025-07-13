class AdvancedMobileFeatures {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isSwipeActive = false;
        this.pullStartY = 0;
        this.pullCurrentY = 0;
        this.isPulling = false;
        this.pullThreshold = 80;
        
        this.init();
    }
    
    init() {
        if (MobileUtils.isMobile()) {
            this.initSwipeGestures();
            this.initPullToRefresh();
            this.initBottomNavigation();
            this.initFAB();
            this.initHapticFeedback();
            this.initMobileSearch();
        }
    }
    
    
    initSwipeGestures() {
        const noteItems = document.querySelectorAll('.note-item');
        
        noteItems.forEach(note => {
            note.classList.add('note-item-swipeable');
            
            
            const actionsPanel = document.createElement('div');
            actionsPanel.className = 'note-swipe-actions';
            actionsPanel.innerHTML = `
                <button class="note-swipe-action delete-action" data-action="delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="note-swipe-action archive-action" data-action="archive">
                    <i class="fas fa-archive"></i>
                </button>
                <button class="note-swipe-action edit-action" data-action="edit">
                    <i class="fas fa-edit"></i>
                </button>
            `;
            note.appendChild(actionsPanel);
            
            let startX, currentX, deltaX;
            let isScrolling = false;
            
            note.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                currentX = startX;
                isScrolling = false;
            }, { passive: true });
            
            note.addEventListener('touchmove', (e) => {
                if (isScrolling) return;
                
                currentX = e.touches[0].clientX;
                deltaX = startX - currentX;
                
                
                const deltaY = Math.abs(e.touches[0].clientY - e.touches[0].clientY);
                if (deltaY > Math.abs(deltaX)) {
                    isScrolling = true;
                    return;
                }
                
                if (deltaX > 20) { 
                    e.preventDefault();
                    const progress = Math.min(deltaX / 100, 1);
                    note.style.transform = `translateX(-${deltaX}px)`;
                    actionsPanel.style.right = `${-100 + (progress * 100)}%`;
                }
            }, { passive: false });
            
            note.addEventListener('touchend', () => {
                if (isScrolling) return;
                
                if (deltaX > 80) {
                    
                    note.style.transform = 'translateX(-100px)';
                    actionsPanel.classList.add('active');
                    this.triggerHaptic('medium');
                } else {
                    
                    note.style.transform = 'translateX(0)';
                    actionsPanel.classList.remove('active');
                }
            });
            
            
            actionsPanel.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]');
                if (action) {
                    const actionType = action.dataset.action;
                    const noteId = note.dataset.noteId;
                    this.handleSwipeAction(actionType, noteId, note);
                    this.triggerHaptic('heavy');
                }
            });
        });
    }
    
    handleSwipeAction(action, noteId, noteElement) {
        switch (action) {
            case 'delete':
                this.showDeleteConfirmation(noteId, noteElement);
                break;
            case 'archive':
                this.archiveNote(noteId, noteElement);
                break;
            case 'edit':
                window.location.href = `/notes/${noteId}/edit`;
                break;
        }
        
        
        noteElement.style.transform = 'translateX(0)';
        noteElement.querySelector('.note-swipe-actions').classList.remove('active');
    }
    
    
    initPullToRefresh() {
        const container = document.querySelector('.notes-container') || document.body;
        
        
        const indicator = document.createElement('div');
        indicator.className = 'pull-refresh-indicator';
        indicator.innerHTML = '<div class="pull-refresh-spinner"></div>';
        container.parentNode.insertBefore(indicator, container);
        
        let startY, currentY, deltaY;
        let isPulling = false;
        
        container.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            if (!isPulling || window.scrollY > 0) return;
            
            currentY = e.touches[0].clientY;
            deltaY = currentY - startY;
            
            if (deltaY > 0) {
                e.preventDefault();
                const progress = Math.min(deltaY / this.pullThreshold, 1);
                
                
                indicator.style.top = `${-60 + (progress * 80)}px`;
                indicator.style.opacity = progress;
                
                if (progress >= 1) {
                    indicator.classList.add('active');
                    this.triggerHaptic('light');
                }
            }
        }, { passive: false });
        
        container.addEventListener('touchend', () => {
            if (!isPulling) return;
            
            if (deltaY >= this.pullThreshold) {
                this.performRefresh(indicator);
            } else {
                this.resetPullIndicator(indicator);
            }
            
            isPulling = false;
            deltaY = 0;
        });
    }
    
    performRefresh(indicator) {
        indicator.classList.add('active');
        
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
    
    resetPullIndicator(indicator) {
        indicator.style.top = '-60px';
        indicator.style.opacity = '0';
        indicator.classList.remove('active');
    }
    
    
    initBottomNavigation() {
        
        if (document.querySelector('.mobile-bottom-nav')) return;
        
        const currentPath = window.location.pathname;
        
        
        const foldersExist = document.querySelector('#folders-list') && 
                           document.querySelector('#folders-list').children.length > 0;
        
        const nav = document.createElement('div');
        nav.className = 'mobile-bottom-nav';
        
        
        let navItems = `
            <a href="/notes" class="nav-item ${(currentPath === '/notes' || currentPath === '/' || (currentPath.includes('/notes') && !currentPath.includes('archive') && !currentPath.includes('trash') && !currentPath.includes('calendar') && !currentPath.includes('folder'))) ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span>Главная</span>
            </a>`;
        
        
        if (foldersExist) {
            navItems += `
            <a href="#" class="nav-item folders-nav" onclick="toggleMobileFolders(event)">
                <i class="fas fa-folder"></i>
                <span>Папки</span>
            </a>`;
        }
        
        
        navItems += `
            <a href="/notes/archive" class="nav-item ${currentPath.includes('archive') ? 'active' : ''}">
                <i class="fas fa-archive"></i>
                <span>Архив</span>
            </a>
            <a href="/notes/trash" class="nav-item ${currentPath.includes('trash') ? 'active' : ''}">
                <i class="fas fa-trash"></i>
                <span>Корзина</span>
            </a>
            <a href="/notes/calendar" class="nav-item ${currentPath.includes('calendar') ? 'active' : ''}">
                <i class="fas fa-calendar"></i>
                <span>Календарь</span>
            </a>`;
        
        nav.innerHTML = navItems;
        document.body.appendChild(nav);
        
        
        document.body.style.paddingBottom = '80px';
    }
    
    
    initFAB() {
        if (window.location.pathname === '/notes/create') return;
        
        const fab = document.createElement('button');
        fab.className = 'fab-create-note';
        fab.innerHTML = '<i class="fas fa-plus"></i>';
        fab.addEventListener('click', () => {
            window.location.href = '/notes/create';
        });
        
        document.body.appendChild(fab);
    }
    
    
    initHapticFeedback() {
        
        document.querySelectorAll('.btn, .note-item, .sidebar-link').forEach(el => {
            el.classList.add('haptic-light');
        });
        
        document.querySelectorAll('.btn-primary, .btn-danger').forEach(el => {
            el.classList.add('haptic-medium');
        });
    }
    
    triggerHaptic(intensity = 'light') {
        
        if ('vibrator' in navigator || 'vibrate' in navigator) {
            let pattern;
            switch (intensity) {
                case 'light':
                    pattern = [10];
                    break;
                case 'medium':
                    pattern = [20];
                    break;
                case 'heavy':
                    pattern = [30];
                    break;
                default:
                    pattern = [10];
            }
            navigator.vibrate && navigator.vibrate(pattern);
        }
    }
    
    
    initMobileSearch() {
        const searchInput = document.querySelector('#search-notes');
        if (!searchInput) return;
        
        searchInput.addEventListener('focus', () => {
            this.openMobileSearch();
        });
    }
    
    openMobileSearch() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-search-overlay';
        overlay.innerHTML = `
            <div class="mobile-search-header">
                <button class="btn btn-link" onclick="this.closest('.mobile-search-overlay').remove()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <input type="text" class="mobile-search-input" placeholder="Поиск заметок..." autofocus>
                <button class="btn btn-link" onclick="this.previousElementSibling.value = ''">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mobile-search-results"></div>
        `;
        
        document.body.appendChild(overlay);
        
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        
        const input = overlay.querySelector('.mobile-search-input');
        const results = overlay.querySelector('.mobile-search-results');
        
        input.addEventListener('input', (e) => {
            this.performMobileSearch(e.target.value, results);
        });
    }
    
    performMobileSearch(query, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        
        
        resultsContainer.innerHTML = `
            <div class="mobile-loading-skeleton skeleton-text large"></div>
            <div class="mobile-loading-skeleton skeleton-text"></div>
            <div class="mobile-loading-skeleton skeleton-text small"></div>
        `;
        
        setTimeout(() => {
            resultsContainer.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <h6>Результат поиска 1</h6>
                        <p class="mb-0 text-muted">Описание результата...</p>
                    </div>
                </div>
            `;
        }, 500);
    }
    
    
    showMobileToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `mobile-toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
    
    getToastIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'times-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    
    showDeleteConfirmation(noteId, noteElement) {
        const modal = document.createElement('div');
        modal.className = 'mobile-dropdown active';
        modal.innerHTML = `
            <div class="mobile-dropdown-handle"></div>
            <div class="mobile-dropdown-header">
                <h5>Удалить заметку?</h5>
                <button class="btn btn-link" onclick="this.closest('.mobile-dropdown').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-3">
                <p>Эта заметка будет перемещена в корзину.</p>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-danger flex-fill" onclick="this.deleteNote('${noteId}', this.closest('.mobile-dropdown'))">
                        Удалить
                    </button>
                    <button class="btn btn-secondary flex-fill" onclick="this.closest('.mobile-dropdown').remove()">
                        Отмена
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}


function toggleMobileFolders(event) {
    event.preventDefault();
    
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('show');
        overlay.classList.add('show');
        
        
        setTimeout(() => {
            const foldersSection = document.querySelector('#folders-list');
            if (foldersSection) {
                foldersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }
}


window.toggleMobileFolders = toggleMobileFolders;


window.toggleMobileMenu = function() {
    if (window.mobileResponsiveManager) {
        window.mobileResponsiveManager.toggleMobileMenu();
    } else {
        console.warn('Mobile responsive manager not initialized');
    }
};

window.showMobileToast = function(message, type, duration) {
    if (window.advancedMobileFeatures) {
        window.advancedMobileFeatures.showMobileToast(message, type, duration);
    } else {
        console.warn('Advanced mobile features not initialized');
    }
};


document.addEventListener('DOMContentLoaded', () => {
    if (MobileUtils && MobileUtils.isMobile()) {
        window.advancedMobileFeatures = new AdvancedMobileFeatures();
    }
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMobileFeatures;
}

window.AdvancedMobileFeatures = AdvancedMobileFeatures;
