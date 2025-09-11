import Review from '../models/Review.js';

export const createReview = async (req, res) => {
    try {
        const { tour_id, rating, comment } = req.body;

        // Validation
        if (!tour_id || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Tour ID, rating, and comment are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user can review
        const canReview = await Review.canUserReview(req.user.id, tour_id);
        if (!canReview) {
            return res.status(400).json({
                success: false,
                message: 'You can only review tours you have completed and not already reviewed'
            });
        }

        // Create review
        const reviewData = {
            tourist_user_id: req.user.id,
            tour_id,
            rating: parseInt(rating),
            comment
        };

        const review = await Review.create(reviewData);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: { review }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create review'
        });
    }
};

export const getTourReviews = async (req, res) => {
    try {
        const { tour_id } = req.params;

        const reviews = await Review.getByTour(tour_id);
        const rating = await Review.getTourAverageRating(tour_id);

        res.json({
            success: true,
            data: { 
                reviews,
                rating
            }
        });
    } catch (error) {
        console.error('Get tour reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reviews'
        });
    }
};

export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.getByTourist(req.user.id);

        res.json({
            success: true,
            data: { reviews }
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reviews'
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Find review
        const review = await Review.getById ? await Review.getById(id) : null;
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.tourist_user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        // Validation
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Update review
        const updateData = {};
        if (rating) updateData.rating = parseInt(rating);
        if (comment) updateData.comment = comment;

        const updatedReview = await review.update(updateData);

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: { review: updatedReview }
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update review'
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        // Find review (we'll need to implement getById in Review model)
        const review = await Review.getById ? await Review.getById(id) : null;
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.tourist_user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        await review.delete();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete review'
        });
    }
};