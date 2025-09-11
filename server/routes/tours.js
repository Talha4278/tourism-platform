import express from 'express';
import { 
    createTour, 
    getTours, 
    getTour, 
    getMyTours, 
    updateTour, 
    deleteTour, 
    getPopularTours, 
    getDestinations 
} from '../controllers/tourController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getTours);
router.get('/popular', getPopularTours);
router.get('/destinations', getDestinations);
router.get('/:id', getTour);

// Protected routes for agencies only
router.post('/', authenticateToken, requireRole('agency'), createTour);
router.get('/agency/my-tours', authenticateToken, requireRole('agency'), getMyTours);
router.put('/:id', authenticateToken, requireRole('agency'), updateTour);
router.delete('/:id', authenticateToken, requireRole('agency'), deleteTour);

export default router;