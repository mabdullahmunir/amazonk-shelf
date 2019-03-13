const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('test ci');
});

app.post('/open-shelf', function(req, res) {
  console.log(req.body);
  res.status(200).send({
    status: 'OK',
  });
});

const server = app.listen(process.env.PORT, () => {
  console.log('App running on port ' + process.env.PORT);
});

module.exports = server;
