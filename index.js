require('dotenv').config();

const express = require('express');
const migrationRoutes = require('./routes/migration');
const productsRoutes = require('./routes/products');
const consultasRoutes = require('./routes/consultas_avanzadas');

require('./config/mongo'); // Conectar MongoDB
require('./config/mysql'); // Conectar MySQL
const app = express();

// Middlewares
app.use(express.json());

// Rutes
app.use('/api/upload', migrationRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/consultas_avanzadas', consultasRoutes);

// Compatibility route: map legacy reports path to the BI routes
app.get('/reports/top-selling-products', (req, res) => {
    const category = req.query.category || req.query.cat || '';
    // redirect to the implemented BI endpoint
    res.redirect(`/api/consultas_avanzadas/top-products?category=${encodeURIComponent(category)}`);
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => 
    console.log(`servidor corriendo en servidor ${PORT}`)
);