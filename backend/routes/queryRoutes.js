const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

router.get('/', queryController.getAll);
router.post('/', queryController.create);
router.put('/:id', queryController.updateStatus);
router.delete('/:id', queryController.delete);

module.exports = router;
