const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patients.controller');

// rutas para pacientes
router.get('/', patientsController.getAll);
router.get('/:email/history', patientsController.getHistory);
router.get('/:id', patientsController.getById);
router.post('/', patientsController.create);
router.put('/:id', patientsController.update);
router.delete('/:id', patientsController.delete);

module.exports = router;