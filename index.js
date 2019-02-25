let express = require('express')
let app = express()

app.get('/open-shelf', function(req, res){
    res.send("Yeet, son");
});

app.listen(3000);
