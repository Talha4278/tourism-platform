import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing. Please set up Supabase connection.');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database initialization
export async function initializeDatabase() {
    try {
        // Test connection
        const { data, error } = await supabase.from('users').select('id').limit(1);
        
        if (error && error.code === '42P01') {
            console.log('Database tables not found. Please run migrations.');
            return false;
        }
        
        console.log('Database connection established successfully');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
}

export default supabase;