const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database.');
});

module.exports = pool;