// Main application functionality and page routing
class App {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Initialize the application
        this.setupEventListeners();
        this.checkInitialRoute();
        
        // Load initial data
        this.loadInitialData();
    }

    setupEventListeners() {
        // Mobile menu toggle
        document.addEventListener('click', (event) => {
            if (event.target.closest('.nav-toggle')) {
                this.toggleMobileMenu();
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                const modalId = event.target.id;
                if (modalId === 'authModal') closeAuthModal();
                if (modalId === 'tourModal') closeTourModal();
                if (modalId === 'createTourModal') closeCreateTourModal();
                if (modalId === 'reviewModal') closeReviewModal();
            }
        });

        // Handle escape key for modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal.active');
                activeModals.forEach(modal => {
                    if (modal.id === 'authModal') closeAuthModal();
                    if (modal.id === 'tourModal') closeTourModal();
                    if (modal.id === 'createTourModal') closeCreateTourModal();
                    if (modal.id === 'reviewModal') closeReviewModal();
                });
            }
        });
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        navMenu.classList.toggle('active');
    }

    checkInitialRoute() {
        // Simple client-side routing based on hash
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(`${hash}-page`)) {
            this.showPage(hash);
        } else {
            this.showPage('home');
        }
    }

    async loadInitialData() {
        try {
            // Load popular tours for home page
            await tourManager.loadPopularTours();
            
            // Load destinations for filters
            await tourManager.loadDestinations();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            
            // Update URL hash
            window.location.hash = pageName;
            
            // Update navigation active state
            this.updateNavigation();
            
            // Load page-specific data
            this.loadPageData(pageName);
        }
        
        // Close mobile menu if open
        const navMenu = document.getElementById('navMenu');
        navMenu.classList.remove('active');
    }

    updateNavigation() {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        const currentLink = document.querySelector(`[onclick="showPage('${this.currentPage}')"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    async loadPageData(pageName) {
        try {
            switch (pageName) {
                case 'home':
                    await tourManager.loadPopularTours();
                    break;
                    
                case 'tours':
                    await tourManager.loadTours();
                    break;
                    
                case 'manage-tours':
                    if (auth.currentUser?.userType === 'agency') {
                        await tourManager.loadMyTours();
                    }
                    break;
                    
                case 'my-bookings':
                    console.log('Loading My Bookings page...');
                    console.log('Current user:', auth.currentUser);
                    if (auth.currentUser?.userType === 'tourist') {
                        console.log('Loading tourist bookings...');
                        await bookingManager.loadMyBookings();
                    } else if (auth.currentUser?.userType === 'agency') {
                        console.log('Loading agency bookings...');
                        await bookingManager.loadAgencyBookings();
                    } else {
                        console.log('No valid user type for bookings');
                    }
                    break;
                    
                case 'reports':
                    if (auth.currentUser?.userType === 'agency') {
                        await bookingManager.loadBookingStats();
                        await bookingManager.loadRecentBookings();
                    }
                    break;
                    
                case 'profile':
                    // Profile data is loaded by auth manager
                    break;
                    
                default:
                    break;
            }
        } catch (error) {
            console.error(`Failed to load data for page ${pageName}:`, error);
        }
    }
}

// Initialize the application
const app = new App();

// Global functions for HTML onclick handlers
function showPage(pageName) {
    app.showPage(pageName);
}

function toggleMobileMenu() {
    app.toggleMobileMenu();
}

// Page load event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth manager after all global functions are available
    auth.init();
    
    console.log('🌟 TourConnect Tourism Platform loaded successfully!');
    
    // Show welcome message for new users
    setTimeout(() => {
        if (!localStorage.getItem('welcomeShown')) {
            showAlert('Welcome to TourConnect! Discover amazing travel experiences.', 'info');
            localStorage.setItem('welcomeShown', 'true');
        }
    }, 1000);
});

// Handle browser back/forward navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && hash !== app.currentPage) {
        app.showPage(hash);
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    showAlert('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    showAlert('You are currently offline. Some features may not be available.', 'warning');
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showAlert('An unexpected error occurred. Please try again.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showAlert('An unexpected error occurred. Please try again.', 'error');
    event.preventDefault();
});