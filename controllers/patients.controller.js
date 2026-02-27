const PatientHistory = require('../models/patientHistory'); // modelo Mongo
const mysql = require('../config/mysql');

exports.getAll = (req, res) => {
  mysql.query('SELECT * FROM patients', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getById = (req, res) => {
  const { id } = req.params;
  mysql.query('SELECT * FROM patients WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json(results[0]);
});
};

exports.create = (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  mysql.query(
    'INSERT INTO patients (name, email, phone, address) VALUES (?, ?, ?, ?)',
    [name, email, phone || null, address || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId });
    }
  );
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  mysql.query(
    'UPDATE patients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
    [name, email, phone, address, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ affectedRows: result.affectedRows });
    }
  );
};

exports.delete = (req, res) => {
  const { id } = req.params;
  mysql.query('DELETE FROM patients WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ affectedRows: result.affectedRows });
  });
};

// GET /api/patients/:email/history  (MongoDB)
exports.getHistory = async (req, res) => {
  try {
    const { email } = req.params;

    const patient = await PatientHistory.findOne({ email });

    if (!patient) {
      return res.status(404).json({ message: 'Patient history not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};