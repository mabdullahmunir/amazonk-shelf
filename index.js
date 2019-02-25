let bodyParser = require('body-parser')
let express = require('express')
let app = express()

app.use(bodyParser.urlencoded({ extended : false}))
app.use(bodyParser.json())

app.post('/open-shelf', function(req, res){
    console.log(req.body)
    res.send(req.body.idBarang);
});

app.listen(process.env.PORT);