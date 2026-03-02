// Carga las variables de entorno desde el archivo .env a process.env para configurar la app.
require('dotenv').config();

// Importa el framework Express para construir el servidor.
const express = require('express');

// Importa los módulos de rutas desde la carpeta 'routes'.
const migrationRoutes = require('./routes/migration');
const doctorsRoutes = require('./routes/doctors');
const reportsRoutes = require('./routes/reports');
const patientsRoutes = require('./routes/patients');

// Ejecuta los scripts de configuración de bases de datos para iniciar las conexiones.
require('./config/mongo'); // Conecta a MongoDB
require('./config/mysql'); // Conecta a MySQL

// Crea una instancia de la aplicación Express.
const app = express();

// Middleware: Permite a la aplicación entender y procesar datos JSON en el cuerpo de las peticiones (req.body).
app.use(express.json());

// Define los prefijos de las rutas y los asocia a sus respectivos archivos de rutas importados.
app.use('/api', migrationRoutes); // Ruta base para el upload de CSV
app.use('/api/doctors', doctorsRoutes); // Rutas para gestión de médicos
app.use('/api/reports', reportsRoutes); // Rutas para reportes financieros
app.use('/api/patients', patientsRoutes); // Rutas para historiales de pacientes

// Define el puerto donde escuchará el servidor, tomando el valor del .env o por defecto 3000.
const PORT = process.env.PORT || 3000;

// Inicia el servidor y lo pone a escuchar en el puerto definido.
app.listen(PORT, () => 
    console.log(`servidor corriendo en servidor ${PORT}`)
);