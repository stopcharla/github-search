const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log('get users request');
  userController.getUsers(req, res);
});

module.exports = router;
