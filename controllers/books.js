const fs = require('fs');
const Book = require('../models/Book');

// Create a new book
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/optimized/${req.file.filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Book saved successfully!' }))
    .catch(error => res.status(400).json({ error }));
};

// Get all books
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Get one book by ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Get best rated books (top 3)
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Update a book
exports.updateBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/optimized/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: 'Unauthorized request' });
      }
      
      // Delete old image if updating with a new one
      if (req.file) {
        const filename = book.imageUrl.split('/images/optimized/')[1];
        fs.unlink(`images/optimized/${filename}`, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }
      
      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Book updated!' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};

// Delete a book
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: 'Unauthorized request' });
      }
      const filename = book.imageUrl.split('/images/optimized/')[1];
      fs.unlink(`images/optimized/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Book deleted!' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Rate a book
exports.rateBook = (req, res, next) => {
  // Ensure rating is between 0 and 5
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 0 and 5' });
  }
  
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Check if user already rated this book
      const userRatingIndex = book.ratings.findIndex(rating => rating.userId === req.body.userId);
      
      if (userRatingIndex !== -1) {
        return res.status(400).json({ message: 'You have already rated this book' });
      }
      
      // Add the new rating
      book.ratings.push({
        userId: req.body.userId,
        grade: req.body.rating
      });
      
      // Calculate the new average rating
      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = Math.round((totalRatings / book.ratings.length) * 10) / 10;
      
      // Save the updated book
      return book.save();
    })
    .then(updatedBook => res.status(200).json(updatedBook))
    .catch(error => res.status(500).json({ error }));
};
