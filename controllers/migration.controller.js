const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('../config/mysql');
const PatientHistory = require('../models/patientHistory');

exports.migrateData = async (req, res) => {
try {

    if (!req.file) {
    return res.status(400).json({ message: 'No se subió archivo CSV' });
    }

    const results = [];

    // Leer CSV
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
        results.push(data);
    })
    .on('end', async () => {

        for (const row of results) {

        
          // INSERTAR EN MYSQL (IDEMPOTENTE)

          // Doctor
        const [doctorExist] = await mysql.promise().query(
            'SELECT id FROM doctors WHERE email = ?',
            [row.doctor_email]
        );

        let doctorId;

        if (doctorExist.length === 0) {
            const [doctorResult] = await mysql.promise().query(
            'INSERT INTO doctors (name, specialty, email) VALUES (?, ?, ?)',
            [row.doctor_name, row.specialty, row.doctor_email]
            );
            doctorId = doctorResult.insertId;
        } else {
            doctorId = doctorExist[0].id;
        }

          // Paciente
        const [patientExist] = await mysql.promise().query(
            'SELECT id FROM patients WHERE email = ?',
            [row.patient_email]
        );

        let patientId;

        if (patientExist.length === 0) {
            const [patientResult] = await mysql.promise().query(
            'INSERT INTO patients (name, birth_date, email) VALUES (?, ?, ?)',
            [row.patient_name, row.birth_date, row.patient_email]
            );
            patientId = patientResult.insertId;
        } else {
            patientId = patientExist[0].id;
        }

          // Reporte
        await mysql.promise().query(
            `INSERT INTO reports (patient_id, doctor_id, diagnosis, report_date)
            SELECT ?, ?, ?, ?
            WHERE NOT EXISTS (
            SELECT 1 FROM reports 
            WHERE patient_id = ? 
            AND doctor_id = ?
            AND report_date = ?
            )`,
            [
            patientId,
            doctorId,
            row.diagnosis,
            row.report_date,
            patientId,
            doctorId,
            row.report_date
            ]
        );

          // =========================
          // MONGODB (UPSERT)
          // =========================

        await PatientHistory.findOneAndUpdate(
  { patientEmail: row.patient_email },
  {
    $setOnInsert: {
    patientEmail: row.patient_email,
    patientName: row.patient_name
    },
    $addToSet: {
    appointments: {
        appointmentId: row.report_id || row.report_date,
        date: row.report_date,
        doctorName: row.doctor_name,
        specialty: row.specialty,
        treatmentDescription: row.diagnosis,
        amountPaid: 0
    }
    }
  },
  { upsert: true, new: true }
);
        }

        res.json({ message: 'Migración completada correctamente' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en migración' });
  }
};