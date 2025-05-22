const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken, isOrganizacao, isAdmin } = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', eventController.getAllEvents);
router.get('/active', eventController.getActiveEvents);
router.get('/:id', eventController.getEventById);

// Rotas protegidas
router.post('/', verifyToken, isOrganizacao, eventController.createEvent);
router.put('/:id', verifyToken, eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);
router.get('/organization/:organizacaoId?', verifyToken, eventController.getEventsByOrganization);

module.exports = router;
