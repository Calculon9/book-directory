const express = require('express');
const path = require('path')
const mongoose = require('mongoose');

const app = express();
let port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Your app is listening on port ' + port);
});


// Create DB model
const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  year: Number
});
const book = mongoose.model('book', bookSchema);

// Connect to DB
mongoose.connect("mongodb+srv://calcs:calcs750@cluster0.zk9gn.mongodb.net/Library?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect("mongodb+srv://calcs:calcs750@cluster0.zk9gn.mongodb.net/test", { useNewUrlParser: true, useUnifiedTopology: true });


// Post middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());

// Register view engine
app.set('view engine', 'ejs');

// Home Page
app.get('/', (req, res) => {
  book.find({}, (err, books) => {
    if (err) { console.log(err) } else {
      res.render('main', { books })
    }
  })
})

// Add new book
app.post('/api/books', (req, res) => {
  const newBook = new book({
    title: req.body.title,
    author: req.body.author,
    year: req.body.year
  })
  newBook.save((err, book) => {
    if (err) { console.log(err) } else {
      res.redirect('/');
    }
  })

})

// Delete book
app.get('/api/books/delete/:id', (req, res) => {
  let id = req.params.id;
  book.findOneAndRemove({ _id: id }, (err, doc) => {
    if (err) { console.log(err) } else {
      // res.redirect('/') doesn't work since the 'req' is from an AJAX request,  which restricts backend URL changes
      // The redirect is instead done on frontend at the end of the AJAX call
    }
  })
})

// Load Edit Book page
app.get('/api/books/edit/:id', (req, res) => {
  let id = req.params.id;
  book.findOne({ _id: id }, (err, doc) => {
    console.log(doc)
    if (err) { console.log(err) } else {
      res.render('edit', { book: doc })
    }
  })
})

// Update book
app.post('/api/books/update/:id', async (req, res) => {
  const filter = { _id: req.params.id };
  let update = {
    title: req.body.title,
    author: req.body.author,
    year: req.body.year
  }
  
  // Filter out empty entries
  let updateFilt = {};
  for (let key in update) {
    if(update[key]) {
      updateFilt[key] = update[key];
    }
  }
  update = { $set: updateFilt }
  const result = await book.updateOne(filter, update);
  res.redirect('/')
})