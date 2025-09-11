import db from '../config/sqlite.js';
import { randomBytes } from 'crypto';

export class Review {
    constructor(reviewData) {
        Object.assign(this, reviewData);
    }

    // Create new review
    static async create(reviewData) {
        try {
            const reviewId = randomBytes(16).toString('hex');
            const reviewWithId = {
                id: reviewId,
                ...reviewData,
                created_at: new Date(),
                updated_at: new Date()
            };

            await db('reviews').insert(reviewWithId);
            const review = await db('reviews').where('id', reviewId).first();
            return new Review(review);
        } catch (error) {
            throw new Error(`Failed to create review: ${error.message}`);
        }
    }

    // Get reviews by tour
    static async getByTour(tourId) {
        try {
            const reviews = await db('reviews')
                .join('users', 'reviews.tourist_user_id', 'users.id')
                .select(
                    'reviews.*',
                    'users.name as user_name'
                )
                .where('reviews.tour_id', tourId)
                .orderBy('reviews.created_at', 'desc');

            return reviews.map(review => {
                // Format to match expected structure
                review.users = {
                    name: review.user_name
                };
                delete review.user_name;
                return new Review(review);
            });
        } catch (error) {
            throw new Error(`Failed to get tour reviews: ${error.message}`);
        }
    }

    // Get reviews by tourist
    static async getByTourist(touristId) {
        try {
            const reviews = await db('reviews')
                .join('tours', 'reviews.tour_id', 'tours.id')
                .select(
                    'reviews.*',
                    'tours.title as tour_title',
                    'tours.destination as tour_destination'
                )
                .where('reviews.tourist_user_id', touristId)
                .orderBy('reviews.created_at', 'desc');

            return reviews.map(review => {
                // Format to match expected structure
                review.tours = {
                    title: review.tour_title,
                    destination: review.tour_destination
                };
                delete review.tour_title;
                delete review.tour_destination;
                return new Review(review);
            });
        } catch (error) {
            throw new Error(`Failed to get tourist reviews: ${error.message}`);
        }
    }

    // Get review by tourist and tour (to check if already reviewed)
    static async getByTouristAndTour(touristId, tourId) {
        try {
            const review = await db('reviews')
                .where('tourist_user_id', touristId)
                .where('tour_id', tourId)
                .first();

            return review ? new Review(review) : null;
        } catch (error) {
            throw new Error(`Failed to get review: ${error.message}`);
        }
    }

    // Get tour rating statistics
    static async getTourRating(tourId) {
        try {
            const stats = await db('reviews')
                .where('tour_id', tourId)
                .select(
                    db.raw('COUNT(*) as count'),
                    db.raw('AVG(rating) as average'),
                    db.raw('SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star'),
                    db.raw('SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star'),
                    db.raw('SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star'),
                    db.raw('SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star'),
                    db.raw('SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star')
                )
                .first();

            return {
                count: parseInt(stats.count) || 0,
                average: parseFloat(stats.average) || 0,
                distribution: {
                    5: parseInt(stats.five_star) || 0,
                    4: parseInt(stats.four_star) || 0,
                    3: parseInt(stats.three_star) || 0,
                    2: parseInt(stats.two_star) || 0,
                    1: parseInt(stats.one_star) || 0
                }
            };
        } catch (error) {
            throw new Error(`Failed to get tour rating: ${error.message}`);
        }
    }

    // Get agency rating statistics
    static async getAgencyRating(agencyUserId) {
        try {
            const stats = await db('reviews')
                .join('tours', 'reviews.tour_id', 'tours.id')
                .where('tours.agency_user_id', agencyUserId)
                .select(
                    db.raw('COUNT(*) as count'),
                    db.raw('AVG(rating) as average')
                )
                .first();

            return {
                count: parseInt(stats.count) || 0,
                average: parseFloat(stats.average) || 0
            };
        } catch (error) {
            throw new Error(`Failed to get agency rating: ${error.message}`);
        }
    }

    // Update review
    async update(updateData) {
        try {
            await db('reviews')
                .where('id', this.id)
                .update({
                    ...updateData,
                    updated_at: new Date()
                });

            Object.assign(this, updateData);
            return this;
        } catch (error) {
            throw new Error(`Failed to update review: ${error.message}`);
        }
    }

    // Delete review
    async delete() {
        try {
            await db('reviews')
                .where('id', this.id)
                .delete();

            return true;
        } catch (error) {
            throw new Error(`Failed to delete review: ${error.message}`);
        }
    }

    // Get recent reviews for agency
    static async getRecentByAgency(agencyUserId, limit = 10) {
        try {
            const reviews = await db('reviews')
                .join('tours', 'reviews.tour_id', 'tours.id')
                .join('users', 'reviews.tourist_user_id', 'users.id')
                .select(
                    'reviews.*',
                    'tours.title as tour_title',
                    'users.name as tourist_name'
                )
                .where('tours.agency_user_id', agencyUserId)
                .orderBy('reviews.created_at', 'desc')
                .limit(limit);

            return reviews.map(review => {
                // Format to match expected structure
                review.tours = {
                    title: review.tour_title
                };
                review.users = {
                    name: review.tourist_name
                };
                delete review.tour_title;
                delete review.tourist_name;
                return new Review(review);
            });
        } catch (error) {
            throw new Error(`Failed to get recent reviews: ${error.message}`);
        }
    }
}

export default Review;