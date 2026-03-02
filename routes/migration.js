// Importaciones necesarias: Express, Router, Multer (para archivos), FS y CSV parser.
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

// Importa conexiones a MySQL y modelo de MongoDB.
const connection = require('../config/mysql.js');
const PatientHistory = require('../models/patientHistory.js');
const { error } = require('console');

// Configura dónde y cómo se guardan los archivos subidos.
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// --- POST /api/upload (Subir archivo CSV) ---
router.post('/upload', upload.single('file'), async (req, res) => {
    try{
    const resultados = [];

    // Lee el archivo CSV subido línea por línea.
    fs.createReadStream(req.file.path)
    .pipe(csv())
    // Por cada línea ('data'), la agrega al array resultados.
    .on('data', data => resultados.push(data))
    // Cuando termina de leer ('end'), procesa los datos.
    .on('end', async () => {
        // Itera sobre cada fila del CSV.
        for (const row of resultados) {

            // 1. MySQL: Inserta paciente si no existe (INSERT IGNORE).
            await connection.query(
                `INSERT IGNORE INTO patients (name,email,phone,address) VALUES (?,?,?,?)`,
                [row.patient_name,row.patient_email,row.patient_phone,row.patient_address]
            );

            // 2. MySQL: Inserta doctor si no existe.
            await connection.query(
                `INSERT IGNORE INTO doctors (name,email,specialty) VALUES (?,?,?)`,
                [row.doctor_name,row.doctor_email,row.specialty]
            );

            // 3. MySQL: Inserta aseguradora si no existe.
            await connection.query(
                `INSERT IGNORE INTO insurances (name,coverage_percentage) VALUES (?,?)`,
                [row.insurance_provider,row.coverage_percentage]
            );

            // 4. MySQL: Inserta cita usando IDs de las tablas anteriores (INSERT IGNORE para idempotencia).
            await connection.query(
                `INSERT IGNORE INTO appointments (appointment_id,appointment_date,patient_id,doctor_id,insurance_id,treatment_code,treatment_description,treatment_cost,amount_paid)
                SELECT ?, ?, p.id, d.id, i.id, ?, ?, ?, ?
                FROM patients p
                JOIN doctors d ON d.email = ?
                LEFT JOIN insurances i ON i.name = ?
                WHERE p.email = ?`,
                [
                row.appointment_id,
                row.appointment_date,
                row.treatment_code,
                row.treatment_description,
                row.treatment_cost,
                row.amount_paid,
                row.doctor_email,
                row.insurance_provider,
                row.patient_email
                ]
            );

            // 5. MongoDB: Actualiza o inserta el historial del paciente.
            await PatientHistory.findOneAndUpdate(
                { patientEmail: row.patient_email }, // Filtro por correo.
                {
                    patientName: row.patient_name,
                    // Agrega la cita al array si no existe ya ($addToSet).
                    $addToSet: {
                        appointments: {
                            appointmentId: row.appointment_id,
                            date: row.appointment_date,
                            doctorName: row.doctor_name,
                            specialty: row.specialty,
                            treatmentDescription: row.treatment_description,
                            amountPaid: row.amount_paid
                        }
                    }
                },
                { upsert: true } // Crea el documento si no existe.
            );
        }
        // Responde que la migración terminó.
        res.json({ 
            mensaje: 'Migración completada',
        });
    });
} catch (error) {
    console.error(error);
    res.status(500).json({error: 'error en migracion'});
}
});

module.exports = router;