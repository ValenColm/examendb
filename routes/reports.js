const express = require('express');
const router = express.Router();
// Importa la conexión a MySQL.
const mysql = require('../config/mysql');

// --- GET /api/reports/revenue (Obtener reporte de ingresos) ---
router.get('/revenue', async (req, res) => {
    try {
        // Obtiene fechas opcionales para filtrar el reporte.
        const { startDate, endDate } = req.query;
        let whereClause = '';
        let params = [];

        // Si se envían ambas fechas, prepara la cláusula WHERE para SQL.
        if (startDate && endDate) {
            whereClause = 'WHERE appointment_date BETWEEN ? AND ?';
            params = [startDate, endDate];
        }

        // 1. Consulta SQL: Total general de ingresos usando SUM y la cláusula WHERE preparada.
        const [totalRes] = await mysql.query(
            `SELECT SUM(amount_paid) as total FROM appointments ${whereClause}`, 
            params
        );
        
        // 2. Consulta SQL: Ingresos desglosados por aseguradora usando LEFT JOIN y GROUP BY.
        const [insuranceRes] = await mysql.query(
            `SELECT i.name as insurance, SUM(a.amount_paid) as total 
             FROM appointments a
             LEFT JOIN insurances i ON a.insurance_id = i.id
             ${whereClause}
             GROUP BY i.name`,
            params
        );

        // Envía el reporte con el total, desglosado y el periodo consultado.
        res.json({
            totalRevenue: totalRes[0].total || 0,
            byInsurance: insuranceRes,
            period: { startDate, endDate }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generando reporte' });
    }
});

module.exports = router;