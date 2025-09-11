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
        
        if (auth.currentUser.user_type !== 'tourist') {
            showAlert('Only tourists can view personal bookings', 'error');
            return;
        }

        try {
            showLoading('bookingsGrid', 'Loading your bookings...');
            
            const response = await api.getMyBookings();
            if (response.success) {
                this.bookings = response.data.bookings;
                this.displayBookings();
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
            showAlert('Failed to load bookings', 'error');
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
        const container = document.getElementById('bookingsGrid');
        if (!container) return;

        let filteredBookings = this.bookings;
        
        // Apply filter
        if (this.currentFilter !== 'all') {
            filteredBookings = this.bookings.filter(booking => 
                booking.status === this.currentFilter
            );
        }

        if (filteredBookings.length === 0) {
            let emptyMessage = 'No bookings found.';
            let emptyAction = '';
            
            if (this.currentFilter === 'all') {
                if (auth.currentUser.user_type === 'tourist') {
                    emptyMessage = 'You haven\'t booked any tours yet.';
                    emptyAction = '<button class="btn btn-primary" onclick="showPage(\'tours\')">Browse Tours</button>';
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

        container.innerHTML = filteredBookings.map(booking => this.createBookingCard(booking)).join('');
    }

    createBookingCard(booking) {
        const tour = booking.tours;
        if (!tour) return '';

        const imageUrl = tour.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
        const customerName = booking.users?.name || 'Unknown Customer';
        const agencyName = booking.agency_profiles?.agency_name || 'Unknown Agency';

        // Different display based on user type
        const displayName = auth.currentUser.user_type === 'agency' ? customerName : agencyName;
        const statusClass = `status-${booking.status}`;

        return `
            <div class="booking-card ${booking.status}">
                <img src="${imageUrl}" alt="${tour.title}" class="booking-image" onerror="this.src='https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'">
                
                <div class="booking-details">
                    <h4>${tour.title}</h4>
                    <div class="booking-info">📍 ${tour.destination}</div>
                    <div class="booking-info">👥 ${booking.number_of_people} ${booking.number_of_people === 1 ? 'person' : 'people'}</div>
                    <div class="booking-info">📅 ${formatDate(booking.booking_date)}</div>
                    <div class="booking-info">💰 Total: ${formatCurrency(booking.total_amount)}</div>
                    <div class="booking-info">
                        ${auth.currentUser.user_type === 'agency' ? '👤 Customer' : '🏢 Agency'}: ${displayName}
                    </div>
                    ${booking.special_requests ? `<div class="booking-info">📝 ${booking.special_requests}</div>` : ''}
                    <div class="booking-info">🕒 Booked: ${formatDateTime(booking.created_at)}</div>
                </div>
                
                <div class="booking-actions">
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                    ${this.createBookingActions(booking)}
                </div>
            </div>
        `;
    }

    createBookingActions(booking) {
        const isAgency = auth.currentUser.user_type === 'agency';
        const isTourist = auth.currentUser.user_type === 'tourist';
        const status = booking.status;

        let actions = [];

        if (isAgency) {
            // Agency actions
            if (status === 'pending') {
                actions.push(`<button class="btn btn-success" onclick="bookingManager.updateBookingStatus('${booking.id}', 'confirmed')">Confirm</button>`);
                actions.push(`<button class="btn btn-danger" onclick="bookingManager.updateBookingStatus('${booking.id}', 'cancelled')">Cancel</button>`);
            } else if (status === 'confirmed') {
                actions.push(`<button class="btn btn-primary" onclick="bookingManager.updateBookingStatus('${booking.id}', 'completed')">Mark Complete</button>`);
            }
        } else if (isTourist) {
            // Tourist actions
            if (status === 'pending' || status === 'confirmed') {
                actions.push(`<button class="btn btn-danger" onclick="bookingManager.updateBookingStatus('${booking.id}', 'cancelled')">Cancel Booking</button>`);
            }
            if (status === 'completed') {
                actions.push(`<button class="btn btn-primary" onclick="reviewManager.showReviewModal('${booking.tour_id}', '${booking.id}')">Leave Review</button>`);
            }
        }

        return actions.join('');
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
            const response = await api.updateBookingStatus(bookingId, status);
            if (response.success) {
                showAlert(`Booking ${status} successfully`, 'success');
                
                // Reload bookings based on user type
                if (auth.currentUser.user_type === 'agency') {
                    this.loadAgencyBookings();
                } else {
                    this.loadMyBookings();
                }
            }
        } catch (error) {
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
            }
        } catch (error) {
            console.error('Failed to load booking stats:', error);
            showAlert('Failed to load statistics', 'error');
        }
    }

    displayBookingStats(stats) {
        document.getElementById('totalBookings').textContent = stats.total_bookings || 0;
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenue || 0);
        document.getElementById('averageRating').textContent = (stats.average_rating || 0).toFixed(1);
        document.getElementById('activeTours').textContent = stats.active_tours || 0;
    }

    async loadRecentBookings() {
        if (!auth.requireRole('agency')) return;

        try {
            const response = await api.getRecentBookings(10);
            if (response.success) {
                this.displayRecentBookings(response.data.bookings);
            }
        } catch (error) {
            console.error('Failed to load recent bookings:', error);
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
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => `
                        <tr>
                            <td>${booking.tours?.title || 'N/A'}</td>
                            <td>${booking.users?.name || 'N/A'}</td>
                            <td>${formatDate(booking.booking_date)}</td>
                            <td>${booking.number_of_people}</td>
                            <td>${formatCurrency(booking.total_amount)}</td>
                            <td><span class="booking-status status-${booking.status}">${booking.status}</span></td>
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