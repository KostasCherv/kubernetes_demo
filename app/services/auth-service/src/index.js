// Initialize OpenTelemetry FIRST, before any other imports
require('./telemetry')

const express = require('express')
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')
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

// JWT Secret (in production, use a proper secret from ConfigMap/Secret)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Initialize database table on startup
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Database table initialized')

    // Insert a default test user if it doesn't exist
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', ['testuser'])
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
        ['testuser', 'testpass123', 'test@example.com']
      )
      console.log('Default test user created: testuser / testpass123')
    }
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

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Query user from database
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE username = $1 AND password = $2',
      [username, password]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Validate token endpoint
app.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ valid: false, error: 'No token provided' })
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Optionally verify user still exists in database
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [decoded.userId])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ valid: false, error: 'User not found' })
    }

    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username
      }
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' })
    }
    console.error('Validate error:', error)
    res.status(500).json({ valid: false, error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`)
  console.log(`Database: ${process.env.DATABASE_HOST || 'postgres'}:${process.env.DATABASE_PORT || 5432}`)
})
