// Main JavaScript for 小小读书郎

// Service Worker Registration (if needed in future)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        // Future PWA implementation
    });
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Utility functions
const utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check if device is mobile
    isMobile() {
        return window.innerWidth <= 768;
    },

    // Show toast notification
    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Format Chinese text for better display
    formatChineseText(text) {
        return text.replace(/，/g, '，\u200B').replace(/。/g, '。\u200B');
    }
};

// Performance monitoring
const performance = {
    init() {
        if ('PerformanceObserver' in window) {
            // Monitor largest contentful paint
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        }
    },

    // Track page load time
    trackPageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
            }, 0);
        });
    }
};

// Accessibility enhancements
const a11y = {
    init() {
        this.addKeyboardNavigation();
        this.improveScreenReaderSupport();
    },

    addKeyboardNavigation() {
        // Focus management for modals
        document.addEventListener('shown.bs.modal', (e) => {
            const modal = e.target;
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        });
    },

    improveScreenReaderSupport() {
        // Add aria labels to interactive elements
        document.querySelectorAll('.clickable-char').forEach(char => {
            char.setAttribute('role', 'button');
            char.setAttribute('aria-label', `查看汉字 ${char.textContent} 的详细信息`);
            char.setAttribute('tabindex', '0');
            
            // Support keyboard activation
            char.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    char.click();
                }
            });
        });
    }
};

// Theme management (for future dark mode)
const theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },

    setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        this.setTheme(current === 'light' ? 'dark' : 'light');
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    performance.init();
    performance.trackPageLoad();
    a11y.init();
    theme.init();

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Lazy load images if any
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Export utils for use in other scripts
window.XiaoDaoDeUtils = utils;