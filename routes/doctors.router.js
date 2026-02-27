const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctors.controller');

// ruta base: /api/doctors
router.get('/', doctorsController.getAll);
router.get('/:id', doctorsController.getById);
router.post('/', doctorsController.create);
router.put('/:id', doctorsController.update);
router.delete('/:id', doctorsController.delete);

module.exports = router;