const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { verifyToken, isBeneficiario, isAdmin } = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', requestController.getAllRequests);
router.get('/search', requestController.searchRequests);
router.get('/:id', requestController.getRequestById);

// Rotas protegidas
router.post('/', verifyToken, isBeneficiario, requestController.createRequest);
router.put('/:id', verifyToken, requestController.updateRequest);
router.put('/status/:id', verifyToken, isAdmin, requestController.updateRequestStatus);
router.delete('/:id', verifyToken, requestController.deleteRequest);
router.get('/beneficiary/:beneficiarioId?', verifyToken, requestController.getRequestsByBeneficiary);

module.exports = router;
