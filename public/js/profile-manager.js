document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    
    initAvatar();
    
    initTheme();
    
    initPasswordStrength();
    
    initDeleteAccount();
    
    showSessionMessages();
});

function initFormValidation() {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const profileForm = document.getElementById('profile-form');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', debounce(function() {
            validateUsername(this.value);
        }, 500));
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', debounce(function() {
            validateEmail(this.value);
        }, 500));
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            let originalText = '';
            
            if (submitBtn) {
                originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Сохранение...';
            }
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    createNotification('Информация профиля успешно обновлена', 'success');
                } else {
                    createNotification(data.message || 'Ошибка при обновлении профиля', 'error');
                    
                    if (data.errors) {
                        Object.keys(data.errors).forEach(field => {
                            const input = document.getElementById(field);
                            const message = data.errors[field][0];
                            
                            if (input) {
                                const feedbackElement = document.getElementById(field + '-feedback') || createFeedbackElement(field);
                                setInvalidFeedback(input, feedbackElement, message);
                            }
                        });
                    }
                }
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            })
            .catch(error => {
                createNotification('Произошла ошибка при обновлении профиля', 'error');
                console.error('Ошибка:', error);
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        });
    }
}

/**
 * @param {string} username 
 */
function validateUsername(username) {
    const usernameInput = document.getElementById('username');
    const feedbackElement = document.getElementById('username-feedback') || createFeedbackElement('username');
    
    if (username.length < 3) {
        setInvalidFeedback(usernameInput, feedbackElement, 'Логин должен содержать минимум 3 символа');
        return;
    }
    
    if (username.length > 30) {
        setInvalidFeedback(usernameInput, feedbackElement, 'Логин не должен превышать 30 символов');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setInvalidFeedback(usernameInput, feedbackElement, 'Логин может содержать только буквы, цифры и символы подчеркивания');
        return;
    }
    
    const currentUserId = document.querySelector('meta[name="user-id"]')?.content;
    
    fetch(`/api/check-username?username=${encodeURIComponent(username)}&user_id=${currentUserId}`)
        .then(response => response.json())
        .then(data => {
            if (data.available) {
                setValidFeedback(usernameInput, feedbackElement, 'Логин доступен');
            } else {
                setInvalidFeedback(usernameInput, feedbackElement, 'Этот логин уже занят');
            }
        })
        .catch(() => {
            setInvalidFeedback(usernameInput, feedbackElement, 'Ошибка при проверке логина');
        });
}

/**
 * @param {string} email 
 */
function validateEmail(email) {
    const emailInput = document.getElementById('email');
    const feedbackElement = document.getElementById('email-feedback') || createFeedbackElement('email');
    
    if (!email) {
        setInvalidFeedback(emailInput, feedbackElement, 'Email обязателен для заполнения');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setInvalidFeedback(emailInput, feedbackElement, 'Введите корректный email адрес');
        return;
    }
    
    const currentUserId = document.querySelector('meta[name="user-id"]')?.content;
    
    fetch(`/api/check-email?email=${encodeURIComponent(email)}&user_id=${currentUserId}`)
        .then(response => response.json())
        .then(data => {
            if (data.available) {
                setValidFeedback(emailInput, feedbackElement, 'Email доступен');
            } else {
                setInvalidFeedback(emailInput, feedbackElement, 'Этот email уже зарегистрирован');
            }
        })
        .catch(() => {
            setInvalidFeedback(emailInput, feedbackElement, 'Ошибка при проверке email');
        });
}

function initAvatar() {
    const avatarFile = document.getElementById('avatar-file');
    const avatarImg = document.querySelector('.avatar');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    
    if (uploadAvatarBtn && avatarFile) {
        uploadAvatarBtn.addEventListener('click', function() {
            avatarFile.click();
        });
    }
    
    if (avatarFile && avatarImg) {
        avatarFile.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                if (!allowedTypes.includes(this.files[0].type)) {
                    createNotification('Неподдерживаемый формат файла. Разрешены: JPG, PNG, GIF', 'error');
                    return;
                }
                
                if (this.files[0].size > 5 * 1024 * 1024) {
                    createNotification('Размер файла не должен превышать 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarImg.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
                
                const formData = new FormData();
                formData.append('avatar', this.files[0]);
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
                formData.append('_method', 'PUT');
                
                const uploadNotification = createNotification('Загрузка аватара...', 'info');
                
                fetch('/profile', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    uploadNotification.remove();
                    if (data.success) {
                        createNotification('Аватар успешно обновлен', 'success');
                        if (data.avatar_url) {
                            avatarImg.src = data.avatar_url + '?t=' + Date.now()
                        }
                        setTimeout(() => location.reload(), 500);
                    } else {
                        createNotification(data.message || 'Ошибка при загрузке аватара', 'error');
                    }
                })
                .catch(error => {
                    uploadNotification.remove();
                    createNotification('Ошибка при загрузке аватара', 'error');
                    console.error('Ошибка:', error);
                });
            }
        });
    }
}

function initTheme() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const themePreferenceInput = document.getElementById('theme_preference');
    const themeForms = document.getElementById('preferences-form');
    
    if (themeOptions.length > 0 && themePreferenceInput) {
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                
                themeOptions.forEach(opt => {
                    opt.classList.remove('active');
                });
                
                this.classList.add('active');
                
                themePreferenceInput.value = theme;
                
                applyTheme(theme);
            });
        });
    }

    if (themeForms) {
        themeForms.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            let originalText = '';
            const submitBtn = this.querySelector('button[type="submit"]');
            
            if (submitBtn) {
                originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Сохранение...';
            }
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    createNotification('Настройки успешно обновлены', 'success');
                    
                    const theme = themePreferenceInput.value;
                    localStorage.setItem('theme', theme === 'auto' ? 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
                        theme);
                } else {
                    createNotification('Произошла ошибка при обновлении настроек', 'error');
                }
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            })
            .catch(() => {
                createNotification('Произошла ошибка при обновлении настроек', 'error');
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        });
    }
}

/**
 * @param {string} theme 
 */
function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
        
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => setTheme(e.matches ? 'dark' : 'light'));
    } else {
        setTheme(theme);
    }
}

function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const passwordConfirmation = document.getElementById('password_confirmation');
    const passwordForm = document.getElementById('password-form');
    
    if (passwordInput) {
        let strengthContainer = document.querySelector('.password-strength');
        
        if (!strengthContainer) {
            strengthContainer = document.createElement('div');
            strengthContainer.className = 'password-strength mt-2';
            strengthContainer.innerHTML = `
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <small class="text-muted mt-1 d-block">Сила пароля: <span class="strength-text">очень слабый</span></small>
            `;
            
            passwordInput.parentNode.insertAdjacentElement('afterend', strengthContainer);
        }
        
        passwordInput.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            updatePasswordStrengthUI(strength, strengthContainer);
            
            if (passwordConfirmation && passwordConfirmation.value) {
                validatePasswordMatch(this.value, passwordConfirmation.value);
            }
        });
    }
    
    if (passwordConfirmation && passwordInput) {
        passwordConfirmation.addEventListener('input', function() {
            validatePasswordMatch(passwordInput.value, this.value);
        });
    }
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!this.checkValidity()) {
                e.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            let originalText = '';
            
            if (submitBtn) {
                originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Сохранение...';
            }
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    createNotification('Пароль успешно изменен', 'success');
                    
                    this.reset();
                    
                    const progressBar = document.querySelector('.password-strength .progress-bar');
                    const strengthText = document.querySelector('.password-strength .strength-text');
                    if (progressBar && strengthText) {
                        progressBar.style.width = '0%';
                        progressBar.className = 'progress-bar';
                        strengthText.textContent = 'очень слабый';
                    }
                    
                    document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                        el.classList.remove('is-valid', 'is-invalid');
                    });
                    
                    document.querySelectorAll('.valid-feedback, .invalid-feedback').forEach(el => {
                        el.textContent = '';
                    });
                    
                } else {
                    createNotification(data.message || 'Ошибка при изменении пароля', 'error');
                    
                    if (data.errors) {
                        Object.keys(data.errors).forEach(field => {
                            const input = document.getElementById(field);
                            const message = data.errors[field][0];
                            
                            if (input) {
                                const feedbackElement = document.getElementById(field + '-feedback') || createFeedbackElement(field);
                                setInvalidFeedback(input, feedbackElement, message);
                            }
                        });
                    }
                }
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            })
            .catch(error => {
                createNotification('Произошла ошибка при изменении пароля', 'error');
                console.error('Ошибка:', error);
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        });
    }
}

/**
 * @param {string} password 
 * @returns {number} 
 */
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    let variations = 0;
    variations += /[a-z]/.test(password) ? 1 : 0;
    variations += /[A-Z]/.test(password) ? 1 : 0;
    variations += /[0-9]/.test(password) ? 1 : 0;
    variations += /[^A-Za-z0-9]/.test(password) ? 1 : 0;
    
    if (variations > 2) score += (variations - 2) * 5;
    
    return Math.min(100, score);
}

/**
 * @param {number} strength 
 * @param {HTMLElement} container 
 */
function updatePasswordStrengthUI(strength, container) {
    const progressBar = container.querySelector('.progress-bar');
    const strengthText = container.querySelector('.strength-text');
    
    progressBar.style.width = strength + '%';
    
    if (strength < 30) {
        progressBar.className = 'progress-bar bg-danger';
        strengthText.textContent = 'очень слабый';
    } else if (strength < 50) {
        progressBar.className = 'progress-bar bg-warning';
        strengthText.textContent = 'слабый';
    } else if (strength < 70) {
        progressBar.className = 'progress-bar bg-info';
        strengthText.textContent = 'средний';
    } else if (strength < 90) {
        progressBar.className = 'progress-bar bg-primary';
        strengthText.textContent = 'надёжный';
    } else {
        progressBar.className = 'progress-bar bg-success';
        strengthText.textContent = 'очень надёжный';
    }
}

/**
 * @param {string} password 
 * @param {string} confirmation 
 */
function validatePasswordMatch(password, confirmation) {
    const confirmInput = document.getElementById('password_confirmation');
    let feedbackElement = document.getElementById('confirmation-feedback');

    if (!feedbackElement) {
        feedbackElement = createFeedbackElement('password_confirmation');
    }
    
    if (password && confirmation && password !== confirmation) {
        setInvalidFeedback(confirmInput, feedbackElement, 'Пароли не совпадают');
    } else if (confirmation) {
        setValidFeedback(confirmInput, feedbackElement, 'Пароли совпадают');
    } else {
        confirmInput.classList.remove('is-invalid');
        confirmInput.classList.remove('is-valid');
        feedbackElement.textContent = '';
    }
}

/**
 * @param {HTMLElement} input 
 * @param {HTMLElement} feedback 
 * @param {string} message 
 */
function setInvalidFeedback(input, feedback, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    feedback.className = 'invalid-feedback d-block';
    feedback.textContent = message;
}

/**
 * @param {HTMLElement} input 
 * @param {HTMLElement} feedback 
 * @param {string} message 
 */
function setValidFeedback(input, feedback, message) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    feedback.className = 'valid-feedback d-block';
    feedback.textContent = message;
}

/**
 * @param {string} inputId 
 * @returns {HTMLElement}
 */
function createFeedbackElement(inputId) {
    const input = document.getElementById(inputId);
    
    let feedbackElement = document.getElementById(inputId + '-feedback');
    
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.id = inputId + '-feedback';
        input.parentNode.appendChild(feedbackElement);
    }
    
    return feedbackElement;
}

/**
 * @param {string} message 
 * @param {string} type 
 * @param {number} duration 
 * @returns {HTMLElement} 
 */
function createNotification(message, type = 'info', duration = 3000) {
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px'; 
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.maxHeight = '80vh';
        container.style.overflowY = 'auto';
        container.style.display = 'flex';
        container.style.flexDirection = 'column-reverse'; 
        document.body.appendChild(container);
    }
    
    let className = 'alert ';
    switch(type) {
        case 'success': className += 'alert-success'; break;
        case 'error': className += 'alert-danger'; break;
        case 'warning': className += 'alert-warning'; break;
        default: className += 'alert-info';
    }
    
    const notification = document.createElement('div');
    notification.className = className + ' alert-dismissible fade show';
    notification.style.marginTop = '10px'; 
    notification.style.marginBottom = '0'; 
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    const closeButton = notification.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideNotification(notification);
        });
    }
    
    if (duration > 0) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
    
    return notification;
}

function hideNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}

function showSessionMessages() {
    const statusMessage = document.querySelector('meta[name="status-message"]')?.content;
    const errorMessage = document.querySelector('meta[name="error-message"]')?.content;
    
    if (statusMessage) {
        createNotification(statusMessage, 'success');
    }
    
    if (errorMessage) {
        createNotification(errorMessage, 'error');
    }
}

function initDeleteAccount() {
    const deleteBtn = document.getElementById('delete-account-btn');
    if (!deleteBtn) return;
    
    deleteBtn.addEventListener('click', function() {
        const form = document.getElementById('deleteAccountForm');
        const passwordInput = document.getElementById('confirm_password');
        
        if (!passwordInput.value.trim()) {
            showPasswordError('Пожалуйста, введите пароль для подтверждения');
            return;
        }
        
        const formData = new FormData(form);
        
        let originalText = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Удаление...';
        
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect || '/login';
            } else {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = originalText;
                
                showPasswordError(data.message || 'Неверный пароль');
            }
        })
        .catch(error => {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
            
            showPasswordError('Произошла ошибка при удалении аккаунта');
            console.error('Ошибка:', error);
        });
    });
    
    function showPasswordError(message) {
        const errorContainer = document.getElementById('password-error-message') || createErrorElement();
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    
    function createErrorElement() {
        const passwordField = document.getElementById('confirm_password').parentNode;
        const errorElement = document.createElement('div');
        errorElement.id = 'password-error-message';
        errorElement.className = 'text-danger mt-2';
        passwordField.parentNode.appendChild(errorElement);
        return errorElement;
    }
}

/**
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}