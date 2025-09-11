import db from '../config/sqlite.js';
import { randomBytes } from 'crypto';

export class Booking {
    constructor(bookingData) {
        Object.assign(this, bookingData);
    }

    // Create new booking
    static async create(bookingData) {
        try {
            const bookingId = randomBytes(16).toString('hex');
            const bookingWithId = {
                id: bookingId,
                ...bookingData,
                created_at: new Date(),
                updated_at: new Date()
            };

            await db('bookings').insert(bookingWithId);
            const booking = await db('bookings').where('id', bookingId).first();
            return new Booking(booking);
        } catch (error) {
            throw new Error(`Failed to create booking: ${error.message}`);
        }
    }

    // Get bookings by tourist
    static async getByTourist(touristId) {
        try {
            const bookings = await db('bookings')
                .join('tours', 'bookings.tour_id', 'tours.id')
                .join('users', 'tours.agency_user_id', 'users.id')
                .leftJoin('agency_profiles', 'users.id', 'agency_profiles.user_id')
                .select(
                    'bookings.*',
                    'tours.title as tour_title',
                    'tours.destination as tour_destination',
                    'tours.image_url as tour_image_url',
                    'tours.price as tour_price',
                    'users.name as agency_name',
                    'agency_profiles.agency_name as agency_company_name'
                )
                .where('bookings.tourist_user_id', touristId)
                .orderBy('bookings.created_at', 'desc');

            return bookings.map(booking => {
                // Format to match expected structure
                booking.tours = {
                    title: booking.tour_title,
                    destination: booking.tour_destination,
                    image_url: booking.tour_image_url,
                    price: booking.tour_price
                };
                booking.users = {
                    name: booking.agency_name,
                    agency_profiles: booking.agency_company_name ? { agency_name: booking.agency_company_name } : null
                };
                
                // Clean up
                delete booking.tour_title;
                delete booking.tour_destination;
                delete booking.tour_image_url;
                delete booking.tour_price;
                delete booking.agency_name;
                delete booking.agency_company_name;
                
                return new Booking(booking);
            });
        } catch (error) {
            throw new Error(`Failed to get tourist bookings: ${error.message}`);
        }
    }

    // Get bookings by agency
    static async getByAgency(agencyUserId) {
        try {
            const bookings = await db('bookings')
                .join('tours', 'bookings.tour_id', 'tours.id')
                .join('users', 'bookings.tourist_user_id', 'users.id')
                .select(
                    'bookings.*',
                    'tours.title as tour_title',
                    'tours.destination as tour_destination',
                    'tours.image_url as tour_image_url',
                    'users.name as tourist_name'
                )
                .where('tours.agency_user_id', agencyUserId)
                .orderBy('bookings.created_at', 'desc');

            return bookings.map(booking => {
                // Format to match expected structure
                booking.tours = {
                    title: booking.tour_title,
                    destination: booking.tour_destination,
                    image_url: booking.tour_image_url
                };
                booking.users = {
                    name: booking.tourist_name
                };
                
                // Clean up
                delete booking.tour_title;
                delete booking.tour_destination;
                delete booking.tour_image_url;
                delete booking.tourist_name;
                
                return new Booking(booking);
            });
        } catch (error) {
            throw new Error(`Failed to get agency bookings: ${error.message}`);
        }
    }

    // Get booking by ID
    static async getById(id) {
        try {
            const booking = await db('bookings')
                .join('tours', 'bookings.tour_id', 'tours.id')
                .join('users as tourist', 'bookings.tourist_user_id', 'tourist.id')
                .join('users as agency', 'tours.agency_user_id', 'agency.id')
                .leftJoin('agency_profiles', 'agency.id', 'agency_profiles.user_id')
                .select(
                    'bookings.*',
                    'tours.title as tour_title',
                    'tours.destination as tour_destination',
                    'tours.image_url as tour_image_url',
                    'tours.price as tour_price',
                    'tourist.name as tourist_name',
                    'agency.name as agency_name',
                    'agency_profiles.agency_name as agency_company_name'
                )
                .where('bookings.id', id)
                .first();

            if (!booking) return null;

            // Format to match expected structure
            booking.tours = {
                title: booking.tour_title,
                destination: booking.tour_destination,
                image_url: booking.tour_image_url,
                price: booking.tour_price
            };
            booking.tourist = {
                name: booking.tourist_name
            };
            booking.agency = {
                name: booking.agency_name,
                agency_profiles: booking.agency_company_name ? { agency_name: booking.agency_company_name } : null
            };
            
            // Clean up
            delete booking.tour_title;
            delete booking.tour_destination;
            delete booking.tour_image_url;
            delete booking.tour_price;
            delete booking.tourist_name;
            delete booking.agency_name;
            delete booking.agency_company_name;

            return new Booking(booking);
        } catch (error) {
            throw new Error(`Failed to get booking: ${error.message}`);
        }
    }

    // Update booking status
    async updateStatus(status) {
        try {
            await db('bookings')
                .where('id', this.id)
                .update({
                    status,
                    updated_at: new Date()
                });

            this.status = status;
            return this;
        } catch (error) {
            throw new Error(`Failed to update booking status: ${error.message}`);
        }
    }

    // Cancel booking
    async cancel() {
        try {
            await db('bookings')
                .where('id', this.id)
                .update({
                    status: 'cancelled',
                    updated_at: new Date()
                });

            this.status = 'cancelled';
            return this;
        } catch (error) {
            throw new Error(`Failed to cancel booking: ${error.message}`);
        }
    }

    // Get booking statistics for agency
    static async getStats(agencyUserId) {
        try {
            // Get booking statistics
            const bookingStats = await db('bookings')
                .join('tours', 'bookings.tour_id', 'tours.id')
                .where('tours.agency_user_id', agencyUserId)
                .select(
                    db.raw('COUNT(*) as total_bookings'),
                    db.raw('SUM(total_amount) as total_revenue'),
                    db.raw('COUNT(CASE WHEN status = "confirmed" THEN 1 END) as confirmed_bookings'),
                    db.raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_bookings')
                )
                .first();

            // Get average rating for agency tours
            const ratingStats = await db('reviews')
                .join('tours', 'reviews.tour_id', 'tours.id')
                .where('tours.agency_user_id', agencyUserId)
                .select(db.raw('AVG(rating) as average_rating'))
                .first();

            // Get active tours count
            const activeTours = await db('tours')
                .where('agency_user_id', agencyUserId)
                .where('is_active', true)
                .count('id as count')
                .first();

            return {
                total_bookings: parseInt(bookingStats.total_bookings) || 0,
                total_revenue: parseFloat(bookingStats.total_revenue) || 0,
                confirmed_bookings: parseInt(bookingStats.confirmed_bookings) || 0,
                pending_bookings: parseInt(bookingStats.pending_bookings) || 0,
                average_rating: parseFloat(ratingStats.average_rating) || 0,
                active_tours: parseInt(activeTours.count) || 0
            };
        } catch (error) {
            throw new Error(`Failed to get booking stats: ${error.message}`);
        }
    }

    // Get recent bookings for agency
    static async getRecentByAgency(agencyUserId, limit = 10) {
        try {
            const bookings = await db('bookings')
                .join('tours', 'bookings.tour_id', 'tours.id')
                .join('users', 'bookings.tourist_user_id', 'users.id')
                .select(
                    'bookings.*',
                    'tours.title as tour_title',
                    'tours.destination as tour_destination',
                    'users.name as tourist_name'
                )
                .where('tours.agency_user_id', agencyUserId)
                .orderBy('bookings.created_at', 'desc')
                .limit(limit);

            return bookings.map(booking => {
                // Format to match expected structure
                booking.tours = {
                    title: booking.tour_title,
                    destination: booking.tour_destination
                };
                booking.users = {
                    name: booking.tourist_name
                };
                
                // Clean up
                delete booking.tour_title;
                delete booking.tour_destination;
                delete booking.tourist_name;
                
                return new Booking(booking);
            });
        } catch (error) {
            throw new Error(`Failed to get recent bookings: ${error.message}`);
        }
    }
}

export default Booking;
