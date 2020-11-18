'use strict'

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

app.use(express.static('./public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', renderHomePage);
app.get('/pages/books/:id', renderDetails);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);
app.post('/books', shelveBooks);

function renderHomePage(req, res) {
  let SQL = 'SELECT * FROM books;';
  // let bookCount = 'SELECT LAST_VALUE (id) OVER (RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) FROM books;';


  return client.query(SQL)
    .then(results => res.render('pages/index', { bookshelf: results.rows }))
    .catch(err => console.error(err));
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
  this.title = googleBook.title || 'No title found';
  this.authors = googleBook.authors || 'No author found';
  this.description = googleBook.description || 'No description found';
  this.identifier = googleBook.industryIdentifiers[0].identifier || 'No ISBN found';
}

function shelveBooks(req, res) {
  const chosenBook = JSON.parse(req.body.book);
  let { thumbnail, title, authors, description, identifier } = chosenBook;
  let SQL = 'INSERT INTO books (thumbnail, title, authors, description, identifier) VALUES ($1, $2, $3, $4, $5);';
  let values = [thumbnail, title, authors, description, identifier];
  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(error => console.error(error));
}

function renderDetails(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let bookID = [req.params.id];

  return client.query(SQL, bookID)
    .then(result => {
      return res.render('pages/books/:id', { book: result.rows[0] });
    })
    .catch(error => {
      console.error(error);
    })
}

app.use('*', errorHandling);

function errorHandling(req, res) {
  res.status(500).send('Something went wrong!');
}

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});
