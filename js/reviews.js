// Review management functionality
class ReviewManager {
    constructor() {
        this.reviews = [];
        this.currentRating = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Review form
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', this.handleCreateReview.bind(this));
        }

        // Star rating
        document.addEventListener('click', (event) => {
            if (event.target.matches('.star')) {
                this.handleStarClick(event.target);
            }
        });

        // Star hover effects
        document.addEventListener('mouseover', (event) => {
            if (event.target.matches('.star')) {
                this.handleStarHover(event.target);
            }
        });

        document.addEventListener('mouseout', (event) => {
            if (event.target.matches('.star-rating .star')) {
                this.resetStarHover();
            }
        });
    }

    handleStarClick(star) {
        const rating = parseInt(star.dataset.rating);
        this.currentRating = rating;
        document.getElementById('reviewRating').value = rating;
        
        // Update star display
        this.updateStarDisplay(rating);
    }

    handleStarHover(star) {
        const rating = parseInt(star.dataset.rating);
        this.updateStarDisplay(rating, true);
    }

    resetStarHover() {
        this.updateStarDisplay(this.currentRating);
    }

    updateStarDisplay(rating, isHover = false) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    showReviewModal(tourId, bookingId) {
        if (!auth.requireAuth() || !auth.requireRole('tourist')) return;

        this.currentTourId = tourId;
        this.currentBookingId = bookingId;
        this.currentRating = 0;

        // Reset form
        document.getElementById('reviewForm').reset();
        document.getElementById('reviewRating').value = '';
        this.updateStarDisplay(0);

        // Clear errors
        document.querySelectorAll('#reviewModal .error-message').forEach(el => el.textContent = '');

        // Show modal
        const modal = document.getElementById('reviewModal');
        modal.classList.add('active');
        modal.style.display = 'flex';
    }

    async handleCreateReview(event) {
        event.preventDefault();

        const rating = document.getElementById('reviewRating').value;
        const comment = document.getElementById('reviewComment').value;

        const validation = validateRequired([
            { id: 'reviewRating', required: true, label: 'Rating' },
            { id: 'reviewComment', required: true, label: 'Review Comment' }
        ]);

        if (!validation.isValid) {
            displayFormErrors(validation.errors);
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            displayFormErrors({ reviewRating: 'Please select a rating from 1 to 5 stars' });
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting Review...';

            const reviewData = {
                tour_id: this.currentTourId,
                rating: parseInt(rating),
                comment: comment
            };

            const response = await api.createReview(reviewData);

            if (response.success) {
                showAlert('Review submitted successfully!', 'success');
                closeReviewModal();
                
                // Refresh bookings to update the UI
                if (bookingManager) {
                    bookingManager.loadMyBookings();
                }
            }
        } catch (error) {
            showAlert(error.message || 'Failed to submit review', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
    }

    async loadMyReviews() {
        if (!auth.requireAuth() || !auth.requireRole('tourist')) return;

        try {
            const response = await api.getMyReviews();
            if (response.success) {
                this.reviews = response.data.reviews;
                this.displayMyReviews();
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
            showAlert('Failed to load reviews', 'error');
        }
    }

    displayMyReviews() {
        // This could be used in a future "My Reviews" page
        console.log('My reviews:', this.reviews);
    }

    async loadTourReviews(tourId) {
        try {
            const response = await api.getTourReviews(tourId);
            if (response.success) {
                return {
                    reviews: response.data.reviews,
                    rating: response.data.rating
                };
            }
        } catch (error) {
            console.error('Failed to load tour reviews:', error);
            return { reviews: [], rating: { average: 0, count: 0 } };
        }
    }
}

// Create global review manager
const reviewManager = new ReviewManager();

// Global functions
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    
    // Reset form state
    reviewManager.currentRating = 0;
    reviewManager.currentTourId = null;
    reviewManager.currentBookingId = null;
}