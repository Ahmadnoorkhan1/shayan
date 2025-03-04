const express = require('express');
const { createBookTitle, createBookSummary, createCompleteBook, getBookChapter, getBookById, updateBook } = require('../Controllers/BookController');

const router = express.Router();

router.post('/step-1', createBookTitle);
router.post('/step-3', createBookSummary);
router.post('/step-5', createCompleteBook);
router.post('/getBookChapter', getBookChapter);
// get book by id 
router.get('/getBookById/:id', getBookById);
router.post('/updateBook/:id', updateBook);




module.exports = router;