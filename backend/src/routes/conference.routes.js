const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/conference.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', verifyToken, create);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);

module.exports = router;
