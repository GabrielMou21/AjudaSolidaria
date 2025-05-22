const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rotas protegidas
router.get('/', verifyToken, donationController.getAllDonations);
router.get('/:id', verifyToken, donationController.getDonationById);
router.post('/', verifyToken, donationController.createDonation);
router.put('/status/:id', verifyToken, donationController.updateDonationStatus);
router.get('/donor/:doadorId?', verifyToken, donationController.getDonationsByDonor);
router.get('/beneficiary/:beneficiarioId?', verifyToken, donationController.getDonationsByBeneficiary);

module.exports = router;
