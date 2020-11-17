'use strict'

const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const dotenv = require('dotenv');
const PORT = process.env.PORT || 3333;

dotenv.config();

app.use(express.static('./public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// app.get('/', renderHomePage);
app.get('/', renderHomePage);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);

function renderHomePage(req, res) {
  res.render('pages/index', { 'testObject': 'Hello there! Welcome to your bookshelves.' });
}

function showForm(req, res) {
  res.render('pages/searches/new');
}

function createSearch(req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(data => {
      return data.body.items.map(book => { return new Book(book.volumeInfo); });
    })
    .then(results => {
      res.render('pages/searches/show', { searchResults: results });
    })
    .catch(error => {
      console.error(error);
      res.render('pages/error');
    })
}

function Book(googleBook) {
  this.thumbnail = googleBook.imageLinks.thumbnail.replace('http:', 'https:') || 'https://i.imgur.com/J5LVHEL.jpg';
  // if (this.thumbnail.indexOf('https:') === -1) { this.thumbnail = this.thumbnail.replace('http:', 'https:'); }
  this.title = googleBook.title || 'No title found';
  this.authors = googleBook.authors || 'No author found';
  this.description = googleBook.description || 'No description found';
}

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});
