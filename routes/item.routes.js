const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { verifyToken, isDoador, isAdmin } = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', itemController.getAllItems);
router.get('/search', itemController.searchItems);
router.get('/category/:categoryId', itemController.getItemsByCategory);
router.get('/:id', itemController.getItemById);

// Rotas protegidas
router.post('/', verifyToken, isDoador, itemController.createItem);
router.put('/:id', verifyToken, itemController.updateItem);
router.delete('/:id', verifyToken, itemController.deleteItem);
router.get('/donor/:doadorId?', verifyToken, itemController.getItemsByDonor);

module.exports = router;
