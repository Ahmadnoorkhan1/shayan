const express = require('express');
const { createBookTitle, createBookSummary, createCompleteBook, getBookChapter } = require('../Controllers/BookController');

const router = express.Router();

router.post('/step-1', createBookTitle);
router.post('/step-3', createBookSummary);
router.post('/step-5', createCompleteBook);
router.post('/getBookChapter', getBookChapter);



module.exports = router;