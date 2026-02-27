const mysql = require('../config/mysql');
const PatientHistory = require('../models/patientHistory');

// GET /api/doctors
// GET /api/doctors?specialty=Cardiology
exports.getAll = (req, res) => {
  const { specialty } = req.query;

  let sql = 'SELECT * FROM doctors';
  let params = [];

  if (specialty) {
    sql += ' WHERE specialty = ?';
    params.push(specialty);
  }

  mysql.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET /api/doctors/:id
exports.getById = (req, res) => {
  const { id } = req.params;

  mysql.query('SELECT * FROM doctors WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: 'Doctor not found' });

    res.json(results[0]);
  });
};

// POST /api/doctors
exports.create = async (req, res) => {
  const { name, email, specialty } = req.body;

  if (!name || !email || !specialty) {
    return res.status(400).json({
      message: 'name, email and specialty are required'
    });
  }

  try {
    // Verificar si ya existe por email (idempotencia básica)
    const [existing] = await mysql.promise().query(
      'SELECT id FROM doctors WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Doctor with this email already exists'
      });
    }

    const [result] = await mysql.promise().query(
      'INSERT INTO doctors (name, email, specialty) VALUES (?, ?, ?)',
      [name, email, specialty]
    );

    res.status(201).json({
      message: 'Doctor created successfully',
      id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/doctors/:id
// Si cambia el nombre, actualizar también en Mongo
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, email, specialty } = req.body;

  try {
    const [doctorRows] = await mysql.promise().query(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );

    if (doctorRows.length === 0)
      return res.status(404).json({ message: 'Doctor not found' });

    const oldDoctorName = doctorRows[0].name;

    await mysql.promise().query(
      'UPDATE doctors SET name = ?, email = ?, specialty = ? WHERE id = ?',
      [name, email, specialty, id]
    );

    // Sync Mongo si cambia el nombre
    if (name && name !== oldDoctorName) {
      await PatientHistory.updateMany(
        { "appointments.doctorName": oldDoctorName },
        {
          $set: {
            "appointments.$[elem].doctorName": name
          }
        },
        {
          arrayFilters: [{ "elem.doctorName": oldDoctorName }]
        }
      );
    }

    res.json({ message: 'Doctor updated successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/doctors/:id
exports.delete = (req, res) => {
  const { id } = req.params;

  mysql.query('DELETE FROM doctors WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ affectedRows: result.affectedRows });
  });
};