import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';

export const createBooking = async (req, res) => {
    try {
        const { tour_id, number_of_people, booking_date, special_requests } = req.body;

        // Validation
        if (!tour_id || !number_of_people || !booking_date) {
            return res.status(400).json({
                success: false,
                message: 'Tour ID, number of people, and booking date are required'
            });
        }

        if (number_of_people < 1) {
            return res.status(400).json({
                success: false,
                message: 'Number of people must be at least 1'
            });
        }

        // Get tour details
        const tour = await Tour.getById(tour_id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        if (!tour.is_active) {
            return res.status(400).json({
                success: false,
                message: 'This tour is no longer available'
            });
        }

        if (number_of_people > tour.max_group_size) {
            return res.status(400).json({
                success: false,
                message: `Maximum group size for this tour is ${tour.max_group_size}`
            });
        }

        // Calculate total amount
        const total_amount = tour.price * number_of_people;

        // Create booking
        const bookingData = {
            tourist_user_id: req.user.id,
            tour_id,
            number_of_people: parseInt(number_of_people),
            booking_date,
            total_amount,
            special_requests,
            status: 'pending'
        };

        const booking = await Booking.create(bookingData);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: { booking }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.getByTourist(req.user.id);

        res.json({
            success: true,
            data: { bookings }
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get bookings'
        });
    }
};

export const getAgencyBookings = async (req, res) => {
    try {
        const bookings = await Booking.getByAgency(req.user.id);

        res.json({
            success: true,
            data: { bookings }
        });
    } catch (error) {
        console.error('Get agency bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get bookings'
        });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (pending, confirmed, completed, cancelled)'
            });
        }

        // Get booking
        const booking = await Booking.getById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user can update this booking
        const canUpdate = req.user.user_type === 'agency' && 
                         booking.tours && booking.tours.agency_user_id === req.user.id;

        if (!canUpdate && booking.tourist_user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own bookings'
            });
        }

        // Tourists can only cancel their bookings
        if (req.user.user_type === 'tourist' && status !== 'cancelled') {
            return res.status(403).json({
                success: false,
                message: 'Tourists can only cancel bookings'
            });
        }

        const updatedBooking = await booking.updateStatus(status);

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: { booking: updatedBooking }
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update booking status'
        });
    }
};

export const getBookingStats = async (req, res) => {
    try {
        const stats = await Booking.getStats(req.user.id);

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get booking statistics'
        });
    }
};

export const getRecentBookings = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const bookings = await Booking.getRecentByAgency(req.user.id, limit);

        res.json({
            success: true,
            data: { bookings }
        });
    } catch (error) {
        console.error('Get recent bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get recent bookings'
        });
    }
};