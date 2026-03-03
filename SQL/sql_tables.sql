CREATE DATABASE IF NOT EXISTS LogiTech;
USE LogiTech;

-- 1. Categorías 
CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    ON DELETE CASCADE
);

-- 2. Proveedores 
CREATE TABLE Suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    contact_email VARCHAR(150),
    ON DELETE CASCADE
);

-- 3. Clientes 
CREATE TABLE Customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    ON DELETE CASCADE
);


CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0, 
    supplier_id INT,
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    ON DELETE CASCADE
);


CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT,
    order_date DATETIME NOT NULL, 
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    ON DELETE CASCADE
);


CREATE TABLE Order_Items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL, 
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (product_id) REFERENCES Products(id),
    ON DELETE CASCADE
);

