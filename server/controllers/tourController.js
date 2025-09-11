import Tour from '../models/Tour.js';
import Review from '../models/Review.js';

export const createTour = async (req, res) => {
    try {
        const { title, destination, description, price, duration, max_group_size, category, includes, image_url } = req.body;

        // Validation
        if (!title || !destination || !description || !price || !duration || !max_group_size) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (price < 0 || duration < 1 || max_group_size < 1) {
            return res.status(400).json({
                success: false,
                message: 'Price, duration, and group size must be positive numbers'
            });
        }

        // Create tour
        const tourData = {
            agency_user_id: req.user.id,
            title,
            destination,
            description,
            price: parseFloat(price),
            duration: parseInt(duration),
            max_group_size: parseInt(max_group_size),
            category: category || 'adventure',
            includes,
            image_url,
            is_active: true
        };

        const tour = await Tour.create(tourData);

        res.status(201).json({
            success: true,
            message: 'Tour created successfully',
            data: { tour }
        });
    } catch (error) {
        console.error('Create tour error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create tour'
        });
    }
};

export const getTours = async (req, res) => {
    try {
        const { destination, maxPrice, category, duration } = req.query;

        const filters = {};
        if (destination) filters.destination = destination;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (category) filters.category = category;
        if (duration) filters.duration = duration;

        const tours = await Tour.getAll(filters);

        res.json({
            success: true,
            data: { tours }
        });
    } catch (error) {
        console.error('Get tours error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get tours'
        });
    }
};

export const getTour = async (req, res) => {
    try {
        const { id } = req.params;
        
        const tour = await Tour.getById(id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        // Get reviews for the tour
        const reviews = await Review.getByTour(id);
        const rating = await Review.getTourRating(id);

        res.json({
            success: true,
            data: { 
                tour,
                reviews,
                rating
            }
        });
    } catch (error) {
        console.error('Get tour error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get tour'
        });
    }
};

export const getMyTours = async (req, res) => {
    try {
        const tours = await Tour.getByAgency(req.user.id);

        res.json({
            success: true,
            data: { tours }
        });
    } catch (error) {
        console.error('Get my tours error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get tours'
        });
    }
};

export const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, destination, description, price, duration, max_group_size, category, includes, image_url } = req.body;

        // Find tour
        const tour = await Tour.getById(id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        // Check ownership
        if (tour.agency_user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own tours'
            });
        }

        // Validation
        if (price && price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        if (duration && duration < 1) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be at least 1 day'
            });
        }

        if (max_group_size && max_group_size < 1) {
            return res.status(400).json({
                success: false,
                message: 'Group size must be at least 1'
            });
        }

        // Update tour
        const updateData = {};
        if (title) updateData.title = title;
        if (destination) updateData.destination = destination;
        if (description) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (duration) updateData.duration = parseInt(duration);
        if (max_group_size) updateData.max_group_size = parseInt(max_group_size);
        if (category) updateData.category = category;
        if (includes) updateData.includes = includes;
        if (image_url) updateData.image_url = image_url;

        const updatedTour = await tour.update(updateData);

        res.json({
            success: true,
            message: 'Tour updated successfully',
            data: { tour: updatedTour }
        });
    } catch (error) {
        console.error('Update tour error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update tour'
        });
    }
};

export const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;

        // Find tour
        const tour = await Tour.getById(id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        // Check ownership
        if (tour.agency_user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own tours'
            });
        }

        // Soft delete tour
        await tour.delete();

        res.json({
            success: true,
            message: 'Tour deleted successfully'
        });
    } catch (error) {
        console.error('Delete tour error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete tour'
        });
    }
};

export const getPopularTours = async (req, res) => {
    try {
        const tours = await Tour.getPopular(6);

        res.json({
            success: true,
            data: { tours }
        });
    } catch (error) {
        console.error('Get popular tours error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get popular tours'
        });
    }
};

export const getDestinations = async (req, res) => {
    try {
        const destinations = await Tour.getDestinations();

        res.json({
            success: true,
            data: { destinations }
        });
    } catch (error) {
        console.error('Get destinations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get destinations'
        });
    }
};