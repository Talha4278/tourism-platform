import db from '../config/sqlite.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export class User {
    constructor(userData) {
        Object.assign(this, userData);
    }

    // Create new user
    static async create(userData) {
        const trx = await db.transaction();
        try {
            const { name, email, password, phone, user_type, agency_name, agency_description, agency_services } = userData;
            
            // Generate unique ID
            const userId = randomBytes(16).toString('hex');
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            
            // Insert user
            await trx('users').insert({
                id: userId,
                name,
                email,
                password: hashedPassword,
                phone,
                user_type,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Get the created user
            const user = await trx('users').where('id', userId).first();

            // If agency/guide, create profile
            if (user_type === 'agency') {
                await trx('agency_profiles').insert({
                    id: randomBytes(16).toString('hex'),
                    user_id: userId,
                    agency_name,
                    description: agency_description,
                    services: agency_services,
                    created_at: new Date(),
                    updated_at: new Date()
                });
            }

            await trx.commit();
            return new User(user);
        } catch (error) {
            await trx.rollback();
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const user = await db('users').where('email', email).first();
            return user ? new User(user) : null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    // Find user by ID with profile
    static async findByIdWithProfile(userId) {
        try {
            const user = await db('users')
                .leftJoin('agency_profiles', 'users.id', 'agency_profiles.user_id')
                .select(
                    'users.*',
                    'agency_profiles.agency_name',
                    'agency_profiles.description as agency_description',
                    'agency_profiles.services as agency_services'
                )
                .where('users.id', userId)
                .first();

            if (!user) return null;

            // Format the result to match expected structure
            if (user.agency_name) {
                user.agency_profiles = {
                    agency_name: user.agency_name,
                    description: user.agency_description,
                    services: user.agency_services
                };
                delete user.agency_name;
                delete user.agency_description;
                delete user.agency_services;
            }

            return new User(user);
        } catch (error) {
            throw new Error(`Failed to find user with profile: ${error.message}`);
        }
    }

    // Update user profile
    async updateProfile(updateData) {
        const trx = await db.transaction();
        try {
            const { name, phone, agency_name, agency_description, agency_services } = updateData;
            
            // Update user basic info
            await trx('users')
                .where('id', this.id)
                .update({ 
                    name, 
                    phone, 
                    updated_at: new Date() 
                });

            // Update agency profile if applicable
            if (this.user_type === 'agency' && (agency_name || agency_description || agency_services)) {
                const existingProfile = await trx('agency_profiles').where('user_id', this.id).first();
                
                if (existingProfile) {
                    await trx('agency_profiles')
                        .where('user_id', this.id)
                        .update({
                            agency_name,
                            description: agency_description,
                            services: agency_services,
                            updated_at: new Date()
                        });
                } else {
                    await trx('agency_profiles').insert({
                        id: randomBytes(16).toString('hex'),
                        user_id: this.id,
                        agency_name,
                        description: agency_description,
                        services: agency_services,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
            }

            await trx.commit();
            
            // Update local instance
            Object.assign(this, updateData);
            return this;
        } catch (error) {
            await trx.rollback();
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }

    // Validate password
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }

    // Get user data without password
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

export default User;