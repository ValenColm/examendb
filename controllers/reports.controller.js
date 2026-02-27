const mysql = require('../config/mysql');

// GET /api/reports/revenue
exports.getRevenue = (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = '';
  let params = [];

  if (startDate && endDate) {
    dateFilter = 'WHERE a.appointment_date BETWEEN ? AND ?';
    params = [startDate, endDate];
  }

  // Total Revenue
  const totalQuery = `
    SELECT SUM(a.amount_paid) AS totalRevenue
    FROM appointments a
    ${dateFilter}
  `;

  // Revenue por aseguradora
  const insuranceQuery = `
    SELECT 
      IFNULL(i.name, 'Sin Seguro') AS insurance,
      SUM(a.amount_paid) AS total
    FROM appointments a
    LEFT JOIN insurances i ON a.insurance_id = i.id
    ${dateFilter}
    GROUP BY i.name
  `;

  mysql.query(totalQuery, params, (err, totalResult) => {
    if (err) return res.status(500).json({ error: err.message });

    mysql.query(insuranceQuery, params, (err2, insuranceResult) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        totalRevenue: totalResult[0].totalRevenue || 0,
        revenueByInsurance: insuranceResult,
        dateRange: startDate && endDate 
          ? { startDate, endDate } 
          : 'All dates'
      });
    });
  });
};