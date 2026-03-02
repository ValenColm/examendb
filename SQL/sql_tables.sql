-- Crea la base de datos si no existe.
CREATE DATABASE SaludPlus;

-- Selecciona la base de datos SaludPlus para trabajar sobre ella.
USE SaludPlus;

-- Crea la tabla de pacientes con campos básicos e ID autoincremental.
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL, -- UNIQUE asegura que no haya correos repetidos
    phone VARCHAR(20),
    address VARCHAR(150) NOT NULL
);

-- Crea la tabla de doctores.
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    specialty VARCHAR(100) NOT NULL
);

-- Crea la tabla de aseguradoras.
CREATE TABLE insurances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    coverage_percentage DECIMAL(5,2) NOT NULL -- DECIMAL para precisión monetaria
);

-- Crea la tabla de citas, que une a pacientes, doctores y aseguradoras.
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL, -- ID único externo
    appointment_date DATETIME NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    insurance_id INT NULL, -- NULL por si la cita no está asegurada
    treatment_code VARCHAR(50) NOT NULL,
    treatment_description VARCHAR(255),
    treatment_cost DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,

    -- Define restricciones de llave foránea (Foreign Keys) para asegurar integridad referencial.
    CONSTRAINT fk_patient
        FOREIGN KEY (patient_id) REFERENCES patients(id)
        ON DELETE CASCADE, -- Si se borra un paciente, se borran sus citas
    
    CONSTRAINT fk_doctor
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        ON DELETE CASCADE, -- Si se borra un doctor, se borran sus citas
    
    CONSTRAINT fk_insurance
        FOREIGN KEY (insurance_id) REFERENCES insurances(id)
        ON DELETE SET NULL -- Si se borra una aseguradora, el campo se pone en NULL
);