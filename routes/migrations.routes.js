const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migration.controller');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('archivo'), migrationController.migrateData);

module.exports = router;