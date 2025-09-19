// Tour management functionality
class TourManager {
    constructor() {
        this.tours = [];
        this.destinations = [];
        this.currentTour = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Create tour form
        const createTourForm = document.getElementById('createTourForm');
        if (createTourForm) {
            createTourForm.addEventListener('submit', this.handleCreateTour.bind(this));
        }
    }

    async loadTours(filters = {}) {
        try {
            const response = await api.getTours(filters);
            if (response.success) {
                this.tours = response.data.tours;
                console.log('Loaded tours:', this.tours.length);
                if (this.tours.length > 0) {
                    console.log('First tour object:', this.tours[0]);
                    console.log('First tour keys:', Object.keys(this.tours[0]));
                }
                this.displayTours();
            }
        } catch (error) {
            console.error('Failed to load tours:', error);
            showAlert('Failed to load tours', 'error');
        }
    }

    async loadDestinations() {
        try {
            const response = await api.getDestinations();
            if (response.success) {
                this.destinations = response.data.destinations;
                this.updateDestinationFilter();
            }
        } catch (error) {
            console.error('Failed to load destinations:', error);
        }
    }

    updateDestinationFilter() {
        const filter = document.getElementById('destinationFilter');
        if (!filter) return;

        // Clear existing options (except "All Destinations")
        filter.innerHTML = '<option value="">All Destinations</option>';

        // Add destinations
        this.destinations.forEach(destination => {
            const option = document.createElement('option');
            option.value = destination;
            option.textContent = destination;
            filter.appendChild(option);
        });
    }

    displayTours() {
        const container = document.getElementById('toursGrid');
        if (!container) return;

        if (this.tours.length === 0) {
            showEmptyState(
                container,
                '🎯',
                'No Tours Found',
                'Try adjusting your search filters or check back later for new tours.',
                '<button class="btn btn-primary" onclick="showPage(\'home\')">Browse All Tours</button>'
            );
            return;
        }

        container.innerHTML = this.tours.map(tour => this.createTourCard(tour)).join('');
    }

    createTourCard(tour) {
        console.log('Creating tour card for:', tour.title);
        console.log('Tour image fields:', {
            image_url: tour.image_url,
            imageUrl: tour.imageUrl,
            image: tour.image,
            tourImageUrl: tour.tourImageUrl
        });
        
        // Try different possible image field names
        const imageUrl = tour.image_url || tour.imageUrl || tour.image || tour.tourImageUrl || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
        console.log('Selected image URL:', imageUrl);
        
        const agencyName = tour.agency_profiles?.agency_name || tour.users?.name || 'Unknown Agency';
        
        return `
            <div class="tour-card">
                <div class="tour-image">
                    <img src="${imageUrl}" alt="${tour.title}" onerror="this.src='https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'">
                    <div class="tour-badge">${tour.category}</div>
                </div>
                <div class="tour-content">
                    <h3 class="tour-title">${tour.title}</h3>
                    <div class="tour-location">${tour.destination}</div>
                    <p class="tour-description">${tour.description}</p>
                    
                    <div class="tour-details">
                        <span class="tour-duration">${tour.duration} ${tour.duration === 1 ? 'day' : 'days'}</span>
                        <span class="tour-group-size">Max ${tour.max_group_size}</span>
                    </div>
                    
                    <div class="tour-price">${formatCurrency(tour.price)}</div>
                    
                    <div class="tour-actions">
                        <button class="btn btn-outline" onclick="tourManager.viewTour('${tour.id}')">View Details</button>
                        <button class="btn btn-primary" onclick="tourManager.bookTour('${tour.id}')">Book Now</button>
                    </div>
                </div>
            </div>
        `;
    }

    async viewTour(tourId) {
        try {
            showLoading('tourModalContent', 'Loading tour details...');
            showTourModal();

            const response = await api.getTour(tourId);
            if (response.success) {
                this.currentTour = response.data.tour;
                this.displayTourDetails(response.data.tour, response.data.reviews, response.data.rating);
            }
        } catch (error) {
            console.error('Failed to load tour details:', error);
            showAlert('Failed to load tour details', 'error');
            closeTourModal();
        }
    }

    displayTourDetails(tour, reviews, rating) {
        const container = document.getElementById('tourModalContent');
        const imageUrl = tour.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
        const agencyName = tour.users?.agency_profiles?.agency_name || tour.users?.name || 'Unknown Agency';
        
        const includesList = tour.includes ? 
            tour.includes.split('\n').map(item => `<div class="include-item"><span class="include-icon">✓</span>${item.trim()}</div>`).join('') : 
            '<div class="include-item"><span class="include-icon">✓</span>Details to be provided by tour guide</div>';

        container.innerHTML = `
            <div class="tour-modal">
                <!-- Header with image and basic info -->
                <div class="tour-modal-header">
                    <div class="tour-modal-image">
                        <img src="${imageUrl}" alt="${tour.title}" onerror="this.src='https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'">
                        <div class="tour-modal-badge">${tour.category.charAt(0).toUpperCase() + tour.category.slice(1)}</div>
                    </div>
                    <div class="tour-modal-info">
                        <h2 class="tour-modal-title">${tour.title}</h2>
                        <div class="tour-modal-location">📍 ${tour.destination}</div>
                        <div class="tour-modal-rating">
                            ${rating.average > 0 ? `⭐ ${rating.average.toFixed(1)} (${rating.count} reviews)` : '⭐ No reviews yet'}
                        </div>
                        <div class="tour-modal-price">${formatCurrency(tour.price)}<span>/person</span></div>
                    </div>
                </div>

                <!-- Content body -->
                <div class="tour-modal-body">
                    <!-- Quick facts grid -->
                    <div class="tour-quick-facts">
                        <div class="fact-item">
                            <div class="fact-icon">🕒</div>
                            <div class="fact-text">
                                <span class="fact-label">Duration</span>
                                <span class="fact-value">${tour.duration} ${tour.duration === 1 ? 'day' : 'days'}</span>
                            </div>
                        </div>
                        <div class="fact-item">
                            <div class="fact-icon">👥</div>
                            <div class="fact-text">
                                <span class="fact-label">Group Size</span>
                                <span class="fact-value">Max ${tour.max_group_size}</span>
                            </div>
                        </div>
                        <div class="fact-item">
                            <div class="fact-icon">🏢</div>
                            <div class="fact-text">
                                <span class="fact-label">Guide</span>
                                <span class="fact-value">${agencyName}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="tour-section">
                        <h3 class="section-title">About This Tour</h3>
                        <p class="tour-description">${tour.description}</p>
                    </div>

                    <!-- What's included -->
                    <div class="tour-section">
                        <h3 class="section-title">What's Included</h3>
                        <div class="includes-grid">
                            ${includesList}
                        </div>
                    </div>

                    <!-- Booking form -->
                    ${this.createBookingForm(tour)}

                    <!-- Reviews -->
                    ${this.createReviewsSection(reviews, rating)}
                </div>

                <!-- Footer with pricing and action -->
                <div class="tour-modal-footer">
                    <div class="footer-price">
                        <span class="price-label">Starting from</span>
                        <span class="price-amount">${formatCurrency(tour.price)}</span>
                        <span class="price-unit">per person</span>
                    </div>
                    <div class="footer-action">
                        <button class="btn btn-primary btn-footer-book" onclick="tourManager.showBookingForm('${tour.id}')" id="footerBookBtn-${tour.id}">
                            📅 Book This Tour Now
                        </button>
                        <button class="btn btn-success btn-footer-confirm" onclick="tourManager.submitBookingFromFooter('${tour.id}')" id="footerConfirmBtn-${tour.id}" style="display: none;">
                            🎯 Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createBookingForm(tour) {
        if (!auth.currentUser || auth.currentUser.userType !== 'tourist') {
            return '';
        }

        return `
            <div class="tour-section" id="bookingSection-${tour.id}" style="display: none;">
                <h3 class="section-title">Booking Details</h3>
                
                <div class="booking-form" id="bookingForm-${tour.id}">
                    <form id="bookingFormElement-${tour.id}">
                        <div class="booking-form-grid">
                            <div class="form-group">
                                <label for="numberOfPeople-${tour.id}">Number of People *</label>
                                <input type="number" id="numberOfPeople-${tour.id}" min="1" max="${tour.max_group_size}" value="1" required>
                                <span class="error-message"></span>
                            </div>
                            <div class="form-group">
                                <label for="bookingDate-${tour.id}">Preferred Date *</label>
                                <input type="date" id="bookingDate-${tour.id}" min="${new Date().toISOString().split('T')[0]}" required>
                                <span class="error-message"></span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="specialRequests-${tour.id}">Special Requests (Optional)</label>
                            <textarea id="specialRequests-${tour.id}" rows="2" placeholder="Any special requirements or requests..."></textarea>
                        </div>
                        
                        <div class="booking-summary">
                            <div class="summary-header">Booking Summary</div>
                            <div class="summary-row">
                                <span>Price per person</span>
                                <span>${formatCurrency(tour.price)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Number of people</span>
                                <span id="summaryPeople-${tour.id}">1</span>
                            </div>
                            <div class="summary-row total-row">
                                <span>Total Amount</span>
                                <span id="summaryTotal-${tour.id}">${formatCurrency(tour.price)}</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createReviewsSection(reviews, rating) {
        if (!reviews || reviews.length === 0) {
            return `
                <div class="reviews-section">
                    <h4>Reviews</h4>
                    <p>No reviews yet. Be the first to review this tour!</p>
                </div>
            `;
        }

        const reviewsHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="reviewer-name">${review.users.name}</span>
                    <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    <span class="review-date">${formatDate(review.created_at)}</span>
                </div>
                <div class="review-comment">${review.comment}</div>
            </div>
        `).join('');

        return `
            <div class="reviews-section">
                <h4>Reviews (${rating.count}) - Average: ${rating.average.toFixed(1)}/5</h4>
                ${reviewsHTML}
            </div>
        `;
    }

    async bookTour(tourId) {
        if (!auth.requireAuth()) return;
        
        if (auth.currentUser.userType !== 'tourist') {
            showAlert('Only tourists can book tours', 'warning');
            return;
        }

        // First, open the tour details modal
        await this.viewTour(tourId);
        
        // Wait a moment for the modal to render, then show the booking form
        setTimeout(() => {
            this.showBookingForm(tourId);
        }, 500);
    }

    showBookingForm(tourId) {
        // Show the booking section
        const bookingSection = document.getElementById(`bookingSection-${tourId}`);
        const footerBookBtn = document.getElementById(`footerBookBtn-${tourId}`);
        const footerConfirmBtn = document.getElementById(`footerConfirmBtn-${tourId}`);
        
        if (bookingSection && footerBookBtn && footerConfirmBtn) {
            bookingSection.style.display = 'block';
            footerBookBtn.style.display = 'none';
            footerConfirmBtn.style.display = 'block';
            
            // Setup form calculations
            const peopleInput = bookingSection.querySelector(`#numberOfPeople-${tourId}`);
            const summaryPeople = bookingSection.querySelector(`#summaryPeople-${tourId}`);
            const summaryTotal = bookingSection.querySelector(`#summaryTotal-${tourId}`);
            
            if (peopleInput && summaryPeople && summaryTotal && this.currentTour) {
                // Remove existing listeners to prevent duplicates
                peopleInput.removeEventListener('input', this.updateBookingSummary);
                
                // Add new listener
                this.updateBookingSummary = () => {
                    const people = parseInt(peopleInput.value) || 1;
                    const pricePerPerson = this.currentTour.price;
                    
                    summaryPeople.textContent = people;
                    summaryTotal.textContent = formatCurrency(people * pricePerPerson);
                };
                
                peopleInput.addEventListener('input', this.updateBookingSummary);
                
                // Trigger initial calculation
                this.updateBookingSummary();
            }
            
            // Scroll to booking form
            bookingSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    async submitBookingFromFooter(tourId) {
        // Check if user is logged in
        if (!auth || !auth.currentUser) {
            showAlert('Please login to make a booking', 'error');
            if (typeof showAuth === 'function') {
                showAuth('login');
            }
            return;
        }

        // Validate and submit booking directly
        const numberOfPeople = document.getElementById(`numberOfPeople-${tourId}`)?.value;
        const bookingDate = document.getElementById(`bookingDate-${tourId}`)?.value;
        const specialRequests = document.getElementById(`specialRequests-${tourId}`)?.value;

        // Basic validation
        if (!numberOfPeople || !bookingDate) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        if (parseInt(numberOfPeople) < 1) {
            showAlert('Number of people must be at least 1', 'error');
            return;
        }

        try {
            const confirmBtn = document.getElementById(`footerConfirmBtn-${tourId}`);
            const originalText = confirmBtn.textContent;
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Creating Booking...';

            // Convert booking date to proper format
            const startDate = new Date(bookingDate).toISOString();
            const endDate = new Date(new Date(bookingDate).getTime() + 24 * 60 * 60 * 1000).toISOString(); // Add 1 day

            const bookingData = {
                tourId: tourId,
                numberOfPeople: parseInt(numberOfPeople),
                startDate: startDate,
                endDate: endDate,
                specialRequests: specialRequests || ''
            };

            const response = await api.createBooking(bookingData);

            // Check if response has booking data (successful booking)
            if (response && response.id) {
                console.log('Booking successful, showing alert and redirecting');
                
                // Test alert first
                console.log('Testing showAlert function...');
                showAlert('Booking created successfully!', 'success');
                
                // Wait a moment before closing modal and redirecting
                setTimeout(() => {
                    console.log('Closing modal and redirecting...');
                    closeTourModal();
                    showPage('my-bookings');
                }, 1000);
                
            } else if (response.success) {
                console.log('Booking successful (success=true), showing alert and redirecting');
                showAlert('Booking created successfully!', 'success');
                
                setTimeout(() => {
                    closeTourModal();
                    showPage('my-bookings');
                }, 1000);
                
            } else {
                console.log('Booking failed:', response);
                showAlert(response.message || 'Booking creation failed', 'error');
            }
        } catch (error) {
            showAlert(error.message || 'Failed to create booking', 'error');
        } finally {
            const confirmBtn = document.getElementById(`footerConfirmBtn-${tourId}`);
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '🎯 Confirm Booking';
            }
        }
    }

    async submitBooking(event, tourId) {
        event.preventDefault();
        
        // Check if user is logged in
        if (!auth || !auth.currentUser) {
            showAlert('Please login to make a booking', 'error');
            if (typeof showAuth === 'function') {
                showAuth('login');
            }
            return;
        }
        
        const numberOfPeople = document.getElementById(`numberOfPeople-${tourId}`).value;
        const bookingDate = document.getElementById(`bookingDate-${tourId}`).value;
        const specialRequests = document.getElementById(`specialRequests-${tourId}`).value;

        const validation = validateRequired([
            { id: `numberOfPeople-${tourId}`, required: true, type: 'number', label: 'Number of People' },
            { id: `bookingDate-${tourId}`, required: true, label: 'Booking Date' }
        ]);

        if (!validation.isValid) {
            displayFormErrors(validation.errors);
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Booking...';

            // Convert booking date to proper format
            const startDate = new Date(bookingDate).toISOString();
            const endDate = new Date(new Date(bookingDate).getTime() + 24 * 60 * 60 * 1000).toISOString(); // Add 1 day

            const bookingData = {
                tourId: tourId,
                numberOfPeople: parseInt(numberOfPeople),
                startDate: startDate,
                endDate: endDate,
                specialRequests: specialRequests || ''
            };

            const response = await api.createBooking(bookingData);

            // Check if response has booking data (successful booking)
            if (response && response.id) {
                showAlert('Booking created successfully!', 'success');
                closeTourModal();
                showPage('my-bookings');
            } else if (response.success) {
                showAlert('Booking created successfully!', 'success');
                closeTourModal();
                showPage('my-bookings');
            }
        } catch (error) {
            showAlert(error.message || 'Failed to create booking', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }
    }

    // Agency tour management
    async loadMyTours() {
        if (!auth.requireRole('agency')) return;

        try {
            showLoading('manageToursGrid', 'Loading your tours...');
            
            const response = await api.getMyTours();
            if (response.success) {
                this.displayMyTours(response.data.tours);
            }
        } catch (error) {
            console.error('Failed to load tours:', error);
            showAlert('Failed to load tours', 'error');
        }
    }

    displayMyTours(tours) {
        const container = document.getElementById('manageToursGrid');
        if (!container) return;

        if (tours.length === 0) {
            showEmptyState(
                container,
                '🎯',
                'No Tours Yet',
                'Create your first tour to start attracting customers.',
                '<button class="btn btn-primary" onclick="showCreateTourModal()">Create Tour</button>'
            );
            return;
        }

        container.innerHTML = tours.map(tour => this.createManageTourCard(tour)).join('');
    }

    createManageTourCard(tour) {
        const imageUrl = tour.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
        const status = tour.is_active ? 'Active' : 'Inactive';
        const statusClass = tour.is_active ? 'badge-success' : 'badge-danger';
        
        return `
            <div class="tour-card manage-tour-card">
                <div class="manage-actions">
                    <button class="action-btn edit-btn" onclick="tourManager.editTour('${tour.id}')" title="Edit Tour">✏️</button>
                    <button class="action-btn delete-btn" onclick="tourManager.deleteTour('${tour.id}')" title="Delete Tour">🗑️</button>
                </div>
                <div class="tour-image">
                    <img src="${imageUrl}" alt="${tour.title}" onerror="this.src='https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'">
                    <div class="badge ${statusClass}">${status}</div>
                </div>
                <div class="tour-content">
                    <h3 class="tour-title">${tour.title}</h3>
                    <div class="tour-location">${tour.destination}</div>
                    <p class="tour-description">${tour.description}</p>
                    
                    <div class="tour-details">
                        <span class="tour-duration">${tour.duration} ${tour.duration === 1 ? 'day' : 'days'}</span>
                        <span class="tour-group-size">Max ${tour.max_group_size}</span>
                    </div>
                    
                    <div class="tour-price">${formatCurrency(tour.price)}</div>
                    
                    <div class="tour-actions">
                        <button class="btn btn-outline" onclick="tourManager.viewTour('${tour.id}')">View</button>
                        <button class="btn btn-primary" onclick="tourManager.editTour('${tour.id}')">Edit</button>
                    </div>
                </div>
            </div>
        `;
    }

    async handleCreateTour(event) {
        event.preventDefault();
        console.log('=== TOUR CREATION STARTED ===');
        
        if (!auth.requireRole('agency')) {
            console.log('Auth check failed - not an agency');
            return;
        }

        const formData = {
            title: document.getElementById('tourTitle').value.trim(),
            destination: document.getElementById('tourDestination').value.trim(),
            description: document.getElementById('tourDescription').value.trim(),
            price: parseFloat(document.getElementById('tourPrice').value),
            duration: parseInt(document.getElementById('tourDuration').value),
            maxGroupSize: parseInt(document.getElementById('tourMaxSize').value),
            category: document.getElementById('tourCategory').value.trim(),
            inclusions: document.getElementById('tourIncludes').value.trim(),
            imageUrl: document.getElementById('tourImageUrl').value.trim() || null,
            itinerary: '',
            exclusions: ''
        };
        
        console.log('Form data collected:', formData);

        const validation = validateRequired([
            { id: 'tourTitle', required: true, label: 'Tour Title' },
            { id: 'tourDestination', required: true, label: 'Destination' },
            { id: 'tourDescription', required: true, label: 'Description' },
            { id: 'tourPrice', required: true, type: 'number', label: 'Price' },
            { id: 'tourDuration', required: true, type: 'number', label: 'Duration' },
            { id: 'tourMaxSize', required: true, type: 'number', label: 'Max Group Size' }
        ]);

        console.log('Validation result:', validation);

        if (!validation.isValid) {
            console.log('Validation failed:', validation.errors);
            displayFormErrors(validation.errors);
            return;
        }

        console.log('Validation passed, making API call...');

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Tour...';

            console.log('Making API call to create tour...');
            const response = await api.createTour(formData);
            console.log('API response:', response);

            // Check if response has an ID (successful creation)
            if (response && response.id) {
                console.log('Tour created successfully!');
                showAlert('Tour created successfully!', 'success');
                closeCreateTourModal();
                this.loadMyTours(); // Refresh the tours list
            } else {
                console.log('Tour creation failed:', response);
                showAlert('Failed to create tour', 'error');
            }
        } catch (error) {
            console.error('Tour creation error:', error);
            showAlert(error.message || 'Failed to create tour', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Tour';
            }
        }
    }

    editTour(tourId) {
        // TODO: Implement edit functionality
        showAlert('Edit functionality coming soon!', 'info');
    }

    async deleteTour(tourId) {
        if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await api.deleteTour(tourId);
            if (response.success) {
                showAlert('Tour deleted successfully', 'success');
                this.loadMyTours(); // Refresh the tours list
            }
        } catch (error) {
            showAlert(error.message || 'Failed to delete tour', 'error');
        }
    }

    async loadPopularTours() {
        try {
            const response = await api.getPopularTours();
            if (response.success) {
                console.log('Popular tours loaded:', response.data.tours.length);
                if (response.data.tours.length > 0) {
                    console.log('First popular tour:', response.data.tours[0]);
                }
                this.displayPopularTours(response.data.tours);
            }
        } catch (error) {
            console.error('Failed to load popular tours:', error);
        }
    }

    displayPopularTours(tours) {
        const container = document.getElementById('popularToursGrid');
        if (!container) return;

        if (tours.length === 0) {
            container.innerHTML = '<p>No popular tours available at the moment.</p>';
            return;
        }

        container.innerHTML = tours.slice(0, 3).map(tour => this.createTourCard(tour)).join('');
    }
}

// Create global tour manager
const tourManager = new TourManager();

// Global functions for tour management
function showCreateTourModal() {
    if (!auth.requireRole('agency')) return;
    
    const modal = document.getElementById('createTourModal');
    const form = document.getElementById('createTourForm');
    
    // Reset form
    form.reset();
    document.getElementById('createTourTitle').textContent = 'Create New Tour';
    
    // Clear errors
    document.querySelectorAll('#createTourModal .error-message').forEach(el => el.textContent = '');
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeCreateTourModal() {
    const modal = document.getElementById('createTourModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
}

function showTourModal() {
    const modal = document.getElementById('tourModal');
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeTourModal() {
    const modal = document.getElementById('tourModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
}

function filterTours() {
    const destination = document.getElementById('destinationFilter')?.value || '';
    const maxPrice = document.getElementById('priceFilter')?.value || '';
    const duration = document.getElementById('durationFilter')?.value || '';
    
    const filters = {};
    if (destination) filters.destination = destination;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (duration) filters.duration = duration;
    
    tourManager.loadTours(filters);
}

// Search tours by destination from featured destinations
function searchDestination(destination) {
    // Switch to tours page
    showPage('tours');
    
    // Set destination filter
    const destinationFilter = document.getElementById('destinationFilter');
    if (destinationFilter) {
        // Wait a bit for page to load, then set filter
        setTimeout(() => {
            destinationFilter.value = destination;
            filterTours();
        }, 100);
    }
}