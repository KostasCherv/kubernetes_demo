const express = require('express')
const app = express()
const port = 3000

app.post('/login', (req, res) => {
  res.json({ token: '1234567890' })
})

app.get('/validate', (req, res) => {
  res.json({ valid: true })
})

app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`)
})
