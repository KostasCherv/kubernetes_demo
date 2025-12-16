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
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Products table initialized')
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

// Get all products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, price, created_at FROM products ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, price, created_at FROM products WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create product
app.post('/products', async (req, res) => {
  try {
    const { name, description, price } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const result = await pool.query(
      'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id, name, description, price, created_at',
      [name, description || null, price || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update product
app.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price } = req.body
    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price) WHERE id = $4 RETURNING id, name, description, price, created_at',
      [name, description, price, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(204).send()
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Product service listening on port ${port}`)
  console.log(`Database: ${process.env.DATABASE_HOST || 'postgres'}:${process.env.DATABASE_PORT || 5432}`)
})
