

var express = require('express')
var request = require('request')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var app = express();
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
var PORT = 3044


app.get('/', function(req, res){
  request('https://rooftoptrading.firebaseio.com/portfolio/.json?print=pretty&auth=YayP00ChaKmsE8HFhMzaYMr19qmstb3rymdHpL4d',function(error, response, body){
      console.log(JSON.parse(body));
  })

})

app.listen(3044)
