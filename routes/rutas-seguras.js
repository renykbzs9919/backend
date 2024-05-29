const express = require('express');
const router = express.Router();

const userController = require('../controllers/usuario.controller');


// Rutas /usuarios
router.route('/usuarios')
    .get(userController.getUsers)
    .post(userController.createUser);

router.route('/usuarios/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;