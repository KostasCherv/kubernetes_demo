// Initialize OpenTelemetry FIRST, before any other imports
require('./telemetry')

const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

const axios = require('axios')

// CORS middleware - allow all origins for demo (restrict in production)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})


// Load service host addresses from environment variables, with defaults for local development
const AUTH_SERVICE_HOST = process.env.AUTH_SERVICE_HOST || 'http://localhost:3001'
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST || 'http://localhost:3002'
const PRODUCT_SERVICE_HOST = process.env.PRODUCT_SERVICE_HOST || 'http://localhost:3003'

// Auth Service Proxy
app.post('/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_HOST}/login`, req.body)
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message })
  }
})

app.get('/auth/validate', async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_HOST}/validate`, { headers: req.headers })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message })
  }
})

// User Service Proxy
app.use('/users', async (req, res) => {
  try {
    // Preserve the full path including /users
    const serviceUrl = `${USER_SERVICE_HOST}${req.originalUrl}`
    const method = req.method.toLowerCase()
    const response = await axios({
      method,
      url: serviceUrl,
      data: req.body,
      headers: req.headers,
      params: req.query
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message })
  }
})

// Product Service Proxy
app.use('/products', async (req, res) => {
  try {
    // Preserve the full path including /products
    const serviceUrl = `${PRODUCT_SERVICE_HOST}${req.originalUrl}`
    const method = req.method.toLowerCase()
    const response = await axios({
      method,
      url: serviceUrl,
      data: req.body,
      headers: req.headers,
      params: req.query
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`)
})
