const express = require('express')
const app = express()
const port = 3000

const users = []

app.post('/users', (req, res) => {
  users.push(req.body)
  res.json(req.body)
})

app.get('/users/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id)
  res.json(user)
})

app.get('/users', (req, res) => {
  res.json(users)
})

app.put('/users/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id)
  user.name = req.body.name
  res.json(user)
})



app.listen(port, () => {
  console.log(`User service listening on port ${port}`)
})
