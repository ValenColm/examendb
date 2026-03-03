const express = require('express');
const router = express.Router();
const connection = require('../config/mysql');

//  suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT s.id, s.name,
        COALESCE(SUM(oi.quantity),0) AS total_items_sold,
        COALESCE(SUM(p.stock * p.price),0) AS inventory_value
      FROM Suppliers s
      LEFT JOIN Products p ON p.supplier_id = s.id
      LEFT JOIN Order_Items oi ON oi.product_id = p.id
      GROUP BY s.id, s.name`);
    res.json(rows);
  } catch (err) {
    console.error('Error supplier analysis:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  Customer history
router.get('/customer/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await connection.query(
      `SELECT o.id AS order_id, o.transaction_id, o.order_date,
        oi.product_id, p.name as product_name, oi.quantity, oi.unit_price,
        (oi.quantity * oi.unit_price) AS line_total
      FROM Orders o
      JOIN Order_Items oi ON oi.order_id = o.id
      JOIN Products p ON p.id = oi.product_id
      WHERE o.customer_id = ?
      ORDER BY o.order_date`,
      [id]
    );

    // group by order
    const grouped = orders.reduce((acc, row) => {
      if (!acc[row.order_id]) {
        acc[row.order_id] = {
          orderId: row.order_id,
          transactionId: row.transaction_id,
          orderDate: row.order_date,
          items: [],
          total: 0,
        };
      }
      acc[row.order_id].items.push({
        product_id: row.product_id,
        name: row.product_name,
        quantity: row.quantity,
        unit_price: row.unit_price,
        line_total: row.line_total,
      });
      acc[row.order_id].total += row.line_total;
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error customer history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  Top products by category
router.get('/top-products', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Category is required' });
  try {
    const [rows] = await connection.query(
      `SELECT p.id, p.name,
        SUM(oi.quantity * oi.unit_price) AS revenue
      FROM Products p
      JOIN Order_Items oi ON oi.product_id = p.id
      JOIN Categories c ON c.id = p.category_id
      WHERE c.name = ?
      GROUP BY p.id, p.name
      ORDER BY revenue DESC`,
      [category]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error top products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;