import knex from 'knex';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create SQLite database connection
export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: join(__dirname, '..', 'database.sqlite')
  },
  useNullAsDefault: true,
  migrations: {
    directory: join(__dirname, '..', 'migrations')
  }
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing SQLite database...');
    
    // Create users table
    const hasUsersTable = await db.schema.hasTable('users');
    if (!hasUsersTable) {
      await db.schema.createTable('users', (table) => {
        table.string('id').primary().defaultTo(db.raw('(lower(hex(randomblob(16))))'));
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('phone');
        table.enu('user_type', ['tourist', 'agency']).notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Created users table');
    }

    // Create agency_profiles table
    const hasAgencyProfilesTable = await db.schema.hasTable('agency_profiles');
    if (!hasAgencyProfilesTable) {
      await db.schema.createTable('agency_profiles', (table) => {
        table.string('id').primary().defaultTo(db.raw('(lower(hex(randomblob(16))))'));
        table.string('user_id').notNullable();
        table.string('agency_name').notNullable();
        table.text('description');
        table.text('services');
        table.timestamps(true, true);
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.unique(['user_id']);
      });
      console.log('✅ Created agency_profiles table');
    }

    // Create tours table
    const hasToursTable = await db.schema.hasTable('tours');
    if (!hasToursTable) {
      await db.schema.createTable('tours', (table) => {
        table.string('id').primary().defaultTo(db.raw('(lower(hex(randomblob(16))))'));
        table.string('agency_user_id').notNullable();
        table.string('title').notNullable();
        table.string('destination').notNullable();
        table.text('description').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.integer('duration').notNullable();
        table.integer('max_group_size').notNullable();
        table.enu('category', ['adventure', 'cultural', 'wildlife', 'relaxation', 'food', 'historical']).defaultTo('adventure');
        table.text('includes');
        table.string('image_url');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
        table.foreign('agency_user_id').references('id').inTable('users').onDelete('CASCADE');
      });
      console.log('✅ Created tours table');
    }

    // Create bookings table
    const hasBookingsTable = await db.schema.hasTable('bookings');
    if (!hasBookingsTable) {
      await db.schema.createTable('bookings', (table) => {
        table.string('id').primary().defaultTo(db.raw('(lower(hex(randomblob(16))))'));
        table.string('tourist_user_id').notNullable();
        table.string('tour_id').notNullable();
        table.integer('number_of_people').notNullable();
        table.date('booking_date').notNullable();
        table.decimal('total_amount', 10, 2).notNullable();
        table.text('special_requests');
        table.enu('status', ['pending', 'confirmed', 'completed', 'cancelled']).defaultTo('pending');
        table.timestamps(true, true);
        table.foreign('tourist_user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('tour_id').references('id').inTable('tours').onDelete('CASCADE');
      });
      console.log('✅ Created bookings table');
    }

    // Create reviews table
    const hasReviewsTable = await db.schema.hasTable('reviews');
    if (!hasReviewsTable) {
      await db.schema.createTable('reviews', (table) => {
        table.string('id').primary().defaultTo(db.raw('(lower(hex(randomblob(16))))'));
        table.string('tourist_user_id').notNullable();
        table.string('tour_id').notNullable();
        table.integer('rating').notNullable();
        table.text('comment').notNullable();
        table.timestamps(true, true);
        table.foreign('tourist_user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('tour_id').references('id').inTable('tours').onDelete('CASCADE');
        table.unique(['tourist_user_id', 'tour_id']);
      });
      console.log('✅ Created reviews table');
    }

    // Create indexes for better performance
    await createIndexes();
    
    console.log('🎉 SQLite database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

async function createIndexes() {
  try {
    // Check if indexes exist before creating them
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_tours_agency_user_id ON tours(agency_user_id)',
      'CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination)',
      'CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category)',
      'CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_tourist_user_id ON bookings(tourist_user_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_tourist_user_id ON reviews(tourist_user_id)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_tour_id ON reviews(tour_id)'
    ];

    for (const query of indexQueries) {
      await db.raw(query);
    }
    
    console.log('✅ Created database indexes');
  } catch (error) {
    console.log('⚠️ Some indexes may already exist:', error.message);
  }
}

export default db;
