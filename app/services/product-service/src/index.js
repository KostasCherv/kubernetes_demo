const express = require('express')
const app = express()
const port = 3000

const products = []

app.post('/products', (req, res) => {
  products.push(req.body)
  res.json(req.body)
})

app.get('/products/:id', (req, res) => {
  const product = products.find(product => product.id === req.params.id)
  res.json(product)
})

app.get('/products', (req, res) => {
  res.json(products)
})

app.put('/products/:id', (req, res) => {
  const product = products.find(product => product.id === req.params.id)
  product.name = req.body.name
  res.json(product)
})



app.listen(port, () => {
  console.log(`Product service listening on port ${port}`)
})
