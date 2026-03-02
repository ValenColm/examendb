const express = require('express');
const router = express.Router();
// Importa el modelo de MongoDB.
const PatientHistory = require('../models/patientHistory');

// --- GET /api/patients/:email/history (Obtener historial por email) ---
router.get('/:email/history', async (req, res) => {
    try {
        // Obtiene el email de los parámetros de la URL.
        const { email } = req.params;
        // Busca el historial del paciente por su email.
        const history = await PatientHistory.findOne({ patientEmail: email });
        // Si no existe, devuelve un error 404.
        if (!history) return res.status(404).json({ message: 'Historial no encontrado' });
        // Devuelve el historial en formato JSON.
        res.json(history);
    } catch (error) {
        // Maneja errores de base de datos.
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

//http://localhost:3000/api/patients/ana.torres@mail.com/history