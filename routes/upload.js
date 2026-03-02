// Importa el framework Express para utilizar sus funcionalidades de enrutamiento.
const express = require('express');

// Crea una instancia de Router de Express.
// Esto permite definir las rutas específicas para la subida de archivos (como POST /upload)
// en este archivo y luego exportarlas para usarlas en index.js.
const router = express.Router();