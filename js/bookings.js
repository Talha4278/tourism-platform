// Booking management functionality
class BookingManager {
    constructor() {
        this.bookings = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // Bookings will be loaded when the page is shown
    }

    async loadMyBookings() {
        if (!auth.requireAuth()) return;
        
        if (auth.currentUser.userType !== 'tourist') {
            showAlert('Only tourists can view personal bookings', 'error');
            return;
        }

        try {
            console.log('Starting to load my bookings...');
            showLoading('bookingsGrid', 'Loading your bookings...');
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Bookings API timeout')), 15000)
            );
            
            const response = await Promise.race([
                api.getMyBookings(),
                timeoutPromise
            ]);
            
            console.log('My bookings API response:', response);
            console.log('Response type:', typeof response);
            console.log('Is response array?', Array.isArray(response));
            
            if (response && response.success && response.data && response.data.bookings) {
                this.bookings = response.data.bookings;
                console.log('Loaded bookings (nested):', this.bookings);
                console.log('First booking details:', this.bookings[0]);
                console.log('Booking count:', this.bookings.length);
                this.displayBookings();
            } else if (response && response.success && response.data) {
                // Handle case where bookings are directly in response.data
                this.bookings = Array.isArray(response.data) ? response.data : [];
                console.log('Loaded bookings (direct):', this.bookings);
                this.displayBookings();
            } else if (Array.isArray(response)) {
                // Handle case where response is directly an array of bookings
                this.bookings = response;
                console.log('Loaded bookings (array):', this.bookings);
                this.displayBookings();
            } else {
                console.log('Failed to load bookings - unexpected format:', response);
                console.log('Response keys:', response ? Object.keys(response) : 'null');
                
                // Try to show empty state instead of error
                this.bookings = [];
                this.displayBookings();
                showAlert('No bookings found or unable to load bookings', 'warning');
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
            this.bookings = [];
            this.displayBookings();
            showAlert('Failed to load bookings: ' + error.message, 'error');
        }
    }

    async loadAgencyBookings() {
        if (!auth.requireRole('agency')) return;

        try {
            showLoading('bookingsGrid', 'Loading bookings...');
            
            const response = await api.getAgencyBookings();
            if (response.success) {
                this.bookings = response.data.bookings;
                this.displayBookings();
            }
        } catch (error) {
            console.error('Failed to load agency bookings:', error);
            showAlert('Failed to load bookings', 'error');
        }
    }

    displayBookings() {
        console.log('displayBookings called with:', this.bookings.length, 'bookings');
        const container = document.getElementById('bookingsGrid');
        if (!container) {
            console.log('ERROR: bookingsGrid container not found!');
            return;
        }

        let filteredBookings = this.bookings;
        
        // Apply filter
        if (this.currentFilter !== 'all') {
            filteredBookings = this.bookings.filter(booking => 
                booking.status === this.currentFilter
            );
        }

        console.log('Filtered bookings count:', filteredBookings.length);
        console.log('Current filter:', this.currentFilter);

        if (filteredBookings.length === 0) {
            let emptyMessage = 'No bookings found.';
            let emptyAction = '';
            
            if (this.currentFilter === 'all') {
                if (auth.currentUser.userType === 'tourist') {
                    emptyMessage = 'You haven\'t booked any tours yet.';
                    emptyAction = `
                        <button class="btn btn-primary" onclick="showPage('tours')">Browse Tours</button>
                        <button class="btn btn-secondary" onclick="bookingManager.debugBookingsAPI()" style="margin-left: 10px;">Debug API</button>
                    `;
                } else {
                    emptyMessage = 'No bookings received yet.';
                    emptyAction = '<button class="btn btn-primary" onclick="showPage(\'manage-tours\')">Manage Tours</button>';
                }
            } else {
                emptyMessage = `No ${this.currentFilter} bookings found.`;
            }

            showEmptyState(
                container,
                '📅',
                'No Bookings',
                emptyMessage,
                emptyAction
            );
            return;
        }

        console.log('Creating booking cards for', filteredBookings.length, 'bookings');
        const bookingCards = filteredBookings.map(booking => {
            console.log('Creating card for booking:', booking);
            const card = this.createBookingCard(booking);
            console.log('Generated card HTML length:', card.length);
            return card;
        });
        
        const finalHTML = bookingCards.join('');
        console.log('Final HTML length:', finalHTML.length);
        
        container.innerHTML = finalHTML;
        console.log('Bookings displayed in container');
    }

    // Debug method to test API directly
    async debugBookingsAPI() {
        console.log('=== DEBUGGING BOOKINGS API ===');
        console.log('Current user:', auth.currentUser);
        console.log('API token:', api.token);
        
        try {
            showAlert('Testing bookings API...', 'info');
            const response = await api.getMyBookings();
            console.log('Raw API response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', response ? Object.keys(response) : 'null');
            
            if (response && response.data) {
                console.log('Response.data:', response.data);
                console.log('Response.data type:', typeof response.data);
                if (response.data.bookings) {
                    console.log('Response.data.bookings:', response.data.bookings);
                }
            }
            
            showAlert('Check console for API debug info', 'success');
        } catch (error) {
            console.error('API Debug error:', error);
            showAlert('API Debug failed: ' + error.message, 'error');
        }
    }

    createBookingCard(booking) {
        console.log('createBookingCard called with booking:', booking);
        console.log('Booking keys:', Object.keys(booking));
        
        // Try different possible tour property names
        const tour = booking.tours || booking.tour || booking.Tour;
        console.log('Tour object found:', !!tour);
        console.log('Tour details:', tour);
        
        if (!tour) {
            console.log('No tour found in booking, returning empty card');
            return '';
        }

        const imageUrl = tour.image_url || tour.imageUrl || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
        const customerName = booking.users?.name || booking.user?.name || 'Unknown Customer';
        const agencyName = booking.agency_profiles?.agency_name || booking.agencyProfile?.agencyName || 'Unknown Agency';

        // Different display based on user type
        const displayName = auth.currentUser.userType === 'agency' ? customerName : agencyName;
        const statusClass = `status-${booking.status}`;

        return `
            <div class="booking-card ${booking.status}">
                <img src="${imageUrl}" alt="${tour.title}" class="booking-image" onerror="this.src='https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'">
                
                <div class="booking-details">
                    <h4>${tour.title}</h4>
                    <div class="booking-info">📍 ${tour.destination}</div>
                    <div class="booking-info">👥 ${booking.numberOfPeople || booking.number_of_people} ${(booking.numberOfPeople || booking.number_of_people) === 1 ? 'person' : 'people'}</div>
                    <div class="booking-info">📅 ${formatDate(booking.startDate || booking.booking_date)}</div>
                    <div class="booking-info">💰 Total: ${formatCurrency(booking.totalAmount || booking.total_amount)}</div>
                    <div class="booking-info">
                        ${auth.currentUser.userType === 'agency' ? '👤 Customer' : '🏢 Agency'}: ${displayName}
                    </div>
                    ${(booking.specialRequests || booking.special_requests) ? `<div class="booking-info">📝 ${booking.specialRequests || booking.special_requests}</div>` : ''}
                    <div class="booking-info">🕒 Booked: ${formatDateTime(booking.createdAt || booking.created_at)}</div>
                </div>
                
                <div class="booking-actions">
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                    ${this.createBookingActions(booking)}
                </div>
            </div>
        `;
    }

    createBookingActions(booking) {
        const isAgency = auth.currentUser.userType === 'agency';
        const isTourist = auth.currentUser.userType === 'tourist';
        const status = booking.status;

        let actions = [];

        if (isAgency) {
            // Agency actions
            if (status === 'pending') {
                actions.push(`<button class="btn btn-success btn-sm" onclick="bookingManager.updateBookingStatus('${booking.id}', 'confirmed')">✓ Confirm</button>`);
                actions.push(`<button class="btn btn-danger btn-sm" onclick="bookingManager.updateBookingStatus('${booking.id}', 'cancelled')">✗ Cancel</button>`);
            } else if (status === 'confirmed') {
                actions.push(`<button class="btn btn-primary btn-sm" onclick="bookingManager.updateBookingStatus('${booking.id}', 'completed')">✓ Complete</button>`);
                actions.push(`<button class="btn btn-warning btn-sm" onclick="bookingManager.updateBookingStatus('${booking.id}', 'cancelled')">✗ Cancel</button>`);
            } else if (status === 'completed') {
                actions.push(`<span class="text-success">✓ Completed</span>`);
            } else if (status === 'cancelled') {
                actions.push(`<span class="text-muted">✗ Cancelled</span>`);
            }
        } else if (isTourist) {
            // Tourist actions
            if (status === 'pending' || status === 'confirmed') {
                actions.push(`<button class="btn btn-danger btn-sm" onclick="bookingManager.updateBookingStatus('${booking.id}', 'cancelled')">✗ Cancel</button>`);
            } else if (status === 'completed') {
                actions.push(`<button class="btn btn-primary btn-sm" onclick="reviewManager.showReviewModal('${booking.tourId || booking.tour_id}', '${booking.id}')">★ Review</button>`);
            } else if (status === 'cancelled') {
                actions.push(`<span class="text-muted">✗ Cancelled</span>`);
            }
        }

        return actions.length > 0 ? `<div class="booking-actions-inline">${actions.join(' ')}</div>` : '<span class="text-muted">-</span>';
    }

    async updateBookingStatus(bookingId, status) {
        let confirmMessage = '';
        
        if (status === 'cancelled') {
            confirmMessage = 'Are you sure you want to cancel this booking?';
        } else if (status === 'confirmed') {
            confirmMessage = 'Confirm this booking?';
        } else if (status === 'completed') {
            confirmMessage = 'Mark this booking as completed?';
        }

        if (confirmMessage && !confirm(confirmMessage)) {
            return;
        }

        try {
            let response;
            
            // Use different endpoints based on user type and action
            if (status === 'cancelled' && auth.currentUser.userType === 'tourist') {
                // Tourists use the cancel endpoint
                console.log('Using tourist cancel endpoint...');
                response = await api.cancelBooking(bookingId);
                console.log('Cancel response:', response);
            } else {
                // Agencies use the status update endpoint
                console.log('Using agency status update endpoint...');
                response = await api.updateBookingStatus(bookingId, status);
                console.log('Status update response:', response);
            }
            
            if (response.success) {
                showAlert(`Booking ${status} successfully`, 'success');
                
                // Reload bookings based on user type
                if (auth.currentUser.userType === 'agency') {
                    this.loadAgencyBookings();
                } else {
                    this.loadMyBookings();
                }
            }
        } catch (error) {
            console.error('Booking status update error:', error);
            showAlert(error.message || 'Failed to update booking status', 'error');
        }
    }

    filterBookings(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.displayBookings();
    }

    // Agency reporting methods
    async loadBookingStats() {
        if (!auth.requireRole('agency')) return;

        try {
            const response = await api.getBookingStats();
            if (response.success) {
                this.displayBookingStats(response.data.stats);
            } else {
                showAlert(response.message || 'Failed to load statistics', 'error');
            }
        } catch (error) {
            showAlert('Failed to load statistics: ' + error.message, 'error');
        }
    }

    displayBookingStats(stats) {
        // Handle both camelCase and snake_case field names
        const totalBookings = stats.totalBookings || stats.total_bookings || 0;
        const totalRevenue = stats.totalRevenue || stats.total_revenue || 0;
        const averageRating = stats.averageRating || stats.average_rating || 0;
        const confirmedBookings = stats.confirmedBookings || stats.confirmed_bookings || 0;
        const pendingBookings = stats.pendingBookings || stats.pending_bookings || 0;
        const activeTours = stats.activeTours || stats.active_tours || 0;
        
        // Update the DOM elements
        const totalBookingsEl = document.getElementById('totalBookings');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const averageRatingEl = document.getElementById('averageRating');
        const confirmedBookingsEl = document.getElementById('confirmedBookings');
        const pendingBookingsEl = document.getElementById('pendingBookings');
        const activeToursEl = document.getElementById('activeTours');
        
        if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
        if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);
        if (averageRatingEl) averageRatingEl.textContent = averageRating.toFixed(1);
        if (confirmedBookingsEl) confirmedBookingsEl.textContent = confirmedBookings;
        if (pendingBookingsEl) pendingBookingsEl.textContent = pendingBookings;
        if (activeToursEl) activeToursEl.textContent = activeTours;
    }

    async loadRecentBookings() {
        if (!auth.requireRole('agency')) return;

        try {
            const response = await api.getRecentBookings(10);
            if (response.success) {
                this.displayRecentBookings(response.data.bookings || []);
            } else {
                this.displayRecentBookings([]);
            }
        } catch (error) {
            console.error('Failed to load recent bookings:', error);
            this.displayRecentBookings([]);
        }
    }

    displayRecentBookings(bookings) {
        const container = document.getElementById('recentBookingsTable');
        if (!container) return;

        if (bookings.length === 0) {
            container.innerHTML = '<p>No recent bookings found.</p>';
            return;
        }

        const tableHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Tour</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>People</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => `
                        <tr>
                            <td>${booking.tour?.title || booking.tours?.title || 'N/A'}</td>
                            <td>${booking.touristUser?.name || booking.users?.name || 'N/A'}</td>
                            <td>${formatDate(booking.startDate || booking.booking_date || booking.createdAt)}</td>
                            <td>${booking.numberOfPeople || booking.number_of_people || 0}</td>
                            <td>${formatCurrency(booking.totalAmount || booking.total_amount || 0)}</td>
                            <td><span class="booking-status status-${booking.status}">${booking.status}</span></td>
                            <td>${this.createBookingActions(booking)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }
}

// Create global booking manager
const bookingManager = new BookingManager();

// Global functions
function filterBookings(filter) {
    bookingManager.currentFilter = filter;
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    bookingManager.displayBookings();
}