let express = require('express')
let app = express()

app.post('/open-shelf', function(req, res){
    res.send(JSON.parse(req.body).idBarang);
});

app.listen(process.env.PORT);
