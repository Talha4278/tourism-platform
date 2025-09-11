import express from 'express';
import { 
    createBooking, 
    getMyBookings, 
    getAgencyBookings, 
    updateBookingStatus, 
    getBookingStats, 
    getRecentBookings 
} from '../controllers/bookingController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Tourist routes
router.post('/', authenticateToken, requireRole('tourist'), createBooking);
router.get('/my-bookings', authenticateToken, requireRole('tourist'), getMyBookings);

// Agency routes
router.get('/agency/bookings', authenticateToken, requireRole('agency'), getAgencyBookings);
router.get('/agency/stats', authenticateToken, requireRole('agency'), getBookingStats);
router.get('/agency/recent', authenticateToken, requireRole('agency'), getRecentBookings);

// Shared routes (both tourists and agencies can update status)
router.put('/:id/status', authenticateToken, updateBookingStatus);

export default router;