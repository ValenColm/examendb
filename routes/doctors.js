// Importa express para crear el router.
const express = require('express');
// Crea una instancia del router de express para manejar las rutas.
const router = express.Router();
// Importa la conexión a MySQL desde el archivo de configuración.
const mysql = require('../config/mysql');
// Importa el modelo de Mongoose para acceder a MongoDB.
const PatientHistory = require('../models/patientHistory');

// --- GET /api/doctors (Obtener lista de médicos) ---
// Define una ruta GET en la raíz ('/') de este router.
router.get('/', async (req, res) => {
  try {
    // Extrae el parámetro 'specialty' de la URL (si existe).
    const { specialty } = req.query;
    // Consulta base para obtener todos los médicos.
    let query = 'SELECT * FROM doctors';
    let values = [];
    // Si se especificó una especialidad, modifica la consulta SQL.
    if (specialty) {
      query += ' WHERE specialty = ?';
      values.push(specialty);
    }
    // Ejecuta la consulta en MySQL.
    const [rows] = await mysql.query(query, values);
    // Envía los resultados como JSON.
    res.json(rows);
  } catch (error) {
    // Maneja errores y envía un estado 500.
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo médicos' });
  }
});

// --- GET /api/doctors/:id (Obtener un médico específico) ---
// Define una ruta GET que recibe un ID por parámetro.
router.get('/:id', async (req, res) => {
  try {
    // Extrae el ID de los parámetros de la URL.
    const { id } = req.params;
    // Consulta SQL para buscar un médico por su ID.
    const [rows] = await mysql.query('SELECT * FROM doctors WHERE id = ?',[id]);
    // Si no se encuentra, envía un estado 404.
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }
    // Envía el primer resultado (el médico encontrado) como JSON.
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo doctor' });
  }
});

// --- POST /api/doctors (Crear un nuevo médico) ---
// Define una ruta POST para crear un médico.
router.post('/', async (req, res) => {
    try {
        // Imprime en consola el cuerpo de la petición (para debug).
        console.log("Cuerpo recibido:", req.body);
        // Extrae los datos necesarios del cuerpo de la petición.
        const { name, specialty, email } = req.body;
        // Validación básica: asegura que los campos obligatorios existen.
        if (!name || !email || !specialty) {
            return res.status(400).json({ message: 'Todos los campos (name, email, specialty) son obligatorios' });
        }
        // Inserta el nuevo médico en MySQL.
        const [result] = await mysql.query(
            'INSERT INTO doctors (name, email, specialty) VALUES (?, ?, ?)',
            [name, specialty, email]
        );
        // Envía una respuesta de éxito con el ID del nuevo médico.
        res.status(201).json({
            message: 'Doctor creado correctamente',
            id: result.insertId
        });
    } catch (error) {
        console.error("Error en POST:", error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// --- PUT /api/doctors/:id (Actualizar médico y sincronizar Mongo) ---
// Define una ruta PUT para actualizar un médico por ID.
router.put('/:id', async (req, res) => {
    try {
        // Obtiene el ID del médico a actualizar.
        const { id } = req.params;
        // Obtiene los nuevos datos del cuerpo de la petición.
        const { name, specialty, email } = req.body;
        
        // A. Primero obtenemos el nombre actual en MySQL para saber qué buscar en Mongo
        const [oldDoctor] = await mysql.query('SELECT name FROM doctors WHERE id = ?', [id]);
        
        // Verifica si el médico existe.
        if (oldDoctor.length === 0) {
            return res.status(404).json({ message: 'Doctor no encontrado en MySQL' });
        }
        const oldName = oldDoctor[0].name;

        // B. Actualizamos los datos en MySQL.
        await mysql.query(
            'UPDATE doctors SET name = ?, specialty = ?, email = ? WHERE id = ?',
            [name, specialty, email, id]
        );
        
        // C. SINCRONIZACIÓN: Actualizamos el nombre en los documentos de MongoDB
        // Buscamos en la colección 'patient_histories' donde el nombre del doctor coincida con el viejo.
        await PatientHistory.updateMany(
            { "appointments.doctorName": oldName }, // Filtro de búsqueda
            { 
                $set: { 
                    // Actualiza el nombre y especialidad dentro del array de citas usando un filtro de array
                    "appointments.$[elem].doctorName": name,
                    "appointments.$[elem].specialty": specialty 
                } 
            },
            { 
                // Define qué elemento del array actualizar.
                arrayFilters: [{ "elem.doctorName": oldName }]
            }
        );

        // 

        // Responde indicando que la actualización fue exitosa en ambas bases de datos.
        res.json({ 
            message: 'Actualización exitosa', 
            details: 'Sincronizado en MySQL y MongoDB' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la actualización: ' + error.message });
    }
});

// Exporta el router para ser usado en el archivo principal index.js.
module.exports = router;