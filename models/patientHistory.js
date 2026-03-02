// Importa la librería 'mongoose' para definir esquemas y modelos de MongoDB.
const mongoose = require('mongoose');

// Define el esquema para cada cita individual dentro del historial del paciente.
// Esto estructura cómo se guardarán los datos dentro del array de citas.
const appointmentSchema = new mongoose.Schema({
    // ID único de la cita (generalmente viene de MySQL).
    appointmentId: String,
    // Fecha de la cita.
    date: String,
    // Nombre del doctor que atendió.
    doctorName: String,
    // Especialidad del doctor.
    specialty: String,
    // Descripción del tratamiento realizado.
    treatmentDescription: String,
    // Cantidad pagada por la cita.
    amountPaid: Number
});

// Define el esquema principal para el documento del historial del paciente.
const patientHistorySchema = new mongoose.Schema({
    // Correo del paciente, usado como identificador clave.
    patientEmail: {
        type: String,     // Define que es un texto.
        required: true,   // Hace que este campo sea obligatorio.
        unique: true      // Asegura que no haya dos historiales con el mismo correo.
    },
    // Nombre completo del paciente.
    patientName: String,
    // Un array de citas, utilizando el esquema definido arriba (appointmentSchema).
    appointments: [appointmentSchema]
});

// 

// Compila el esquema en un modelo llamado 'PatientHistory' y lo exporta.
// Mongoose crea automáticamente la colección 'patienthistories' (en minúsculas y plural) en MongoDB.
module.exports = mongoose.model('PatientHistory', patientHistorySchema);