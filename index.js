const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const admin = require('firebase-admin');
const FieldValue = admin.firestore.FieldValue;

const serviceAccount = require('./amazonk-firestore.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://k-72b41.firebaseio.com',
});

const db = admin.firestore();

const openedShelf = {};

app.get('/scoreboard', function(req, res) {
  db.collection('scoreboards').get()
      .then((snapshot) => {
        const scoreboard = [];

        snapshot.forEach((doc) => {
          scoreboard.push({
            email: doc.id,
            date: doc.data().date,
            score: doc.data().score,
          });
        });

        scoreboard.sort(function(a, b) {
          return b.score - a.score;
        });

        res.render('scoreboard.ejs', {scores: scoreboard});
      })
      .catch((err) => {
        console.log('Error getting documents', err);
      });
});

app.post('/add-score', function(req, res) {
  if (req.body.date != undefined
    && req.body.score != undefined
    && req.body.email != undefined) {
    db.collection('scoreboards').doc(req.body.email).set({
      date: req.body.date,
      score: req.body.score,
    });

    console.log(req.body);

    res.status(200).send({
      status: 'OK'
    });
  } else {
    res.status(200).send({
      status: 'Wrong Parameter',
    });
  }
});

app.post('/add-voucher', function(req, res) {
  if (req.body.email != undefined) {
    const topic = req.body.email.replace(/[@+]/, '').replace('.', '');
    const docRef = db.collection('vouchers').doc(req.body.email);

    console.log(topic);

    const message = {
      notification: {
        title: 'Got Voucher',
        body: 'You get voucher from AmazonkGame',
      },
      topic: topic,
    };

    docRef.get().then(function(doc) {
      if (doc.exists) {
        if (doc.data().gamevoucher == undefined) {
          docRef.update({
            voucherList: FieldValue.arrayUnion({
              kodeVoucher: 'gameVoucher',
              potongan: 50000,
              used: false,
            }),
            gamevoucher: true,
          }, );

          admin.messaging().send(message)
              .then((response) => {
                console.log('Successfully sent message:', response);
              })
              .catch((error) => {
                console.log('Error sending message:', error);
              });

          res.status(200).send({
            status: 'OK',
          });
          return;
        }

        res.status(200).send({
          status: 'Already Have Voucher',
        });
      } else {
        docRef.set({
          voucherList: [
            {kodeVoucher: 'gameVoucher', potongan: 50000, used: false},
          ],
          gamevoucher: true,
        });

        res.status(200).send({
          status: 'OK',
        });
      }
    });
  } else {
    res.status(200).send({
      status: 'Wrong Parameter',
    });
  }
});

app.post('/open-shelf', function(req, res) {
  if (req.body.barang != undefined
    && req.body.email != undefined) {
    if (openedShelf[req.body.barang] == undefined) {
      openedShelf[req.body.barang] = [];
    }

    openedShelf[req.body.barang].push(req.body.email);

    res.status(200).send({
      status: 'OK',
    });
  } else {
    res.status(200).send({
      status: 'Wrong Parameter',
    });
  }
});

app.post('/close-shelf', function(req, res) {
  if (req.body.barang != undefined
    && req.body.count != undefined) {
    email = openedShelf[req.body.barang].shift();

    const docRef = db.collection('cart').doc(email);
    docRef.update({
      'productList': FieldValue.arrayUnion({
        'idProduk': req.body.barang,
        'jumlah': req.body.count,
      }),
    });

    res.status(200).send({
      status: 'OK',
    });
  } else {
    res.status(200).send({
      status: 'Wrong Parameter',
    });
  }
});

app.get('/opened-shelf', function(req, res) {
  res.status(200).send(openedShelf);
});

app.post('/get-info', function(req, res) {
  if (req.body.barang != undefined) {
    db.collection('products').doc(req.body.barang).get()
        .then(function(doc) {
          if (doc.exists) {
            res.status(200).send({
              nama: doc.data().namaProduk,
              harga: doc.data().harga,
            });
          } else {
            res.status(200).send({
              status: 'Product not found',
            });
          }
        });
  } else {
    res.status(200).send({
      status: 'Wrong Parameter',
    });
  }
});

port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('App running on port ' + port);
});

module.exports = server;
