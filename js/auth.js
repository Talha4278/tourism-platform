// Authentication management
class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    init() {
        // Check if user is logged in on page load
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleUpdateProfile.bind(this));
        }
    }

    async checkAuthStatus() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.handleLogout(false);
                return;
            }

            api.setToken(token);
            const response = await api.getProfile();
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.updateUI();
            } else {
                this.handleLogout(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.handleLogout(false);
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validate required fields
        const validation = validateRequired([
            { id: 'loginEmail', required: true, type: 'email', label: 'Email' },
            { id: 'loginPassword', required: true, label: 'Password' }
        ]);

        if (!validation.isValid) {
            displayFormErrors(validation.errors);
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            const response = await api.login({ email, password });

            if (response.success) {
                this.currentUser = response.data.user;
                api.setToken(response.data.token);
                
                this.updateUI();
                closeAuthModal();
                showAlert('Login successful!', 'success');
                
                // Redirect based on user type
                if (this.currentUser.user_type === 'agency') {
                    showPage('manage-tours');
                } else {
                    showPage('tours');
                }
            }
        } catch (error) {
            showAlert(error.message || 'Login failed', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            phone: document.getElementById('registerPhone').value,
            user_type: document.getElementById('userType').value,
            agency_name: document.getElementById('registerAgencyName')?.value,
            agency_description: document.getElementById('registerAgencyDescription')?.value,
        };

        // Validate required fields
        const requiredFields = [
            { id: 'registerName', required: true, label: 'Name' },
            { id: 'registerEmail', required: true, type: 'email', label: 'Email' },
            { id: 'registerPassword', required: true, label: 'Password' },
            { id: 'userType', required: true, label: 'Account Type' }
        ];

        if (formData.user_type === 'agency') {
            requiredFields.push({ id: 'registerAgencyName', required: true, label: 'Agency Name' });
        }

        const validation = validateRequired(requiredFields);

        // Additional password validation
        if (formData.password && formData.password.length < 6) {
            validation.isValid = false;
            validation.errors.registerPassword = 'Password must be at least 6 characters long';
        }

        if (!validation.isValid) {
            displayFormErrors(validation.errors);
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            const response = await api.register(formData);

            if (response.success) {
                this.currentUser = response.data.user;
                api.setToken(response.data.token);
                
                this.updateUI();
                closeAuthModal();
                showAlert('Account created successfully!', 'success');
                
                // Redirect based on user type
                if (this.currentUser.user_type === 'agency') {
                    showPage('manage-tours');
                } else {
                    showPage('tours');
                }
            }
        } catch (error) {
            showAlert(error.message || 'Registration failed', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    }

    async handleUpdateProfile(event) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
        };

        // Add agency fields if applicable
        if (this.currentUser.user_type === 'agency') {
            formData.agency_name = document.getElementById('agencyName')?.value;
            formData.agency_description = document.getElementById('agencyDescription')?.value;
            formData.agency_services = document.getElementById('agencyServices')?.value;
        }

        // Validate required fields
        const requiredFields = [
            { id: 'profileName', required: true, label: 'Name' }
        ];

        if (this.currentUser.user_type === 'agency') {
            requiredFields.push({ id: 'agencyName', required: true, label: 'Agency Name' });
        }

        const validation = validateRequired(requiredFields);

        if (!validation.isValid) {
            displayFormErrors(validation.errors);
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            const response = await api.updateProfile(formData);

            if (response.success) {
                this.currentUser = response.data.user;
                this.updateUI();
                showAlert('Profile updated successfully!', 'success');
            }
        } catch (error) {
            showAlert(error.message || 'Profile update failed', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Profile';
        }
    }

    handleLogout(showMessage = true) {
        this.currentUser = null;
        api.setToken(null);
        this.updateUI();
        
        if (showMessage) {
            showAlert('Logged out successfully', 'info');
        }
        
        showPage('home');
    }

    updateUI() {
        const isLoggedIn = !!this.currentUser;
        const isAgency = this.currentUser?.user_type === 'agency';
        const isTourist = this.currentUser?.user_type === 'tourist';

        // Update navigation
        document.getElementById('loginLink').style.display = isLoggedIn ? 'none' : 'block';
        document.getElementById('registerLink').style.display = isLoggedIn ? 'none' : 'block';
        document.getElementById('logoutLink').style.display = isLoggedIn ? 'block' : 'none';
        document.getElementById('profileLink').style.display = isLoggedIn ? 'block' : 'none';
        document.getElementById('reportsLink').style.display = isAgency ? 'block' : 'none';

        // Update role-based navigation
        document.querySelectorAll('.agency-only').forEach(el => {
            el.style.display = isAgency ? 'block' : 'none';
        });

        document.querySelectorAll('.tourist-only').forEach(el => {
            el.style.display = isTourist ? 'block' : 'none';
        });

        // Update profile form
        this.updateProfileForm();
    }

    updateProfileForm() {
        if (!this.currentUser) return;

        const nameField = document.getElementById('profileName');
        const emailField = document.getElementById('profileEmail');
        const phoneField = document.getElementById('profilePhone');

        if (nameField) nameField.value = this.currentUser.name || '';
        if (emailField) {
            emailField.value = this.currentUser.email || '';
            emailField.disabled = true; // Email should not be editable
        }
        if (phoneField) phoneField.value = this.currentUser.phone || '';

        // Show/hide agency fields
        const agencyFields = document.getElementById('agencyFields');
        if (agencyFields) {
            agencyFields.style.display = this.currentUser.user_type === 'agency' ? 'block' : 'none';
        }

        // Fill agency fields if user is agency
        if (this.currentUser.user_type === 'agency' && this.currentUser.agency_profile) {
            const agencyNameField = document.getElementById('agencyName');
            const agencyDescField = document.getElementById('agencyDescription');
            const agencyServicesField = document.getElementById('agencyServices');

            if (agencyNameField) agencyNameField.value = this.currentUser.agency_profile.agency_name || '';
            if (agencyDescField) agencyDescField.value = this.currentUser.agency_profile.description || '';
            if (agencyServicesField) agencyServicesField.value = this.currentUser.agency_profile.services || '';
        }
    }

    requireAuth() {
        if (!this.currentUser) {
            showAlert('Please login to continue', 'warning');
            showAuth('login');
            return false;
        }
        return true;
    }

    requireRole(role) {
        if (!this.requireAuth()) return false;
        
        if (this.currentUser.user_type !== role) {
            showAlert('You do not have permission to access this feature', 'error');
            return false;
        }
        return true;
    }
}

// Create global auth manager
const auth = new AuthManager();

// Global functions for HTML onclick handlers
function showAuth(type) {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    
    // Clear form data
    document.querySelectorAll('#authModal form').forEach(form => form.reset());
    document.querySelectorAll('#authModal .error-message').forEach(el => el.textContent = '');
}

function toggleAgencyFields() {
    const userType = document.getElementById('userType').value;
    const agencyFields = document.getElementById('registerAgencyFields');
    const agencyNameField = document.getElementById('registerAgencyName');
    
    if (userType === 'agency') {
        agencyFields.style.display = 'block';
        agencyNameField.required = true;
    } else {
        agencyFields.style.display = 'none';
        agencyNameField.required = false;
    }
}

function logout() {
    auth.handleLogout();
}