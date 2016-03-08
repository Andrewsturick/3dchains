var express = require('express')
var morgan = require('morgan')
var bodyParser = require('body-parser')
require('dotenv').config()

var PORT = process.env.PORT || 3001
var app = express()

app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', 'templates')
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser({extended: true}))

app.get('/', function(req, res){
  res.render('index')
})


app.listen(PORT, function(){
  console.log(PORT)
})
