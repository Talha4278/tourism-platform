// API Configuration and utilities
const API_BASE_URL = CONFIG.BACKEND.API_BASE_URL;

class API {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: this.getHeaders(),
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Tour endpoints
    async getTours(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                queryParams.append(key, filters[key]);
            }
        });
        
        const queryString = queryParams.toString();
        return this.request(`/tours${queryString ? '?' + queryString : ''}`);
    }

    async getTour(id) {
        return this.request(`/tours/${id}`);
    }

    async getMyTours() {
        return this.request('/tours/agency');
    }

    async createTour(tourData) {
        return this.request('/tours', {
            method: 'POST',
            body: JSON.stringify(tourData),
        });
    }

    async updateTour(id, tourData) {
        return this.request(`/tours/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tourData),
        });
    }

    async deleteTour(id) {
        return this.request(`/tours/${id}`, {
            method: 'DELETE',
        });
    }

    async getPopularTours() {
        return this.request('/tours/popular');
    }

    async getDestinations() {
        return this.request('/tours/destinations');
    }

    // Booking endpoints
    async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    }

    async getMyBookings() {
        return this.request('/bookings');
    }

    async getAgencyBookings() {
        return this.request('/bookings');
    }

    async updateBookingStatus(id, status) {
        return this.request(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    async getBookingStats() {
        return this.request('/bookings/stats');
    }

    async getRecentBookings(limit = 10) {
        return this.request(`/bookings/recent?limit=${limit}`);
    }

    // Review endpoints
    async createReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    async getTourReviews(tourId) {
        return this.request(`/reviews/tour/${tourId}`);
    }

    async getMyReviews() {
        return this.request('/reviews/my-reviews');
    }

    async updateReview(id, reviewData) {
        return this.request(`/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
    }

    async deleteReview(id) {
        return this.request(`/reviews/${id}`, {
            method: 'DELETE',
        });
    }
}

// Create global API instance
const api = new API();

// Utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.main-content');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Form validation utilities
function validateRequired(fields) {
    let isValid = true;
    const errors = {};

    fields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element ? element.value.trim() : '';
        
        if (!value && field.required) {
            errors[field.id] = field.message || `${field.label || field.id} is required`;
            isValid = false;
        } else if (field.type === 'email' && value && !isValidEmail(value)) {
            errors[field.id] = 'Please enter a valid email address';
            isValid = false;
        } else if (field.type === 'number' && value && (isNaN(value) || parseFloat(value) < 0)) {
            errors[field.id] = 'Please enter a valid number';
            isValid = false;
        }
    });

    return { isValid, errors };
}

function displayFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Display new errors
    Object.keys(errors).forEach(fieldId => {
        const errorElement = document.querySelector(`#${fieldId} + .error-message`);
        if (errorElement) {
            errorElement.textContent = errors[fieldId];
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Loading states
function showLoading(container, message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="spinner"></div>
        <p>${message}</p>
    `;
    
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        container.innerHTML = '';
        container.appendChild(loadingDiv);
    }
}

function showEmptyState(container, icon, title, description, actionButton = null) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${description}</p>
        ${actionButton || ''}
    `;
    
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        container.innerHTML = '';
        container.appendChild(emptyDiv);
    }
}