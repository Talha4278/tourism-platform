import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, user_type, agency_name, agency_description, agency_services } = req.body;

        // Validation
        if (!name || !email || !password || !user_type) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and user type are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (user_type === 'agency' && !agency_name) {
            return res.status(400).json({
                success: false,
                message: 'Agency name is required for travel agencies'
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            user_type,
            agency_name,
            agency_description,
            agency_services
        });

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to register user'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Get user with profile
        const userWithProfile = await User.findByIdWithProfile(user.id);

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userWithProfile.toJSON()
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to login'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByIdWithProfile(req.user.id);
        
        res.json({
            success: true,
            data: { user: user.toJSON() }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get profile'
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone, agency_name, agency_description, agency_services } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const updatedUser = await req.user.updateProfile({
            name,
            phone,
            agency_name,
            agency_description,
            agency_services
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser.toJSON() }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
};