'use strict'

const express = require('express');
const app = express();
const cors = require('cors');
const suepragent = require('superagent');
const dotenv = require('dotenv');
const PORT = process.env.PORT || 3333;

dotenv.config();

app.use(express.static('./public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// app.get('/', renderHomePage);
app.get('/hello', renderHomePage);
app.get('/searches/new', showForm);
// app.post('/searches', createSearch);

function renderHomePage(req, res) {
  res.render('pages/index', { 'testObject': 'Hello World' });
}

function showForm(req, res) {
  res.render('pages/searches/new.ejs');
}

// function createSearch(req, res) {
//   let url = 'httpes://www.googleapis.com/books/v1/volumes?q=';
//   if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
//   if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

//   superagent.get(url)
//     .then(data => {
//       Return data.body.items.map(book => { return new Book(book.volumeInfo); });
//       res.render('pages/show', data.text)
//     })
//     .then(results => {
//       res.render('pages/show', { searchResults: JSON.stringify(resutls) });
//     })
//     .catch(err => console.error(err));
// }

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});
