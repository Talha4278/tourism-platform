import express from 'express';
import { 
    createReview, 
    getTourReviews, 
    getMyReviews, 
    updateReview, 
    deleteReview 
} from '../controllers/reviewController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/tour/:tour_id', getTourReviews);

// Tourist routes
router.post('/', authenticateToken, requireRole('tourist'), createReview);
router.get('/my-reviews', authenticateToken, requireRole('tourist'), getMyReviews);
router.put('/:id', authenticateToken, requireRole('tourist'), updateReview);
router.delete('/:id', authenticateToken, requireRole('tourist'), deleteReview);

export default router;