const express = require('express');
const router = express.Router();
const connection = require('../config/mysql');
const DeleteLog = require('../models/deleteLog');

// List all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM Products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single product by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM Products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  const { sku, name, price, stock = 0, category_id, supplier_id } = req.body;
  if (!sku || !name || price == null || !category_id || !supplier_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await connection.query(
      `INSERT INTO Products (sku,name,price,stock,category_id,supplier_id)
      VALUES (?,?,?,?,?,?)`,
      [sku, name, price, stock, category_id, supplier_id]
    );
    const [newRows] = await connection.query('SELECT * FROM Products WHERE id = ?', [result.insertId]);
    res.status(201).json(newRows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { sku, name, price, stock, category_id, supplier_id } = req.body;
  if (!sku || !name || price == null || !category_id || !supplier_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await connection.query(
      `UPDATE Products SET sku=?,name=?,price=?,stock=?,category_id=?,supplier_id=? WHERE id = ?`,
      [sku, name, price, stock, category_id, supplier_id, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    const [rows] = await connection.query('SELECT * FROM Products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM Products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const product = rows[0];
    await connection.query('DELETE FROM Products WHERE id = ?', [id]);
    try {
      await DeleteLog.create({
        entity: 'Product',
        recordId: id,
        data: product,
      });
    } catch (logErr) {
      console.error('Error logging deletion:', logErr);
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;