const express = require('express');
require('dotenv').config();
require('./config/mongo');

const app = express();
app.use(express.json());

// rutas
app.use('/api/doctors',require('./routes/doctors.router'));
app.use('/api/patients',require('./routes/patients.routes'));
app.use('/api/reports',require('./routes/reports.routes'));
app.use('/api/migration',require('./routes/migrations.routes'));
app.listen(3000, () => {
  console.log('Servidor corriendo http://localhost:3000');
});