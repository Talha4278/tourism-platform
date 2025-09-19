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
                console.log('No token found, user not logged in');
                this.handleLogout(false);
                return;
            }

            console.log('Checking auth status with token...');
            api.setToken(token);
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Auth check timeout')), 10000)
            );
            
            const response = await Promise.race([
                api.getProfile(),
                timeoutPromise
            ]);
            
            if (response && response.success) {
                console.log('Auth check successful');
                this.currentUser = response.data.user;
                this.updateUI();
            } else {
                console.log('Auth check failed, logging out');
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
                if (this.currentUser.userType === 'agency') {
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
        
        console.log('Registration started...');
        
        // Get actual form values
        const formData = {
            name: document.getElementById('registerName').value.trim(),
            email: document.getElementById('registerEmail').value.trim(),
            password: document.getElementById('registerPassword').value,
            userType: document.getElementById('userType').value || 'tourist'
        };
        
        console.log('Registration data:', { ...formData, password: '[HIDDEN]' });
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }
        
        if (formData.password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            // Use the API service instead of direct fetch
            console.log('Sending registration request...');
            const data = await api.register(formData);
            console.log('Registration response received:', data);

            if (data && data.success) {
                console.log('Registration successful');
                this.currentUser = data.data.user;
                api.setToken(data.data.token);
                
                this.updateUI();
                closeAuthModal();
                showAlert('Account created successfully!', 'success');
                showPage('tours');
            } else {
                console.log('Registration failed:', data);
                showAlert(data?.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Registration failed: ' + error.message, 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    }

    async handleUpdateProfile(event) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
        };

        // Add agency fields if applicable
        if (this.currentUser.userType === 'agency') {
            formData.agencyName = document.getElementById('agencyName')?.value;
            formData.agencyDescription = document.getElementById('agencyDescription')?.value;
            formData.agencyServices = document.getElementById('agencyServices')?.value;
        }

        // Validate required fields
        const requiredFields = [
            { id: 'profileName', required: true, label: 'Name' }
        ];

        if (this.currentUser.userType === 'agency') {
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
        const isAgency = this.currentUser?.userType === 'agency';
        const isTourist = this.currentUser?.userType === 'tourist';

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
            agencyFields.style.display = this.currentUser.userType === 'agency' ? 'block' : 'none';
        }

        // Fill agency fields if user is agency
        if (this.currentUser.userType === 'agency' && this.currentUser.agencyProfile) {
            const agencyNameField = document.getElementById('agencyName');
            const agencyDescField = document.getElementById('agencyDescription');
            const agencyServicesField = document.getElementById('agencyServices');

            if (agencyNameField) agencyNameField.value = this.currentUser.agencyProfile?.agencyName || '';
            if (agencyDescField) agencyDescField.value = this.currentUser.agencyProfile?.description || '';
            if (agencyServicesField) agencyServicesField.value = this.currentUser.agencyProfile?.services || '';
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
        
        if (this.currentUser.userType !== role) {
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