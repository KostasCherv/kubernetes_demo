// Initialize OpenTelemetry FIRST, before any other imports
require('./telemetry')

const express = require('express')
const { Pool } = require('pg')
const app = express()
const port = 3000

// Database connection
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'postgres',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'microservices_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres123'
})

// Initialize database table on startup
// Note: Table is created by auth-service, we just verify it exists
async function initializeDatabase() {
  try {
    // Table already exists from auth-service, just verify connection
    await pool.query('SELECT 1 FROM users LIMIT 1')
    console.log('Users table verified')
  } catch (error) {
    console.error('Database initialization error:', error.message)
  }
}

// Initialize database on startup
initializeDatabase()

// Middleware
app.use(express.json())

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1')
    res.status(200).json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: error.message })
  }
})

// Get all users (exclude password from response)
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user by ID (exclude password from response)
app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create user (password is optional, can be set by auth-service)
app.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }
    // Use default password if not provided (should be changed via auth-service)
    const defaultPassword = password || 'changeme'
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email || null, defaultPassword]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Username or email already exists' })
    }
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user (only email, username and password should be changed via auth-service)
app.put('/users/:id', async (req, res) => {
  try {
    const { email } = req.body
    const result = await pool.query(
      'UPDATE users SET email = COALESCE($1, email) WHERE id = $2 RETURNING id, username, email, created_at',
      [email, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' })
    }
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(204).send()
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`User service listening on port ${port}`)
  console.log(`Database: ${process.env.DATABASE_HOST || 'postgres'}:${process.env.DATABASE_PORT || 5432}`)
})
