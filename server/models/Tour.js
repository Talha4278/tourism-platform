import db from '../config/sqlite.js';
import { randomBytes } from 'crypto';

export class Tour {
    constructor(tourData) {
        Object.assign(this, tourData);
    }

    // Create new tour
    static async create(tourData) {
        try {
            const tourId = randomBytes(16).toString('hex');
            const tourWithId = {
                id: tourId,
                ...tourData,
                created_at: new Date(),
                updated_at: new Date()
            };

            await db('tours').insert(tourWithId);
            const tour = await db('tours').where('id', tourId).first();
            return new Tour(tour);
        } catch (error) {
            throw new Error(`Failed to create tour: ${error.message}`);
        }
    }

    // Get all tours with agency info
    static async getAll(filters = {}) {
        try {
            let query = db('tours')
                .join('users', 'tours.agency_user_id', 'users.id')
                .leftJoin('agency_profiles', 'users.id', 'agency_profiles.user_id')
                .select(
                    'tours.*',
                    'users.name as user_name',
                    'agency_profiles.agency_name'
                )
                .where('tours.is_active', true);

            // Apply filters
            if (filters.destination) {
                query = query.where('tours.destination', 'like', `%${filters.destination}%`);
            }
            if (filters.maxPrice) {
                query = query.where('tours.price', '<=', parseFloat(filters.maxPrice));
            }
            if (filters.category) {
                query = query.where('tours.category', filters.category);
            }
            if (filters.duration) {
                if (filters.duration === '1') {
                    query = query.where('tours.duration', 1);
                } else if (filters.duration === '2-3') {
                    query = query.whereBetween('tours.duration', [2, 3]);
                } else if (filters.duration === '4-7') {
                    query = query.whereBetween('tours.duration', [4, 7]);
                } else if (filters.duration === '7+') {
                    query = query.where('tours.duration', '>=', 8);
                }
            }

            const tours = await query.orderBy('tours.created_at', 'desc');

            return tours.map(tour => {
                // Format to match expected structure
                tour.users = {
                    name: tour.user_name,
                    agency_profiles: tour.agency_name ? { agency_name: tour.agency_name } : null
                };
                delete tour.user_name;
                delete tour.agency_name;
                return new Tour(tour);
            });
        } catch (error) {
            throw new Error(`Failed to get tours: ${error.message}`);
        }
    }

    // Get tours by agency
    static async getByAgency(agencyUserId) {
        try {
            const tours = await db('tours')
                .where('agency_user_id', agencyUserId)
                .orderBy('created_at', 'desc');

            return tours.map(tour => new Tour(tour));
        } catch (error) {
            throw new Error(`Failed to get agency tours: ${error.message}`);
        }
    }

    // Get tour by ID
    static async getById(id) {
        try {
            const tour = await db('tours')
                .join('users', 'tours.agency_user_id', 'users.id')
                .leftJoin('agency_profiles', 'users.id', 'agency_profiles.user_id')
                .select(
                    'tours.*',
                    'users.name as user_name',
                    'agency_profiles.agency_name'
                )
                .where('tours.id', id)
                .first();

            if (!tour) return null;

            // Format to match expected structure
            tour.users = {
                name: tour.user_name,
                agency_profiles: tour.agency_name ? { agency_name: tour.agency_name } : null
            };
            delete tour.user_name;
            delete tour.agency_name;

            return new Tour(tour);
        } catch (error) {
            throw new Error(`Failed to get tour: ${error.message}`);
        }
    }

    // Update tour
    async update(updateData) {
        try {
            await db('tours')
                .where('id', this.id)
                .update({
                    ...updateData,
                    updated_at: new Date()
                });

            Object.assign(this, updateData);
            return this;
        } catch (error) {
            throw new Error(`Failed to update tour: ${error.message}`);
        }
    }

    // Delete tour (soft delete)
    async delete() {
        try {
            await db('tours')
                .where('id', this.id)
                .update({ 
                    is_active: false,
                    updated_at: new Date()
                });

            this.is_active = false;
            return this;
        } catch (error) {
            throw new Error(`Failed to delete tour: ${error.message}`);
        }
    }

    // Get popular tours (top rated/most booked)
    static async getPopular(limit = 6) {
        try {
            const tours = await db('tours')
                .join('users', 'tours.agency_user_id', 'users.id')
                .leftJoin('agency_profiles', 'users.id', 'agency_profiles.user_id')
                .select(
                    'tours.*',
                    'users.name as user_name',
                    'agency_profiles.agency_name'
                )
                .where('tours.is_active', true)
                .orderBy('tours.created_at', 'desc')
                .limit(limit);

            return tours.map(tour => {
                // Format to match expected structure
                tour.users = {
                    name: tour.user_name,
                    agency_profiles: tour.agency_name ? { agency_name: tour.agency_name } : null
                };
                delete tour.user_name;
                delete tour.agency_name;
                return new Tour(tour);
            });
        } catch (error) {
            throw new Error(`Failed to get popular tours: ${error.message}`);
        }
    }

    // Get unique destinations
    static async getDestinations() {
        try {
            const destinations = await db('tours')
                .select('destination')
                .where('is_active', true)
                .distinct();

            return destinations.map(row => row.destination).sort();
        } catch (error) {
            throw new Error(`Failed to get destinations: ${error.message}`);
        }
    }
}

export default Tour;