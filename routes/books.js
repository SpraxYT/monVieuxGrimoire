const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const imageOptimization = require('../middleware/image-optimization');
const booksCtrl = require('../controllers/books');

// Public routes
router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.get('/:id', booksCtrl.getOneBook);

// Protected routes
router.post('/', auth, multer, imageOptimization, booksCtrl.createBook);
router.put('/:id', auth, multer, imageOptimization, booksCtrl.updateBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.rateBook);

module.exports = router;
