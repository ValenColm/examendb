// Importaciones necesarias: Express, Router, Multer (para archivos), FS y CSV parser.
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const connection = require('../config/mysql.js');
const AuditLog = require('../models/auditLog.js');
const { error } = require('console');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });
router.post('/upload', upload.single('file'), async (req, res) => {
    console.log('Archivo recibido:', req.file);
    try {
                const resultados = [];
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', data => resultados.push(data))
                    .on('end', async () => {
                        for (const row of resultados) {
                            // 1. Category
                            await connection.query(
                                `INSERT IGNORE INTO Categories (name) VALUES (?)`,
                                [row.product_category]
                            );
                            const [catRows] = await connection.query(
                                `SELECT id FROM Categories WHERE name = ?`,
                                [row.product_category]
                            );
                            const categoryId = catRows[0].id;

                            // 2. Supplier
                            await connection.query(
                                `INSERT IGNORE INTO Suppliers (name, contact_email) VALUES (?,?)`,
                                [row.supplier_name, row.supplier_email]
                            );
                            const [supRows] = await connection.query(
                                `SELECT id FROM Suppliers WHERE name = ?`,
                                [row.supplier_name]
                            );
                            const supplierId = supRows[0].id;

                            // 3. Customer
                            await connection.query(
                                `INSERT IGNORE INTO Customers (full_name,email,address,phone) VALUES (?,?,?,?)`,
                                [row.customer_name, row.customer_email, row.customer_address, row.customer_phone]
                            );
                            const [custRows] = await connection.query(
                                `SELECT id FROM Customers WHERE email = ?`,
                                [row.customer_email]
                            );
                            const customerId = custRows[0].id;

                            // 4. Product
                            await connection.query(
                                `INSERT IGNORE INTO Products (sku,name,price,stock,category_id,supplier_id)
                                VALUES (?,?,?,?,?,?)`,
                                [
                                    row.product_sku,
                                    row.product_name,
                                    parseFloat(row.unit_price) || 0,
                                    0,
                                    categoryId,
                                    supplierId
                                ]
                            );
                            const [prodRows] = await connection.query(
                                `SELECT id FROM Products WHERE sku = ?`,
                                [row.product_sku]
                            );
                            const productId = prodRows[0].id;

                            // 5. Order
                            await connection.query(
                                `INSERT IGNORE INTO Orders (transaction_id,customer_id,order_date)
                                VALUES (?,?,?)`,
                                [row.transaction_id, customerId, row.date]
                            );
                            const [orderRows] = await connection.query(
                                `SELECT id FROM Orders WHERE transaction_id = ?`,
                                [row.transaction_id]
                            );
                            const orderId = orderRows[0].id;

                            // 6. Order_Items
                            await connection.query(
                                `INSERT IGNORE INTO Order_Items (order_id,product_id,quantity,unit_price,line_total)
                                VALUES (?,?,?,?,?)`,
                                [
                                    orderId,
                                    productId,
                                    parseInt(row.quantity, 10) || 0,
                                    parseFloat(row.unit_price) || 0,
                                    parseFloat(row.total_line_value) || 0
                                ]
                            );
                    await connection.query(
                            `UPDATE Products SET stock = stock + ? WHERE id = ?`,
                            [parseInt(row.quantity, 10) || 0, productId]
                            );
                        }
                        // Guardar auditoría
                        try {
                            await AuditLog.create({
                                fileName: req.file.filename,
                                processedRows: resultados.length,
                                success: true
                            });
                        } catch (auditErr) {
                            console.error('Error guardando auditoría:', auditErr);
                        }

                        res.json({ mensaje: 'Migración completada' });
                    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'error en migracion' });
    }
});

module.exports = router;